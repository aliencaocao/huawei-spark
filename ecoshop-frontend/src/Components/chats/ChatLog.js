import { AppBar, Avatar, Box, Drawer, IconButton, ListItemText, TextField, Toolbar } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import SendIcon from '@mui/icons-material/Send';
import { blue } from "@mui/material/colors";
import MessageBubble from "./MessageBubble";
import { sendChatMessage } from "../../utility/chats/chat-websocket-message-senders";
import { useState } from "react";

const ChatLog = ({ openedChatLogId, openChatLog, chatData, messages, setMessages }) => {
  const {
    id: chatId,
    buyer,
    seller,
    name: productName,
    obs_image: productImageUrl,
    started: chatStartedTime,
  } = chatData;
  const tokenData = JSON.parse(window.token.split(".")[0]);

  const [newMessageText, setNewMessageText] = useState("");
  const [attachedImageId, setAttachedImageId] = useState("");
  // TODO: add state for attached image

  const sendChatMessageButWithFewerArguments = () => {
    sendChatMessage(chatId, buyer, seller, newMessageText, false, attachedImageId, setMessages);
  };

  const handleKeyDownInTextField = (event) => {
    if (event.key === "Enter") {
      sendChatMessageButWithFewerArguments();
      setNewMessageText("");
    }
  };

  return (
    <Drawer
      anchor="right"
      open={openedChatLogId === chatId}
      PaperProps={{ className: "chat-log" }}
    >
      <AppBar position="fixed">
        <Toolbar className="chat-log-toolbar">
          <IconButton onClick={() => openChatLog(null)}>
            <ArrowBackIcon></ArrowBackIcon>
          </IconButton>
          <Avatar
            className="chat-log-toolbar-avatar"
            src={new URL(productImageUrl, window.mediaURL).href}
          ></Avatar>
          <ListItemText
            primary={productName}
            secondary={
              buyer === tokenData.username ? `Seller: ${seller}` : `Buyer: ${buyer}`
            }
          />
        </Toolbar>
      </AppBar>
      
      <Box className="chat-log-messages">{
        Array.isArray(messages[chatId]) &&
        // create shallow copy and reverse it (doesn't mutate messages[chatId] itself)
        messages[chatId].map((message, messageIdx) => (
          <MessageBubble
            type={message.sender === tokenData.username ? "outgoing" : "incoming"}
            content={message.content}
            timestamp={message.sent}
            isAutoReply={message.answer_bot === 1}
            key={`${chatId};${messageIdx}`}
          />
        ))
      }</Box>
      
      <Box className="chat-log-bottom">
        <IconButton className="chat-log-attach-image-button">
          <ImageOutlinedIcon />
        </IconButton>
        <TextField
          value={newMessageText}
          onChange={(event) => setNewMessageText(event.target.value)}
          onKeyDown={handleKeyDownInTextField}
          label=""
          placeholder="Type your message..."
          fullWidth={true}
          className="chat-log-message-input"
        />
        <IconButton
          onClick={sendChatMessageButWithFewerArguments}
          className="chat-log-send-icon"
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Drawer>
  );
};

export default ChatLog;
