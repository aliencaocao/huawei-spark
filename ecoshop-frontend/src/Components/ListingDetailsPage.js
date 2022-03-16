import { AppBar, Box, Button, ButtonBase, Drawer, IconButton, Toolbar } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import { Fragment, useState, useEffect } from "react";
import "../css/listing-page.css";

const ListingDetailsPage = ({ listingId, listingImageId, setOpenListingId, drawerIsOpen, navigate }) => {
  let tokenData;
  if (window.token) {
    tokenData = JSON.parse(window.token.split(".")[0]);
  }

  const [listingDetails, setListingDetails] = useState({});

  const fetchListingDetails = () => {
    fetch(`${window.globalURL}/product/info`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": window.token,
      },
      body: JSON.stringify({ product: listingId }),
    })
        .then((res) => res.json())
        .then(({ listingInfo }) => {
          setListingDetails(listingInfo);
        });
  };

  // fetch listing details on first render
  useEffect(fetchListingDetails, []);

  const startChat = () => {
    const urlParams = new URLSearchParams();
    urlParams.append("startChat", "true");
    urlParams.append("buyer", tokenData.username);
    urlParams.append("seller", listingDetails.owner);
    urlParams.append("isAutoReply", "1");
    urlParams.append("productId", listingDetails.id)

    navigate(`/chats?${urlParams.toString()}`);
  };

  return (
    <Drawer
      anchor="right"
      open={drawerIsOpen}
      PaperProps={{ className: "listing-page" }}
    >
      <AppBar className="listing-page-toolbar">
        <Toolbar>
          <IconButton onClick={() => setOpenListingId(null)} className="listing-page-toolbar-back-icon">
            <ArrowBackIcon></ArrowBackIcon>
          </IconButton>

          <div className="listing-page-title">Listing details</div>
        </Toolbar>
      </AppBar>

      <Box className="listing-page-main">
        <img src={window.mediaURL + listingImageId} className="listing-image" />
        <Box className="listing-page-main-text">
          <h1 className="listing-name title">{listingDetails.name}</h1>
          <h2 className="listing-price subtitle">${listingDetails.price}</h2>
          <h2 className="listing-quantity subtitle">
            {listingDetails.quantity} unit{listingDetails.quantity && listingDetails.quantity > 1 && "s"} remaining
          </h2>
          <h2 className="subtitle">Owned by {listingDetails.owner}</h2>
          <Button
            onClick={startChat}
            variant="contained"
            className="start-chat"
            size="large"
          ><ChatBubbleIcon />Start chat</Button>
          
          <Box className="listing-description">{listingDetails.description}</Box>

          <Box className="listing-tags">Tags:{
            listingDetails.tags ?
            listingDetails.tags.split(",").map((tag) => (
              <ButtonBase className="listing-tag" key={tag}>{tag}</ButtonBase>
            )) :
            " none"
          }</Box>
        </Box>
      </Box>
    </Drawer>
  );
};

export default ListingDetailsPage;
