import { AppBar, Box, Button, ButtonBase, Drawer, IconButton, Toolbar } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Fragment, useState, useEffect } from "react";
import "../css/listing-page.css";

const ListingDetailsPage = ({ listingId, listingImageId, setOpenListingId, drawerIsOpen }) => {
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
          console.log(listingInfo);
        });
  };

  // fetch listing details on first render
  useEffect(fetchListingDetails, []);

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
          <h2 className="listing-quantity subtitle">{listingDetails.quantity} units remaining</h2>
          <h2 className="subtitle">Owned by {listingDetails.owner}</h2>
          
          <Box className="listing-description">{listingDetails.description}</Box>

          <Box className="listing-tags">Tags:{
            listingDetails.tags ?
            listingDetails.tags.split(",").map((tag) => (
              <ButtonBase className="listing-tag">{tag}</ButtonBase>
            )) :
            " none"
          }</Box>
          {/* {Object.entries(listingDetails).map(([k, v]) => <div key={k}>{k}:{v}</div>)} */}
        </Box>
      </Box>
    </Drawer>
  );
};

export default ListingDetailsPage;
