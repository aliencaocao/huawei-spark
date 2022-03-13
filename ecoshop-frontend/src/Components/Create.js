import { Paper, Grow, Button } from "@mui/material";
import { Fragment, useState } from "react";
import { useSnackbar } from 'notistack';
import { blue } from '@mui/material/colors';
import ContentCopyTwoTone from '@mui/icons-material/ContentCopyTwoTone';
import AddCircleTwoTone from '@mui/icons-material/AddCircleTwoTone';
import ArrowCircleLeftOutlined from '@mui/icons-material/ArrowCircleLeftOutlined';
import CloudUploadOutlined from '@mui/icons-material/CloudUploadOutlined';

import { DropzoneArea } from 'material-ui-dropzone';
import "./../css/create.css"

const Create = (props) => {
  const [page, setPage] = useState("options");
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  return (
    <div className='fadeIn' style={{ overflowY: "auto", padding: "1ch" }}>
      <div className="video-container-style" style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", textAlign: "center" }}>
        {page === "options" && (
          <Grow in={true}>
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
          </Grow>

        )}
        {page === "bulk-listing" && (
          <Grow in={true}>
            <div>
              <h1 className="bulk-text">Bulk Listing Creation</h1>
              <h3>Step 1</h3>
              <DropzoneArea
                acceptedFiles={['image/*']}
                dropzoneText={"Tap to upload an image"}
                Icon={() => <CloudUploadOutlined style={{ fontSize: "10ch", color: blue[500] }} />}
                filesLimit={1}
                maxFileSize={20000000}
                dropzoneClass="dropzone-class"
                showPreviewsInDropzone={false}
                onChange={(files) => console.log('Files:', files)}
                onDropRejected={(e) => {
                  enqueueSnackbar("Oops. Please upload a valid image that is < 20MB", {
                    variant: 'error',
                    autoHideDuration: 2500
                  })
                }}
                showAlerts={false}
              />
              <Button onClick={() => { setPage("options") }} variant="outlined" startIcon={<ArrowCircleLeftOutlined />}>
                Back
              </Button>
            </div>
          </Grow>
        )}
        {page === "normal-listing" && (
          <Grow in={true}>
            <div>
              <h1>Normal Listing Creation</h1>
              <Button onClick={() => { setPage("options") }} variant="outlined" startIcon={<ArrowCircleLeftOutlined />}>
                Back
              </Button>
            </div>
          </Grow>
        )}
      </div>
    </div>
  );
};

export default Create;
