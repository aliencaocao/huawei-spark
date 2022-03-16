const fastify = require('fastify')()
const ws = require('ws')
const cors = require("fastify-cors")
const mysql = require("mysql2/promise")
const RD = require("reallydangerous")
const fetch = require("node-fetch")
const { nanoid } = require("nanoid")
require('dotenv').config()

const socketList = {}
const signer = new RD.Signer(process.env.SECRET, process.env.SALT)

// Give the client 10 seconds to get authed, if not we will disconnect them
const kickTimeOut = async (socket) => {
  if ((!"isAuthed" in socket) || socket.isAuthed === false) {
    socket.terminate()
  }
}

const startup = async () => {
  const wss = new ws.Server({ server: fastify.server })
  const connection = await mysql.createConnection(JSON.parse(process.env.CONNECTION_STRING)) // MUST CONNECT IN VPC FOR DATABASE USAGE

  wss.on('connection', (socket) => {
    socket.id = nanoid()
    socket.isAlive = true
    socket.isAuthed = false
    socket.on('pong', () => { socket.isAlive = true }); // check for any clients that dced without informing the server
    setTimeout(() => { kickTimeOut(socket) }, 60000)
    socket.send(JSON.stringify({ type: "welcome", success: true, data: "connection-established" }));

    socket.on("message", async (msg) => {
      let data = {}
      try {
        data = JSON.parse(msg)
      }
      catch (e) {
        socket.send(JSON.stringify({ type: "auth", success: false, error: "invalid-json" }));
      }


      if (data.token === undefined) {
        socket.send(JSON.stringify({ type: "auth", success: false, error: "missing-auth" }));
        return socket.terminate()
      }
      let tokenData = {}
      try {
        tokenData = JSON.parse(signer.unsign(data.token.replace(/\\/g, ""))); // check token validity
      }
      catch (e) {
        socket.send(JSON.stringify({ type: "auth", success: false, error: "invalid-token" }));
        return socket.terminate()
      }

      if (data.action === "init") {
        socket.username = tokenData.username
        if (tokenData.username in socketList) socketList[tokenData.username].push(socket)
        else socketList[tokenData.username] = [socket]
        socket.isAuthed = true
        socket.send(JSON.stringify({ type: "init", success: true, data: "init-success" }));
      }
      else {
        if (!(tokenData.username in socketList)) {
          socket.send(JSON.stringify({ type: "auth", success: false, error: "missing-init" }));
        }
        if (data.action === "load-msgs") {
          const [rows, fields] = await connection.execute('SELECT `sender`, `recipient`, `content`, `sent`, `obs_image`, `answer_bot` FROM `chat_message` WHERE `chat_id` = ? AND (`recipient` = ? OR `sender` = ?) ORDER BY `id` DESC LIMIT 50 ', [data.chatID, tokenData.username, tokenData.username]);
          socket.send(JSON.stringify({ type: "load-msgs", success: true, data: { chatID: data.chatID, messages: rows } }))
        }
        else if (data.action === "load-chats") {
          const [rows, fields] = await connection.execute('SELECT `chat`.`id`, `buyer`, `seller`, `name`, `obs_image`, `started`, `answer_bot` FROM `chat` INNER JOIN `product` ON `product`.`id` = `chat`.`product` INNER JOIN `product_image` ON `product_image`.`product` = `product`.`id` WHERE (`buyer` = ? OR `seller` = ?) AND `product_image`.`order` = 1 ORDER BY `started`', [tokenData.username, tokenData.username]);
          socket.send(JSON.stringify({ type: "load-chats", success: true, data: rows }))
        }
        else if (data.action === "new-chat") {
          // answer_bot is "0" or "1" and determines whether answering bot is enabled in this chat
          const [rows, fields] = await connection.execute('INSERT INTO `chat` (`buyer`, `seller`, `answer_bot`, `product`) VALUES (?, ?, ?, ?) ', [data.buyer, data.seller, 1, data.productID]);
          socket.send(JSON.stringify({ type: "new-chat-created", success: true, chatID: rows.insertId }))

          // notify both parties that the new chat has been created
          if (data.buyer in socketList) {
            for (let i = 0; i < socketList[data.buyer].length; i++) {
              socketList[data.buyer][i].send(JSON.stringify({ type: "new-chat-notif", success: true, chatID: rows.insertId }))
            }
          }
          if (data.seller in socketList) {
            for (let i = 0; i < socketList[data.seller].length; i++) {
              socketList[data.seller][i].send(JSON.stringify({ type: "new-chat-notif", success: true, chatID: rows.insertId }))
            }
          }
        }
        else if (data.action === "product-sold") { // product-sold can only be issued by the seller
          // check if seller issued it
          const [checkSellerRows, checkSellerFields] = await connection.execute(
            "SELECT `buyer`, `points`, `type`, `quantity`, `chat`.`product` FROM `chat` INNER JOIN `product` ON `product`.`id` = `chat`.`product` WHERE `chat`.`id` = ? AND (`seller` = ?)",
            [data.chatID, tokenData.username],
          )

          console.log(checkSellerRows);

          if (checkSellerRows.length == 0) return;

          // decrement quantity if it's a product
          if (("quantity" in data) && (checkSellerRows[0].type === 1)) {
            await connection.execute(
              "UPDATE `product` SET `quantity` = ? WHERE `product`.`id` = ?",
              [checkSellerRows[0].quantity - data.quantity, checkSellerRows[0].product],
            )
          }

          // increase green points
          await connection.execute(
            "UPDATE `user` SET `green` = ? WHERE `user` = ? OR `user` = ?",
            [checkSellerRows[0].points, checkSellerRows[0].buyer, tokenData.username],
          )

          const currentTime = new Date()

          const msgData = {
            sender: tokenData.username,
            recipient: checkSellerRows[0].buyer,
            content: `Product / service sold! ${checkSellerRows[0].points} green points have been credited to the account.`,
            sent: currentTime,
            obs_image: "",
            answer_bot: 1,
          }

          if (checkSellerRows[0].buyer in socketList) {
            // send it to all of the sender sockets
            for (let i = 0; i < socketList[checkSellerRows[0].buyer].length; i++) {
              socketList[checkSellerRows[0].buyer][i].send(JSON.stringify({ type: "new-msg", success: true, data: msgData }))
            }
          }

          const [rows, fields] = await connection.execute(
            'INSERT INTO `chat_message` (`chat_id`, `sender`, `recipient`, `content`, `answer_bot`, `answer_bot_feedback`, `obs_image`, `sent`) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ',
            [data.chatID, tokenData.username, checkSellerRows[0].buyer, msgData.content, msgData.answer_bot, 0, "", currentTime],
          );
        }
        else if (data.action === "new-msg") {
          const [chatRows, chatFields] = await connection.execute('SELECT `id`, `buyer`, `seller` FROM `chat` WHERE `id` = ? AND (`buyer` = ? OR `seller` = ?)', [data.chatID, tokenData.username, tokenData.username])
          if (chatRows.length === 0) socket.send(JSON.stringify({ type: "new-msg", success: false, error: "missing-chat" }))
          let receipient = ""
          let isBuyer = false
          const currentTime = new Date()

          if (chatRows[0].buyer !== tokenData.username) receipient = chatRows[0].buyer
          else {
            // sender is the buyer and receipient is the seller
            receipient = chatRows[0].seller
            isBuyer = true
          }

          // answer_bot column is a "0" or "1" indicating whether this msg is an answer bot msg
          const [rows, fields] = await connection.execute('INSERT INTO `chat_message` (`chat_id`, `sender`, `recipient`, `content`, `answer_bot`, `answer_bot_feedback`, `obs_image`, `sent`) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ', [data.chatID, tokenData.username, receipient, data.content, data.answerBot, 0, data.obs_image, currentTime]);

          const msgData = {
            chatID: data.chatID,
            sender: tokenData.username,
            recipient: receipient,
            content: data.content,
            sent: currentTime,
            obs_image: data.obs_image,
            answer_bot: data.answerBot
          }

          if (tokenData.username in socketList) {
            // send it to all of the sender sockets
            for (let i = 0; i < socketList[tokenData.username].length; i++) {
              if (socketList[tokenData.username][i].id !== socket.id) {
                // send to all sender sockets except for the socket which sent the msg
                socketList[tokenData.username][i].send(JSON.stringify({ type: "new-msg", success: true, data: msgData }))
              }
            }
          }
          if (receipient in socketList) {
            // send it to all sockets of the receipient
            for (let i = 0; i < socketList[receipient].length; i++) {
              socketList[receipient][i].send(JSON.stringify({ type: "new-msg", success: true, data: msgData }))
            }

            // carry out QnA inference and send suggested response to seller
            let autoReplyContent

            const [checkEnabledRows, checkEnabledFields] = await connection.execute(
              "SELECT `description`, `answer_bot` FROM `chat` INNER JOIN `product` ON `product`.`id` = `chat`.`product` WHERE `chat`.`id` = ? AND (`buyer` = ?)",
              [data.chatID, tokenData.username],
            )
            console.log(checkEnabledRows)
            if (checkEnabledRows.length !== 1) return
            if (checkEnabledRows[0]["answer_bot"] === 0) return // if answering bot is not enabled, do not generate response

            let response = await fetch(process.env.QNA_URL, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-Apig-Appcode": process.env.APPCODE,
              },
              body: JSON.stringify({
                "source": checkEnabledRows[0]["description"],
                "prompt": "",
                "query": msgData.content,
              }),
              timeout: 5000,
            }).then(res => res.json())

            console.log(msgData);
            console.log(response);
      
            if (response.success) autoReplyContent = response.answer
            else return

            for (let i = 0; i < socketList[receipient].length; i++) {
              socketList[receipient][i].send(JSON.stringify({
                type: "suggestion",
                success: true,
                data: {
                  chatID: data.chatID,
                  suggestionText: autoReplyContent,
                }
              }))
            }
          }
          else {
            if (isBuyer) {
              // receipient is not online, send auto-reply msg if the receipient is a seller

              // TODO: Do some check if the seller enabled auto-reply bot
              // TODO: Call auto-reply endpoint if enabled
              /* 
               for (let i = 0; i < socketList[tokenData.username].length; i++) {
                socketList[data.buyer][i].send(JSON.stringify({ type: "new-msg", success: true, data: msgData }))
              }
              */

              // carry out QnA inference and send suggested response to seller
              let autoReplyContent

              const [checkEnabledRows, checkEnabledFields] = await connection.execute(
                "SELECT `description`, `answer_bot` FROM `chat` INNER JOIN `product` ON `product`.`id` = `chat`.`product` WHERE `chat`.`id` = ? AND (`buyer` = ?)",
                [data.chatID, tokenData.username],
              )
              console.log(checkEnabledRows)
              if (checkEnabledRows.length !== 1) return
              if (checkEnabledRows[0]["answer_bot"] === 0) return // if answering bot is not enabled, do not generate response

              let response = await fetch(process.env.QNA_URL, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "X-Apig-Appcode": process.env.APPCODE,
                },
                body: JSON.stringify({
                  "source": checkEnabledRows[0]["description"],
                  "prompt": "",
                  "query": msgData.content,
                }),
                timeout: 5000,
              }).then(res => res.json())

              console.log(msgData);
              console.log(response);
        
              if (response.success) autoReplyContent = response.answer
              else return

              const autoReplyMsg = {
                sender: receipient,
                recipient: tokenData.username,
                content: autoReplyContent,
                sent: new Date(),
                obs_image: "",
                answer_bot: 1
              }
              for (let i = 0; i < socketList[tokenData.username].length; i++) {
                socketList[tokenData.username][i].send(JSON.stringify({ type: "new-msg", success: true, data: autoReplyMsg }))
              }
              
              await connection.execute(
                'INSERT INTO `chat_message` (`chat_id`, `sender`, `recipient`, `content`, `answer_bot`, `answer_bot_feedback`, `obs_image`, `sent`) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ',
                [data.chatID, receipient, tokenData.username, autoReplyContent, 1, 0, "", currentTime],
              )
            }
          }

          socket.send(JSON.stringify({ type: "new-msg-sent", success: true }))


        }
      }
    })

    socket.on('close', (e) => {
      if (socket.username in socketList) {
        for (let i = 0; i < socketList[socket.username]; i++) {
          if (socket.readyState === ws.CLOSED) {
            socketList[socket.username].splice(i, 1)
            break
          }
        }
        if (socketList[socket.username].length === 0) delete socketList[socket.username]
      }
    })
  })



  // check for any clients that dced without informing the server
  const interval = setInterval(function ping() {
    wss.clients.forEach(function each(socket) {
      if (socket.isAlive === false) {
        if (socket.username in socketList) {
          for (let i = 0; i < socketList[socket.username]; i++) {
            if (socket.isAlive === false) {
              console.log("Closing connection due to inactivity")
              socketList[socket.username].splice(i, 1)
              break
            }
          }
          if (socketList[socket.username].length === 0) delete socketList[socket.username]
        }
        return socket.terminate();
      }

      socket.isAlive = false;
      socket.ping();
    });
  }, 30000);

  wss.on('close', function close() {
    clearInterval(interval);
  });

  await fastify.register(cors)

  try {
    await fastify.listen(20001, '0.0.0.0')
    console.log("Web server started")
  } catch (err) {
    console.log("Error starting web server... exiting")
    console.error(err)
    process.exit(1)
  }
}

startup()




