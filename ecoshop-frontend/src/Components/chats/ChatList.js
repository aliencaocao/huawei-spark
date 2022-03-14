import { AppBar, Avatar, Button, ButtonBase, CircularProgress, Divider, Drawer, IconButton, Input, InputAdornment, List, ListItem, ListItemAvatar, ListItemText, Tab, Tabs, TextField, Toolbar } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Fragment, useState } from "react";
import { AccountCircle, Person } from "@mui/icons-material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import SwipeableViews from "react-swipeable-views/lib/SwipeableViews";
import "../../css/chats.css";
import ChatLog from "./ChatLog";
import sendJsonMessageToWebSocket from "../../utility/send-json-message-to-websocket";
import handleChatWebSocketMessage from "../../utility/chats/handle-chat-websocket-message";
import wsMessageTypes from "../../utility/chats/chat-websocket-message-types";
const {
  requestTypes: {
    INIT,
    LOAD_CHATS,
    LOAD_MSGS,
    CREATE_NEW_CHAT,
    SEND_NEW_MSG,
  },
} = wsMessageTypes;

const token = window.localStorage.getItem("ecoshop-token");

let chatWebSocket = null;

const loadChats = () => {
  sendJsonMessageToWebSocket(chatWebSocket, { action: LOAD_CHATS, token });
};

const initChatWebSocketConnection = (setChats) => {
  // connection will fail without trailing slash in WS server URL
  const CHAT_WEBSOCKET_URL = "wss://tkai.sieberrsec.tech/api/";
  const chatWebSocket = new WebSocket(CHAT_WEBSOCKET_URL);
  chatWebSocket.addEventListener("message", (event) => {
    console.log(event.data);
    handleChatWebSocketMessage(event.data, setChats);
  });
  chatWebSocket.addEventListener("open", () => {
    sendJsonMessageToWebSocket(chatWebSocket, { action: INIT, token });
  });

  return chatWebSocket;
};

// const chats = {
//   withSellers: [
//     {
//       chatId: 1,
//       productName: "Product 1",
//       thumbnailUrl: "https://picsum.photos/100/200",
//       messages: [
//         // { author: "Them", text: "Message 1" },
//         // { author: "Them", text: "Message 2" },
//         // { author: "You", text: "Message 3" },
//       ]
//     },
//     {
//       chatId: 2,
//       productName: "Product 2",
//       thumbnailUrl: "https://picsum.photos/100/200",
//       messages: [
//         { author: "Them", text: "Message 1" },
//         { author: "Them", text: "Message 2" },
//         { author: "You", text: "Message 3" },
//       ]
//     }
//   ],
//   withBuyers: [
//     {
//       chatId: 3,
//       productName: "Faeces-Scented Perfume",
//       thumbnailUrl: "https://picsum.photos/100/200",
//       messages: [
//         { author: "theoleecj", text: "Message 1" },
//         { author: "theoleecj", text: "Message 2" },
//         { author: "You", text: "Message 3" },
//         { author: "theoleecj", text: "Extremely ridiculously unbelievably ludicrously long reply" },
//       ]
//     }
//   ],
// };

const ChatList = (props) => {
  const [currentChatTab, setCurrentChatTab] = useState(0);
  const [openedChatLogId, openChatLog] = useState(null);
  const [chats, setChats] = useState([]);

  const handleTabChange = (event, newTabIdx) => {
    setCurrentChatTab(newTabIdx);
  };

  // if ChatList gets re-rendered, don't re-initialize the connection
  if (chatWebSocket === null) {
    chatWebSocket = initChatWebSocketConnection(setChats);
    chatWebSocket.addEventListener("open", loadChats);
  }

  const createChatListItemFromChatData = (chatData) => {
    const { chatId, productName, thumbnailUrl, messages } = chatData;
    const mostRecentMessage = messages.length > 0 ? messages[messages.length - 1] : null;
  
    return (
      <Fragment key={chatId}>
        <ButtonBase onClick={() => openChatLog(chatId)} className="chat-row">
          <ListItem>
            <ListItemAvatar>
              <Avatar src={thumbnailUrl}></Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={productName}
              secondary={
                messages.length > 0 &&
                <div className="message-preview">{mostRecentMessage.author}: {mostRecentMessage.text}</div>
              }
            />
          </ListItem>
        </ButtonBase>
        
        {/* TODO: extract chat log Drawer component to ChatLog.js */}
        <Drawer
          anchor="right"
          open={openedChatLogId === chatId}
          PaperProps={{ className: "chat-log" }}
        >
          <AppBar position="fixed">
            <Toolbar className="chat-log-toolbar">
              <IconButton onClick={() => openChatLog(-1)}>
                <ArrowBackIcon></ArrowBackIcon>
              </IconButton>
              <ListItemText primary={productName} secondary={"Test"}></ListItemText>
            </Toolbar>
          </AppBar>
        </Drawer>
      </Fragment>
    );
  };

  return (
    <main>
      <h1>Chats</h1>
      <TextField
        InputProps={{
          startAdornment: <InputAdornment position="start"><SearchIcon></SearchIcon></InputAdornment>,
          className: "filter-chats-input",
        }}
        placeholder="Filter chats"
        variant="standard"
        fullWidth={true}
        id="filter-chats"
      />
      
      <TabContext value={currentChatTab}>
        <TabList onChange={handleTabChange}>
          <Tab value={0} label="With sellers" />
          <Tab value={1} label="With buyers" />
        </TabList>
        <SwipeableViews
          axis="x"
          index={currentChatTab}
          onChangeIndex={setCurrentChatTab}
        >
          <TabPanel value={0} className="chat-tab-panel">
            <List>{
              typeof chats.withSellers === "undefined" ?
              <CircularProgress className="chat-tab-loading-icon" /> :
              chats.withSellers.map(createChatListItemFromChatData)
            }</List>
          </TabPanel>
          <TabPanel value={1} className="chat-tab-panel">
            <List>{
              typeof chats.withBuyers === "undefined" ?
              <CircularProgress className="chat-tab-loading-icon" /> :
              chats.withBuyers.map(createChatListItemFromChatData)
            }</List>
          </TabPanel>
        </SwipeableViews>
      </TabContext>
    </main>
  );
};

export default ChatList;
