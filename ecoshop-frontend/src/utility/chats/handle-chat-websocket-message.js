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

const { token } = window;
let tokenData;
if (token !== null) {
  tokenData = JSON.parse(token.split(".")[0]);
}

const handleChatWebSocketMessage = (message, setChats) => {
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
      break;

    case MSGS_LOADED:
        

      break;
  }
};

export default handleChatWebSocketMessage;
