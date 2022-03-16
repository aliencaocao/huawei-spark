export default {
  requestTypes: {
    INIT: "init",
    LOAD_CHATS: "load-chats",
    LOAD_MSGS: "load-msgs",
    CREATE_NEW_CHAT: "new-chat",
    SEND_NEW_MSG: "new-msg",
    COMPLETE_TRANSACTION: "product-sold",
  },
  responseTypes: {
    INIT_SUCCESS: "init",
    CHATS_LOADED: "load-chats",
    MSGS_LOADED: "load-msgs",
    NEW_CHAT_CREATED: "new-chat-created",
    NEW_MSG_SENT: "new-msg-sent",
  },
  eventTypes: {
    NEW_CHAT_NOTIF: "new-chat-notif",
    NEW_MSG_NOTIF: "new-msg",
    AUTO_REPLY_SUGGESTION: "suggestion",
  }
};
