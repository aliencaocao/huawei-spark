import { Drawer } from "@mui/material";
import { Fragment } from "react";

const ListingDetails = ({ listing, setOpenListingId, drawerIsOpen }) => {
  return (
    <Fragment>
      <Drawer anchor="right" open={drawerIsOpen}>
        {Object.entries(listing).map(([k, v]) => <div key={k}>{k}:{v}</div>)}
      </Drawer>
      {Object.entries(listing).map(([k, v]) => <div key={k}>{k}:{v}</div>)}
    </Fragment>
  );
};

export default ListingDetails;
