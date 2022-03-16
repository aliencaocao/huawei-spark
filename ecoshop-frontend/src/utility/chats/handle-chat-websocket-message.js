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
    AUTO_REPLY_SUGGESTION,
  },
} = wsMessageTypes;

const handleChatWebSocketMessage = (message, setChats, setMessages, setAutoReplySuggestion) => {
  const tokenData = JSON.parse(window.token.split(".")[0]);

  const parsedWebSocketMessage = JSON.parse(message);
  if (!parsedWebSocketMessage.success) {
    console.error("message.success is not true. Message:", message);
    return;
  }

  switch (parsedWebSocketMessage.type) {
    case INIT_SUCCESS:
      console.log("Init successful");
      break;
    
    case CHATS_LOADED:
      console.log("Chats loaded");

      const chats = { withSellers: {}, withBuyers: {} };
      for (const chat of parsedWebSocketMessage.data) {
        if (chat.buyer === tokenData.username) {
          // user is buyer, so they are talking to a seller
          chats.withSellers[chat.id] = chat;
          // chats.withSellers.push(chat);
        } else if (chat.seller === tokenData.username) {
          // user is seller, so they are talking to a buyer
          chats.withBuyers[chat.id] = chat;
          // chats.withBuyers.push(chat);
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

    case NEW_CHAT_NOTIF:
      break;

    case NEW_MSG_NOTIF:
      console.log("New message received");

      const newMessage = parsedWebSocketMessage.data;
      setMessages((oldMessages) => {
        // unshift, not push, because most recent message comes first
        oldMessages[newMessage.chatID].unshift(newMessage);
        // state update is ignored if new and old state have the same reference
        // so construct a new object and return it
        return { ...oldMessages };
      });
      break;

    case AUTO_REPLY_SUGGESTION:
      // this is to prevent "cannot redeclare block-scoped variable chatId"
      // because it was also declared in an above case
      {
        console.log("Auto-reply suggestion received");
      
        const { chatID: chatId, suggestionText } = parsedWebSocketMessage.data;
        window.autoReplySuggestionSetters[chatId](suggestionText);

        break;
      }
  }
};

export default handleChatWebSocketMessage;
