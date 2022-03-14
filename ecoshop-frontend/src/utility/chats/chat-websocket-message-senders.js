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

export { sendInit, loadChats, loadMessages };
