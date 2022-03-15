import { loadMessages } from "./chat-websocket-message-senders";
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
  const tokenData = JSON.parse(window.token.split(".")[0]);

  const parsedWebSocketMessage = JSON.parse(message);

  switch (parsedWebSocketMessage.type) {
    case INIT_SUCCESS:
      console.log("Init successful");
      break;
    
    case CHATS_LOADED:
      console.log("Chats loaded");

      const chats = { withSellers: [], withBuyers: [] };
      for (const chat of parsedWebSocketMessage.data) {
        if (chat.buyer === tokenData.username) {
          // user is buyer, so they are talking to a seller
          chats.withSellers.push(chat);
        } else if (chat.seller === tokenData.username) {
          // user is seller, so they are talking to a buyer
          chats.withBuyers.push(chat);
        } else {
          throw Error("User is neither buyer nor seller in this chat.");
        }
        
        loadMessages(chat.id);
      }
      setChats(chats);
      break;

    case MSGS_LOADED:
      console.log("Messages loaded");
      
      const messages = {};
      const chatId = parsedWebSocketMessage.data.chatID;
      if (typeof messages[chatId] === "undefined") {
        messages[chatId] = [];
      }
      for (const message of parsedWebSocketMessage.data.messages) {
        messages[chatId].push(message);
      }
      setMessages((oldMessages) => ({ ...oldMessages, ...messages }));
      break;
  }
};

export default handleChatWebSocketMessage;
