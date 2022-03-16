import { Button, CircularProgress, Input } from "@mui/material";
import VideocamIcon from '@mui/icons-material/Videocam';
import { Fragment, useState } from "react";

const AddVideoButton = ({ listingId }) => {
  const [uploadInProgress, setUploadInProgress] = useState(false);

  const handleVideoSubmit = async (event) => {
    const videoFile = event.target.files[0];
    if (!videoFile.type.includes("video")) {
      return;
    }

    setUploadInProgress(true);

    const {
      uploadParams: {
        SignedUrl: uploadUrl,
        ActualSignedRequestHeaders: {
          "Content-Type": mimeTypeToUse,
        },
      },
    } = await fetch(`${window.globalURL}/upload`, {
      method: "POST",
      headers: { "Authorization": window.token },
      body: JSON.stringify({
        type: "video",
        product: listingId,
      }),
    }).then((res) => res.json());

    fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": mimeTypeToUse },
      body: videoFile,
    }).then(() => {
      setUploadInProgress(false);
    });
  };

  return (
    <Button
      variant="outlined"
      size="medium"
      component="label"
      className="profile-listing-add-video-button"
    >
      {uploadInProgress ? <CircularProgress size={24.5} /> : (
        <Fragment>
          <VideocamIcon />Add video
          <Input
            type="file"
            sx={{ display: "none" }}
            inputProps={{
              accept: ".mp4, .mov, .avi, .webm, .mkv",
              onInput: (event) => handleVideoSubmit(event, listingId),
            }}
          />
        </Fragment>
      )}
    </Button>
  )
};

export default AddVideoButton;
