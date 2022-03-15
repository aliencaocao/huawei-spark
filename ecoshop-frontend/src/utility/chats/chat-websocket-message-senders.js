import sendJsonMessageToWebSocket from "../send-json-message-to-websocket";
import webSocketMessageTypes from "../../utility/chats/chat-websocket-message-types";
const {
  requestTypes: {
    INIT,
    LOAD_CHATS,
    LOAD_MSGS,
    CREATE_NEW_CHAT,
    SEND_NEW_MSG,
  },
} = webSocketMessageTypes;

const sendInit = () => {
  sendJsonMessageToWebSocket(window.chatWebSocket, {
    action: INIT,
    token: window.token,
  });
};

const loadChats = () => {
  sendJsonMessageToWebSocket(window.chatWebSocket, {
    action: LOAD_CHATS,
    token: window.token,
  });
};

const loadMessages = (chatId) => {
  sendJsonMessageToWebSocket(window.chatWebSocket, {
    action: LOAD_MSGS,
    token: window.token,
    chatID: chatId,
  });
};

const sendChatMessage = (
  chatId,
  buyer,
  seller,
  messageText,
  isAutoReply,
  obsImageId,
  setMessages
) => {
  const tokenData = JSON.parse(window.token.split(".")[0])

  const newMessage = {
    content: messageText,
    obs_image: obsImageId,
    answerBot: Number(isAutoReply),
  };

  sendJsonMessageToWebSocket(window.chatWebSocket, {
    action: SEND_NEW_MSG,
    token: window.token,
    chatID: chatId,
    ...newMessage,
  });
  
  setMessages((oldMessages) => {
    // unshift, not push, because most recent message comes first
    oldMessages[chatId].unshift({
      ...newMessage,
      sender: tokenData.username,
      recipient: buyer === tokenData.username ? seller : buyer,
      sent: new Date().toISOString(),
    });

    // state update is ignored if new and old state have the same reference
    // so construct a new object and return it
    return { ...oldMessages };
  });
};

const sendToggleAutoReply = (chatId) => {
  // TODO: send request to toggle auto-reply for given chatId
};

export {
  sendInit,
  loadChats,
  loadMessages,
  sendChatMessage,
  sendToggleAutoReply
};
