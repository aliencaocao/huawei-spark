import { AppBar, Avatar, Button, ButtonBase, CircularProgress, Divider, Drawer, FormControlLabel, IconButton, Input, InputAdornment, List, ListItem, ListItemAvatar, ListItemText, Switch, Tab, Tabs, TextField, Toolbar } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Fragment, useEffect, useState } from "react";
import { AccountCircle, Person } from "@mui/icons-material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import SwipeableViews from "react-swipeable-views/lib/SwipeableViews";
import "../../css/chats.css";
import ChatLog from "./ChatLog";
import { sendInit, loadChats, sendToggleAutoReply } from "../../utility/chats/chat-websocket-message-senders";
import handleChatWebSocketMessage from "../../utility/chats/handle-chat-websocket-message";

const ChatList = (props) => {
  const [currentChatTab, setCurrentChatTab] = useState(0);
  const [openedChatLogId, openChatLog] = useState(null);
  const [chats, setChats] = useState({});
  const [messages, setMessages] = useState({});

  let tokenData;
  if (window.token) {
    tokenData = JSON.parse(window.token.split(".")[0]);
  }

  const initChatWebSocketConnection = () => {
    // connection will fail without trailing slash in WS server URL
    const CHAT_WEBSOCKET_URL = "wss://tkai.sieberrsec.tech/api/";
    window.chatWebSocket = new WebSocket(CHAT_WEBSOCKET_URL);
    window.chatWebSocket.addEventListener("message", (event) => {
      console.log(event.data);
      handleChatWebSocketMessage(event.data, setChats, setMessages);
    });
    window.chatWebSocket.addEventListener("open", sendInit);
  };

  useEffect(() => {
    // run only on first render
    initChatWebSocketConnection(setChats, setMessages);
    window.chatWebSocket.addEventListener("open", loadChats);
  }, []);

  const createChatListItemFromChatData = ([chatId, chatData]) => {
    chatId = Number(chatId);

    const {
      seller,
      name: productName,
      obs_image: productImageUrl,
      answer_bot: isAutoReply,
    } = chatData;

    return (
      <Fragment key={chatId}>
        <ButtonBase onClick={() => openChatLog(chatId)} className="chat-row">
          <ListItem>
            <ListItemAvatar>
              <Avatar src={new URL(productImageUrl, window.mediaURL).href}></Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={productName}
              secondary={
                Array.isArray(messages[chatId]) && messages[chatId].length > 0 &&
                <div className="message-preview">{messages[chatId][0].sender}: {messages[chatId][0].content}</div>
              }
            />
          </ListItem>

          {seller === tokenData.username &&
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={isAutoReply}
                onChange={(event) => {
                  setChats((oldChats) => {
                    oldChats.withBuyers[chatId].answer_bot = Number(event.target.checked);
                    return { ...oldChats };
                  });
                  
                  // TODO: the below function is currently a no-op
                  // make it send a request to toggle auto-reply
                  sendToggleAutoReply(chatId);
                }}
                onClick={(event) => event.stopPropagation()}
              />
            }
            label="Auto-reply"
            labelPlacement="end"
            className="auto-reply-switch-label"
          />}
        </ButtonBase>

        <ChatLog
          openedChatLogId={openedChatLogId}
          openChatLog={openChatLog}
          chatData={chatData}
          messages={messages}
          setMessages={setMessages}
        />
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
        <TabList onChange={(event, newTabIdx) => setCurrentChatTab(newTabIdx)}>
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
              typeof chats.withSellers === "object" ?
                Object.keys(chats.withSellers).length > 0 ?
                  Object.entries(chats.withSellers).map(createChatListItemFromChatData) :
                  "No chats."
                :
              <CircularProgress className="chat-tab-loading-icon" />
            }</List>
          </TabPanel>
          <TabPanel value={1} className="chat-tab-panel">
            <List>{
              // Array.isArray(chats.withBuyers) ?
              //   chats.withBuyers.length > 0 ?
              //     chats.withBuyers.map(createChatListItemFromChatData) :
              //     "No chats." 
              typeof chats.withBuyers === "object" ?
                Object.keys(chats.withBuyers).length > 0 ?
                  Object.entries(chats.withBuyers).map(createChatListItemFromChatData) :
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
