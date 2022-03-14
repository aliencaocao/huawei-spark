import { AppBar, Avatar, Button, ButtonBase, CircularProgress, Divider, Drawer, IconButton, Input, InputAdornment, List, ListItem, ListItemAvatar, ListItemText, Tab, Tabs, TextField, Toolbar } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Fragment, useEffect, useState } from "react";
import { AccountCircle, Person } from "@mui/icons-material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import SwipeableViews from "react-swipeable-views/lib/SwipeableViews";
import "../../css/chats.css";
import ChatLog from "./ChatLog";
import { sendInit, loadChats, loadMessages } from "../../utility/chats/chat-websocket-message-senders";
import handleChatWebSocketMessage from "../../utility/chats/handle-chat-websocket-message";


const initChatWebSocketConnection = (setChats, setMessages) => {
  // connection will fail without trailing slash in WS server URL
  const CHAT_WEBSOCKET_URL = "wss://tkai.sieberrsec.tech/api/";
  window.chatWebSocket = new WebSocket(CHAT_WEBSOCKET_URL);
  window.chatWebSocket.addEventListener("message", (event) => {
    console.log(event.data);
    handleChatWebSocketMessage(event.data, setChats, setMessages);
  });
  window.chatWebSocket.addEventListener("open", sendInit);
};

const ChatList = (props) => {
  const [currentChatTab, setCurrentChatTab] = useState(0);
  const [openedChatLogId, openChatLog] = useState(null);
  const [chats, setChats] = useState({});
  const [messages, setMessages] = useState({});

  const handleTabChange = (event, newTabIdx) => {
    setCurrentChatTab(newTabIdx);
  };

  useEffect(() => {
    // run only on first render
    initChatWebSocketConnection(setChats, setMessages);
    window.chatWebSocket.addEventListener("open", loadChats);
  }, []);

  const createChatListItemFromChatData = (chatData) => {
    const {
      id: chatId,
      buyer,
      seller,
      name: productName,
      obs_image: productImageUrl,
      started: chatStartedTime,
    } = chatData;

    return (
      <Fragment key={chatId}>
        <ButtonBase onClick={() => openChatLog(chatId)} className="chat-row">
          <ListItem>
            <ListItemAvatar>
              <Avatar src={productImageUrl}></Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={productName}
              secondary={
                Array.isArray(messages[chatId]) && messages[chatId].length > 0 &&
                <div className="message-preview">{messages[chatId][0].sender}: {messages[chatId][0].content}</div>
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
              <IconButton onClick={() => openChatLog(null)}>
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
              Array.isArray(chats.withSellers) ?
                chats.withSellers.length > 0 ?
                  chats.withSellers.map(createChatListItemFromChatData) :
                  "No chats."
                :
              <CircularProgress className="chat-tab-loading-icon" />
            }</List>
          </TabPanel>
          <TabPanel value={1} className="chat-tab-panel">
            <List>{
              Array.isArray(chats.withBuyers) ?
                chats.withBuyers.length > 0 ?
                  chats.withBuyers.map(createChatListItemFromChatData) :
                  "No chats." 
                :
              <CircularProgress className="chat-tab-loading-icon" />
            }</List>
          </TabPanel>
        </SwipeableViews>
      </TabContext>
    </main>
  );
};

export default ChatList;
