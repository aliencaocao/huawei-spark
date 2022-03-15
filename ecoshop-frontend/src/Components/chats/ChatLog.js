import { AppBar, Avatar, Box, Drawer, IconButton, ListItemText, TextField, Toolbar } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import SendIcon from '@mui/icons-material/Send';
import { blue } from "@mui/material/colors";

const ChatLog = ({ openedChatLogId, openChatLog, chatData, messages }) => {
  const {
    id: chatId,
    buyer,
    seller,
    name: productName,
    obs_image: productImageUrl,
    started: chatStartedTime,
  } = chatData;

  const tokenData = JSON.parse(window.token.split(".")[0]);
  
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
              buyer === tokenData.username
              ? `Seller: ${seller}`
              : `Buyer: ${buyer}`
            }
          />
        </Toolbar>
      </AppBar>
      
      <Box>

      </Box>
      
      <Box className="chat-log-bottom">
        <IconButton className="chat-log-attach-image-button">
          <ImageOutlinedIcon />
        </IconButton>
        <TextField
          label=""
          placeholder="Type your message..."
          fullWidth={true}
          className="chat-log-message-input"
        />
        <IconButton sx={{ backgroundColor: blue[500], ":hover": { backgroundColor: blue[500] } }}>
          <SendIcon />
        </IconButton>
      </Box>
    </Drawer>
  );
};

export default ChatLog;
