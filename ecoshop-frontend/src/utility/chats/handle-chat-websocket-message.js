import wsMessageTypes from "./chat-websocket-message-types";
const {
  responseTypes: {
    INIT_SUCCESS,
    CHATS_LOADED,
    MSGS_LOADED,
    NEW_CHAT_CREATED,
    NEW_MSG_SENT,
  },
  eventTypes: {
    NEW_CHAT_NOTIF,
    NEW_MSG_NOTIF,
  },
} = wsMessageTypes;

const handleChatWebSocketMessage = (message, setChats, setMessages) => {
  const token = window.token;
  let tokenData;
  if (typeof token !== "undefined" && token !== null) {
    tokenData = JSON.parse(token.split(".")[0]);
  }

  const parsedMessage = JSON.parse(message);

  switch (parsedMessage.type) {
    case INIT_SUCCESS:
      console.log("Init successful");
      break;
    
    case CHATS_LOADED:
      console.log("Chats loaded");

      const chats = { withSellers: [], withBuyers: [] };
      for (const chat of parsedMessage.data) {
        if (chat.buyer === tokenData.username) {
          // user is buyer, so they are talking to a seller
          chats.withSellers.push(chat);
        } else if (chat.seller === tokenData.username) {
          // user is seller, so they are talking to a buyer
          chats.withBuyers.push(chat);
        } else {
          throw Error("User is neither buyer nor seller in this chat.");
        }
      }
      
      setChats(chats);

      // setTimeout(() => {
      //   // UI update of chats is deferred to next render or something???
      //   // Doesn't happen immediately when setChats is called
      //   setChats(newChats);
      // }, 1000);
      break;

    case MSGS_LOADED:
      console.log("Messages loaded");

      /*
      for (const )
      */

      break;
  }
};

export default handleChatWebSocketMessage;
