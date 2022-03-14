import { Paper, Grow, Button, CircularProgress, Checkbox } from "@mui/material";
import { Fragment, useState, useRef } from "react";
import { useSnackbar } from 'notistack';
import { blue } from '@mui/material/colors';
import ContentCopyTwoTone from '@mui/icons-material/ContentCopyTwoTone';
import AddCircleTwoTone from '@mui/icons-material/AddCircleTwoTone';
import ArrowCircleLeftOutlined from '@mui/icons-material/ArrowCircleLeftOutlined';
import CloudUploadOutlined from '@mui/icons-material/CloudUploadOutlined';
import CheckIcon from '@mui/icons-material/Check';

import { DropzoneArea } from 'material-ui-dropzone';
import "./../css/create.css"

let bulkProductInformation = []
let imageFile = null

const Create = (props) => {
  const [page, setPage] = useState("options");
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const [scanningStage, setScanningStage] = useState(0)
  const [bulkListingStep, setBulkListingStep] = useState(0);
  const [imageLink, setImageLink] = useState("")
  const [boundingBoxInfo, setboundingBoxInfo] = useState([])
  const [chosenIDs, setChosenIDs] = useState({})
  const [loadingImageAnalysis, setloadingImageAnalysis] = useState(false)
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const handleImageUpload = async (files) => {
    if (files.length > 0) {
      setChosenIDs({})
      setScanningStage(0)
      setboundingBoxInfo([])
      setloadingImageAnalysis(true)
      setBulkListingStep(1)
      let signedUrl = ""
      let imageName = ""
      imageFile = files[0]

      await fetch(window.globalURL + "/upload", {
        method: 'post',
        headers: { 'Content-Type': 'application/json', 'Authorization': window.token },
        body: JSON.stringify({
          "type": "image"
        })
      }).then((results) => {
        return results.json(); //return data in JSON (since its JSON data)
      }).then(async (data) => {
        signedUrl = data.uploadParams.SignedUrl
        imageName = data.uploadPath.replace("user-image/", "")
      }).catch((error) => {
        console.log(error)
        enqueueSnackbar("There was an issue connecting to the server", {
          variant: 'error',
          autoHideDuration: 2500
        });
        setBulkListingStep(0)
        setloadingImageAnalysis(false)
        return false
      })

      setScanningStage(1)
      await fetch("https://cors-anywhere.herokuapp.com/" + signedUrl, {
        method: 'put',
        headers: { 'Content-Type': 'image/*', 'Authorization': window.token },
        body: files[0]
      }).then((results) => {
        if (results.status !== 200) {
          enqueueSnackbar("There was an issue uploading the image.", {
            variant: 'error',
            autoHideDuration: 2500
          });
          setBulkListingStep(0)
          setloadingImageAnalysis(false)
        }
      }).catch((error) => {
        console.log(error)
        enqueueSnackbar("There was an issue connecting to the server", {
          variant: 'error',
          autoHideDuration: 2500
        });
        setBulkListingStep(0)
        setloadingImageAnalysis(false)
        return false
      })

      setScanningStage(2)
      await fetch(window.globalURL + "/image/analyse ", {
        method: 'POST',
        headers: { 'Content-Type': 'image/*', 'Authorization': window.token },
        body: JSON.stringify({ image: imageName })
      }).then((results) => {
        return results.json(); //return data in JSON (since its JSON data)
      }).then(async (data) => {
        if (data.success === true) {
          let newChosenIDs = {}
          for (let i = 0; i < data.result.result.tags.length; i++) {
            const current = data.result.result.tags[i]
            if (current.instances.length > 0) {
              const newItem = {
                name: current.tag,
                category: current.type,
                instances: current.instances
              }
              bulkProductInformation.push(newItem)
              newChosenIDs[i] = true
            }
          }
          setChosenIDs(newChosenIDs)
          if (bulkProductInformation.length === 0) {
            enqueueSnackbar("No items were dected in your image. Please try another image.", {
              variant: 'error',
              autoHideDuration: 2500
            });
            setBulkListingStep(0)
            setloadingImageAnalysis(false)
          }
          else {
            setImageLink("https://ecoshop-content.obs.ap-southeast-3.myhuaweicloud.com/user-image/" + imageName)
          }
        }
        else {
          enqueueSnackbar("Your image was picked up by our moderation algorithms for: " + data.error, {
            variant: 'error',
            autoHideDuration: 2500
          });
          setBulkListingStep(0)
          setloadingImageAnalysis(false)
        }
        console.log(data)
      }).catch((error) => {
        console.log(error)
        enqueueSnackbar("There was an issue connecting to the server", {
          variant: 'error',
          autoHideDuration: 2500
        });
        setBulkListingStep(0)
        setloadingImageAnalysis(false)
        return false
      })
      setloadingImageAnalysis(false)

    }
  }

  const drawBoundingBoxes = (e) => {
    const ratio = e.target.naturalWidth / e.target.width
    let boundingBoxInfo = []
    for (let i = 0; i < bulkProductInformation.length; i++) {
      for (let x = 0; x < bulkProductInformation[i].instances.length; x++) {
        const bottom = bulkProductInformation[i].instances[x].bounding_box.top_left_y / ratio
        const left = bulkProductInformation[i].instances[x].bounding_box.top_left_x / ratio
        const width = bulkProductInformation[i].instances[x].bounding_box.width / ratio
        const height = bulkProductInformation[i].instances[x].bounding_box.height / ratio

        boundingBoxInfo.push({
          bottom: bottom,
          left: left,
          width: width,
          height: height,
          itemID: i,
          instanceID: x
        })

        bulkProductInformation[i].instances[x].bounding_box.bottom = bottom
        bulkProductInformation[i].instances[x].bounding_box.left = left
        bulkProductInformation[i].instances[x].bounding_box.newWidth = width
        bulkProductInformation[i].instances[x].bounding_box.newHeight = height
      }

    }
    setboundingBoxInfo(boundingBoxInfo)
  }

  const generateProductListingInfo = () => {
    let finalInfo = []
    const imgElement = imgRef.current
    for (const ID in chosenIDs) {
      if (ID) finalInfo.push(bulkProductInformation[ID])
    }

    for (let i = 0; i < finalInfo.length; i++) {
      const current = finalInfo[i]
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(imgRef.current, current.instances[0].bounding_box.top_left_x, current.instances[0].bounding_box.top_left_y, current.instances[0].bounding_box.width, current.instances[0].bounding_box.height, 0,0, current.instances[0].bounding_box.newWidth, current.instances[0].bounding_box.newHeight);
    }
   
  }

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
              {bulkListingStep === 0 && (
                <div style={{ margin: "5vw" }}>
                  <h3>Step 1</h3>
                  <DropzoneArea
                    acceptedFiles={['image/*']}
                    dropzoneText={"Tap to upload an image"}
                    Icon={() => <CloudUploadOutlined style={{ fontSize: "10ch", color: blue[500] }} />}
                    filesLimit={1}
                    maxFileSize={20000000}
                    dropzoneClass="dropzone-class"
                    showPreviewsInDropzone={false}
                    onChange={(files) => { handleImageUpload(files) }}
                    onDropRejected={(e) => {
                      enqueueSnackbar("Oops. Please upload a valid image that is < 20MB", {
                        variant: 'error',
                        autoHideDuration: 2500
                      })
                    }}
                    showAlerts={false}
                  />
                  <span>Upload an image containing <b>multiple items</b> - We will take care of it! <br /></span>
                  <Button style={{ marginTop: "3ch" }} onClick={() => { setPage("options") }} variant="outlined" startIcon={<ArrowCircleLeftOutlined />}>
                    Back
                  </Button>
                </div>
              )}
              {bulkListingStep === 1 && (
                <Fragment>
                  {loadingImageAnalysis ? (
                    <div style={{ margin: "5ch" }}>
                      <CircularProgress size="12ch" />
                      {scanningStage === 0 && (
                        <h3>Uploading your image to our servers</h3>
                      )}
                      {scanningStage === 1 && (
                        <h3>Scanning your image for any dis-allowed content</h3>
                      )}
                      {scanningStage === 2 && (
                        <h3>Scanning your image for items and tag information</h3>
                      )}

                      <span>This shouldn't take too long</span>
                    </div>
                  ) : (
                    <div style={{ margin: "1ch" }}>
                      <canvas ref={canvasRef} style={{display: "visible"}} />
                      <h3>Step 2</h3>
                      <span>Tap on the boxes below to add items!</span>
                      <Paper elevation={12} style={{ width: "100%", height: "30ch", borderRadius: "15px", padding: "1ch", marginTop: "1ch" }}>
                        <div style={{ position: "relative", width: "fit-content", height: "fit-content" }}>
                          <img ref={imgRef} src={imageLink} onLoad={(e) => { drawBoundingBoxes(e) }} style={{ height: "100%", width: "100%", objectFit: "scale-down" }} />
                          {boundingBoxInfo.map((current) => <div
                            key={current.instanceID + "bounding-box-id"}
                            onClick={() => {
                              const newID = JSON.parse(JSON.stringify(chosenIDs))
                              if (chosenIDs[current.itemID]) newID[current.itemID] = false
                              else newID[current.itemID] = true
                              setChosenIDs(newID)
                            }} style={{ border: chosenIDs[current.itemID] ? "4px solid #4caf50" : "4px solid #f44336", position: "absolute", bottom: current.bottom, left: current.left, width: current.width, height: current.height }}>
                            <div style={{ position: "absolute", right: 0, bottom: 0 }}>
                              <Checkbox checked={chosenIDs[current.itemID]} />
                            </div>
                          </div>)}
                        </div>
                      </Paper>

                      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <Button style={{ marginTop: "3ch" }} onClick={() => { setBulkListingStep(0) }} variant="outlined" startIcon={<ArrowCircleLeftOutlined />}>
                          Back
                        </Button>
                        <Button style={{ marginTop: "3ch", marginLeft: "2ch" }} onClick={() => { generateProductListingInfo() }} color="success" variant="contained" endIcon={<CheckIcon />}>
                          Confirm Selection
                        </Button>
                      </div>
                    </div>
                  )}


                </Fragment>
              )}
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
