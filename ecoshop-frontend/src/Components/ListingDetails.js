import { AppBar, Box, Drawer, IconButton, Toolbar } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Fragment } from "react";
import "../css/listing-page.css";

const ListingDetails = ({ listing, setOpenListingId, drawerIsOpen }) => {
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
      {Object.entries(listing).map(([k, v]) => <div key={k}>{k}:{v}</div>)}
    </Drawer>
  );
};

export default ListingDetails;
