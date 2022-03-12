import { Avatar, ButtonBase, Divider, Input, InputAdornment, List, ListItem, ListItemAvatar, ListItemText, Tab, Tabs, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { Fragment, useState } from "react";
import { AccountCircle, Person } from "@mui/icons-material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import SwipeableViews from "react-swipeable-views/lib/SwipeableViews";
import "../css/chats.css";

const styles = (theme) => ({
  chatTabPanel: {
    padding: 0,
  },
});

const Chats = (props) => {
  const [currentChatTab, setCurrentChatTab] = useState(0);

  const handleTabChange = (event, newTabIdx) => {
    setCurrentChatTab(newTabIdx);
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
            <List>
              <ButtonBase className="chat-row">
                <ListItem>
                  <ListItemAvatar>
                    <Avatar src={require("../assets/fragrance.png")} />
                  </ListItemAvatar>
                  <ListItemText
                    primary="Product 1"
                    secondary={
                      <div className="message-preview">You: Stop ripping me off</div>
                    }
                  />
                </ListItem>
              </ButtonBase>
              <ButtonBase className="chat-row">
                <ListItem>
                  <ListItemAvatar>
                    <Avatar src={require("../assets/fragrance.png")} />
                  </ListItemAvatar>
                  <ListItemText
                    primary="Product 2"
                    secondary={
                      <div className="message-preview">You: Stop ripping me off</div>
                    }
                  />
                </ListItem>
              </ButtonBase>
            </List>
          </TabPanel>
          <TabPanel value={1} className="chat-tab-panel">
            <List>
              <ButtonBase className="chat-row">
                <ListItem>
                  <ListItemAvatar>
                    <Avatar src={require("../assets/fragrance.png")} />
                  </ListItemAvatar>
                  <ListItemText
                    primary="Faeces-Scented Perfume"
                    secondary={
                      <div className="message-preview">Extremely ridiculously unbelievably ludicrously long reply</div>
                    }
                  />
                </ListItem>
              </ButtonBase>
            </List>
          </TabPanel>
        </SwipeableViews>
      </TabContext>

      {/* <Tabs value={currentChatTab} onChange={handleTabChange}>
        <Tab value="0" label="With sellers" />
        <Tab value="1" label="With buyers" />
      </Tabs>
      <TabPanel value="0">
        <List>
          <ListItem>
            <ListItemAvatar>
              <Person />
            </ListItemAvatar>
            <ListItemText primary="Seller 1" secondary="Previous message to Seller 1" />
          </ListItem>
        </List>
      </TabPanel>
      <TabPanel value="1">
        <List>
          <ListItem>
            <ListItemAvatar>
              <Person />
            </ListItemAvatar>
            <ListItemText primary="Buyer 1" secondary="Previous message to Buyer 1" />
          </ListItem>
        </List>
      </TabPanel> */}
    </main>
  );
};

export default Chats;
