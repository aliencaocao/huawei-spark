import { Paper, Grow } from "@mui/material";
import { Fragment, useState } from "react";
import { AccountCircle, Person } from "@mui/icons-material";
import { blue } from '@mui/material/colors';
import ContentCopyTwoTone from '@mui/icons-material/ContentCopyTwoTone';
import AddCircleTwoTone from '@mui/icons-material/AddCircleTwoTone';
import "./../css/create.css"

const Create = (props) => {
  const [page, setPage] = useState("options");

  return (
    <div className='fadeIn' style={{ overflowY: "auto", padding: "1ch" }}>
      <div className="video-container-style" style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", textAlign: "center" }}>
        {page === "options" && (

          <div>
            <h1>Create:</h1>
            <Paper onClick={() => { setPage("bulk-listing") }} elevation={16} style={{ padding: "2ch", display: "flex", alignItems: "center", justifyContent: "center", width: "80vw", flexDirection: "column", backgroundColor: "" }}>
              <ContentCopyTwoTone style={{ color: blue[500], fontSize: "5ch" }} />
              <h1 className="bulk-text">Bulk Listing </h1>
              <span>Create multiple listings with completed information from just one image. <br /><br /> Powered by EchoShop's AI algorithms.</span>
            </Paper>
            <Paper onClick={() => { setPage("normal-listing") }} elevation={16} style={{ padding: "2ch", display: "flex", marginBottom: "5ch", alignItems: "center", justifyContent: "center", marginTop: "5vh", width: "80vw", flexDirection: "column" }}>
              <AddCircleTwoTone style={{ color: blue[500], fontSize: "5ch" }} />
              <h2 className="normal-text">Normal Listing</h2>
              <span>Create 1 listing by inputting details.</span>
            </Paper>
          </div>

        )}
        {page === "bulk-listing" && (
          <Grow in={true}>
            <div>
              <h1>Bulk Listing Creation</h1>
            </div>
          </Grow>
        )}
        {page === "normal-listing" && (
          <h1>Normal Listing</h1>
        )}
      </div>
    </div>
  );
};

export default Create;
