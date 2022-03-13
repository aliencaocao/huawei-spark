const fastify = require('fastify')()
const ws = require('ws')
const cors = require("fastify-cors");
const mysql = require("mysql2/promise");
const RD = require("reallydangerous");
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
        nanoid.random()
        socket.id = nanoid()
        socket.isAlive = true
        socket.isAuthed = false
        socket.on('pong', () => { socket.isAlive = true }); // check for any clients that dced without informing the server
        setTimeout(() => { kickTimeOut(socket) }, 20000)
        socket.send(JSON.stringify({ type: "welcome", success: true, data: "connection-established" }));

        socket.on("message", async (msg) => {
            const data = JSON.parse(msg)
            if (data.token === undefined) {
                socket.send(JSON.stringify({ type: "auth", success: false, data: "missing-auth" }));
                return socket.terminate()
            }
            let tokenData = {}
            try {
                tokenData = JSON.parse(signer.unsign(data.token.replace(/\\/g, ""))); // check token validity
            }
            catch (e) {
                socket.send(JSON.stringify({ type: "auth", success: false, data: "invalid-token" }));
                return socket.terminate()
            }

            if (data.action === "init") {
                socket.username = tokenData.username
                if (tokenData.username in socketList) socketList[tokenData.username].push(socket)
                else socketList[tokenData.username] = [socket]
            }
            else {
                if (!(tokenData.username in socketList)) {
                    socket.send(JSON.stringify({ type: "auth", success: false, data: "missing-init" }));
                }
                if (data.action === "load-msgs") {
                    const [rows, fields] = await connection.execute('SELECT `sender`, `recipient`, `content`, `sent`, `obs_image`, `answer_bot` FROM `chat_message` WHERE `chat_id` = ? AND (`recipient` = ? OR `sender` = ?) ORDER BY `id` DESC LIMIT 50 ', [data.chatID, tokenData.username, tokenData.username]);
                    socket.send(JSON.stringify({ type: "load-msgs", success: true, data: rows }))
                }
                else if (data.action === "load-chats") {
                    const [rows, fields] = await connection.execute('SELECT `chat`.`id`, `buyer`, `seller`, `name`, `obs_image`, `started` FROM `chat` INNER JOIN `product` ON `product`.`id` = `chat`.`product` INNER JOIN `product_image` ON `product_image`.`product` = `product`.`id` WHERE (`buyer` = ? OR `seller` = ?) AND `product_image`.`order` = 1 ORDER BY `started`', [tokenData.username, tokenData.username]);
                    socket.send(JSON.stringify({ type: "load-chats", success: true, data: rows }))
                }
                else if (data.action === "new-chat") {
                    // answer_bot is "0" or "1" and determines whether answering bot is enabled in this chat
                    const [rows, fields] = await connection.execute('INSERT INTO `chat` (`buyer`, `seller`, `answer_bot`, `product`) VALUES (?, ?, ?, ?) ', [data.buyer, data.seller, data.answerBot, data.productID]);
                    socket.send(JSON.stringify({ type: "new-chat-created", success: true }))

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
                    const [rows, fields] = await connection.execute('INSERT INTO `chat_message` (`chat_id`, `sender`, `recipient`, `content`, `answer_bot`, `answer_bot_feedback`, `obs_image`, `sent`) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ', [data.chatID, tokenData.username, receipient, data.content, data.answerBot, "", data.obs_image, currentTime]);

                    const msgData = {
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
                            const autoReplyMsg = {
                                sender: receipient,
                                recipient: tokenData.username,
                                content: "auto-reply content",
                                sent: new Date(),
                                obs_image: "",
                                answer_bot: 1
                            }
                            for (let i = 0; i < socketList[tokenData.username].length; i++) {
                                socketList[tokenData.username][i].send(JSON.stringify({ type: "new-msg", success: true, data: autoReplyMsg }))
                            }
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




