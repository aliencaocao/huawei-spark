import { AppBar, Avatar, Box, Button, ButtonBase, Dialog, DialogActions, DialogContent, DialogTitle, Drawer, IconButton, ListItemText, TextField, Toolbar } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import SendIcon from '@mui/icons-material/Send';
import { blue } from "@mui/material/colors";
import MessageBubble from "./MessageBubble";
import { sendChatMessage, sendCompleteTransaction } from "../../utility/chats/chat-websocket-message-senders";
import { useState, Fragment } from "react";

const ChatLog = ({ chatLogIsOpen, openChatLog, chatData, messages, setMessages }) => {
  const {
    id: chatId,
    buyer,
    seller,
    name: productName,
    obs_image: productImageUrl,
    started: chatStartedTime,
  } = chatData;
  const tokenData = JSON.parse(window.token.split(".")[0]);

  const [completeTransactionDialogOpen, setCompleteTransactionDialogOpen] = useState(false);
  const [quantitySoldString, setQuantitySoldString] = useState("");
  const [newMessageText, setNewMessageText] = useState("");
  const [attachedImageId, setAttachedImageId] = useState("");
  const [autoReplySuggestion, setAutoReplySuggestion] = useState("");
  if (!Array.isArray(window.autoReplySuggestionSetters)) {
    window.autoReplySuggestionSetters = [];
  }
  window.autoReplySuggestionSetters[chatId] = setAutoReplySuggestion;
  // TODO: add state for attached image

  const sendChatMessageAndCleanUpUi = () => {
    if (newMessageText !== "") {
      sendChatMessage(chatId, buyer, seller, newMessageText, false, attachedImageId, setMessages);
      setNewMessageText("");
      setAutoReplySuggestion("");
    }
  };

  const handleKeyDownInTextField = (event) => {
    if (event.key === "Enter") {
      sendChatMessageAndCleanUpUi();
    }
  };

  const handleCompleteTransactionDialogClose = () => {
    const quantitySold = parseInt(quantitySoldString);
    if (!isNaN(quantitySold) && quantitySold > 0) {
      sendCompleteTransaction(chatId, quantitySold);
      setCompleteTransactionDialogOpen(false);
    }
  };

  return (
    <Fragment>
      <Dialog
        open={completeTransactionDialogOpen}
        onClose={handleCompleteTransactionDialogClose}
        className="complete-transaction-dialog"
      >
        <DialogTitle>Complete transaction</DialogTitle>
        <DialogContent>
          <TextField
            value={quantitySoldString}
            // type="number"
            onChange={(event) => setQuantitySoldString(event.target.value)}
            inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
            placeholder="Quantity of item sold"
            variant="standard"
            fullWidth={true}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCompleteTransactionDialogClose}>Cancel</Button>
          <Button onClick={handleCompleteTransactionDialogClose}>Complete</Button>
        </DialogActions>
      </Dialog>

      <Drawer
        anchor="right"
        open={chatLogIsOpen}
        PaperProps={{ className: "chat-log" }}
      >
        <AppBar className="chat-log-toolbar">
          <Toolbar>
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

            {seller === tokenData.username &&
            <Button
              variant="outlined"
              size="small"
              onClick={() => setCompleteTransactionDialogOpen(true)}
              className="chat-log-toolbar-complete-transaction"
            >Complete transaction</Button>}
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
          {
            seller === tokenData.username &&
            autoReplySuggestion !== "" &&
            <Box className="auto-reply-suggestion">
              Suggested reply:&nbsp;
              <ButtonBase onClick={() => {
                setNewMessageText(autoReplySuggestion);
                setAutoReplySuggestion("");
              }}>{autoReplySuggestion}</ButtonBase>
            </Box>
          }
          <Box className="chat-log-bottom-main">
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
              onClick={sendChatMessageAndCleanUpUi}
              className="chat-log-send-icon"
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Box>
      </Drawer>
    </Fragment>
  );
};

export default ChatLog;
