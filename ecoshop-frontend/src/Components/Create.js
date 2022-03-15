import { Paper, Grow, Button, CircularProgress, Checkbox, Divider, TextField, Select, MenuItem, OutlinedInput } from "@mui/material";
import { Fragment, useState, useRef, useEffect } from "react";
import { LoadingButton } from '@mui/lab/';
import { useSnackbar } from 'notistack';
import { blue } from '@mui/material/colors';
import ContentCopyTwoTone from '@mui/icons-material/ContentCopyTwoTone';
import AddCircleTwoTone from '@mui/icons-material/AddCircleTwoTone';
import ArrowCircleLeftOutlined from '@mui/icons-material/ArrowCircleLeftOutlined';
import CloudUploadOutlined from '@mui/icons-material/CloudUploadOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CheckIcon from '@mui/icons-material/Check';

import { DropzoneArea } from 'material-ui-dropzone';
import "./../css/create.css"

let bulkProductInformation = []
let finalInfo = []
let TotalFormData = {}
let currentFormID = 0

const Create = (props) => {
  const [page, setPage] = useState("options");
  const imgRef = useRef(null);
  const [scanningStage, setScanningStage] = useState(0)
  const [bulkListingStep, setBulkListingStep] = useState(0);
  const [imageLink, setImageLink] = useState("")
  const [selectedItemsInfo, setSelectedItemsInfo] = useState([])
  const [boundingBoxInfo, setboundingBoxInfo] = useState([])
  const [chosenIDs, setChosenIDs] = useState({})
  const [loadingImageAnalysis, setloadingImageAnalysis] = useState(false)
  const [gettingInfo, setGettingInfo] = useState(false)
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [type, setType] = useState("")
  const [quantity, setQuantity] = useState("")
  const [description, setDescription] = useState("")
  const [attributes, setAttributes] = useState([])
  const [selectedAttributes, setSelectedAttributes] = useState([])
  const [OCRCat, setOCRCat] = useState("")
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const handleImageUpload = async (files) => {
    if (files.length > 0) {
      setChosenIDs({})
      setScanningStage(0)
      setboundingBoxInfo([])
      setSelectedItemsInfo([])
      setloadingImageAnalysis(true)
      setBulkListingStep(1)
      finalInfo = []
      bulkProductInformation = []
      let signedUrl = ""
      let imageName = ""

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
      await fetch(signedUrl, {
        method: 'put',
        headers: { 'Content-Type': 'image/*' },
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
          console.log(data)
          let newChosenIDs = {}
          let ID = 0
          for (let i = 0; i < data.result.result.tags.length; i++) {
            const current = data.result.result.tags[i]

            if (current.instances.length > 0 && current.type !== "Manual scenario") {
              const newItem = {
                ID: ID,
                name: current.tag,
                category: current.type,
                instances: current.instances,
                amount: current.instances.length
              }
              bulkProductInformation.push(newItem)
              newChosenIDs[ID] = true
              ID += 1
            }
          }
          setChosenIDs(newChosenIDs)
          if (bulkProductInformation.length === 0) {
            if (data.result.result.tags.length > 0) {
              // no product information detected, see if can get tag and stuff still
              let highest = 0
              let highestTag = {}
              for (let i = 0; i < data.result.result.tags.length; i++) {
                if (data.result.result.tags[i].confidence > highest) {
                  highest = data.result.result.tags[i].confidence
                  highestTag = data.result.result.tags[i]
                }
              }
              enqueueSnackbar("Skipping selection step as only one item was detected.", {
                variant: 'info',
                autoHideDuration: 3000
              });
              finalInfo = [{
                ID: 0,
                name: highestTag.tag,
                category: highestTag.type,
                instances: [],
                image: files[0],
                amount: 1
              }]

              setBulkListingStep(2)
              handleGenerateProductInfo()
              setloadingImageAnalysis(false)
            }
            else {
              enqueueSnackbar("Nothing could be detected from your image, please try another image.", {
                variant: 'error',
                autoHideDuration: 1500
              });
              setBulkListingStep(0)
              setloadingImageAnalysis(false)
            }

          }
          else {
            setImageLink(window.mediaURL + imageName + "?x-image-process=style/limit-2000")
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
        const top = bulkProductInformation[i].instances[x].bounding_box.top_left_y / ratio
        const left = bulkProductInformation[i].instances[x].bounding_box.top_left_x / ratio
        const width = bulkProductInformation[i].instances[x].bounding_box.width / ratio
        const height = bulkProductInformation[i].instances[x].bounding_box.height / ratio

        boundingBoxInfo.push({
          top: top,
          left: left,
          width: width,
          height: height,
          itemID: bulkProductInformation[i].ID,
          instanceID: x
        })
      }

    }
    setboundingBoxInfo(boundingBoxInfo)
    generateProductListingInfo(chosenIDs)
  }

  const generateProductListingInfo = async (newID) => {
    finalInfo = []
    for (const ID in newID) {
      if (newID[ID]) finalInfo.push(bulkProductInformation[ID])
    }

    for (let i = 0; i < finalInfo.length; i++) {
      // find the instance with the highest confidence
      let currentInstance = {}
      let highest = 0
      for (let x = 0; x < finalInfo[i].instances.length; x++) {
        if (finalInfo[i].instances[x].confidence > highest) {
          currentInstance = finalInfo[i].instances[x]
          highest = finalInfo[i].instances[x].confidence
        }
      }
      const newCanvas = document.createElement("canvas")
      newCanvas.height = currentInstance.bounding_box.height
      newCanvas.width = currentInstance.bounding_box.width

      const ctx = newCanvas.getContext('2d');
      ctx.drawImage(imgRef.current, currentInstance.bounding_box.top_left_x, currentInstance.bounding_box.top_left_y, currentInstance.bounding_box.width, currentInstance.bounding_box.height, 0, 0, currentInstance.bounding_box.width, currentInstance.bounding_box.height);
      const link = newCanvas.toDataURL('image/jpeg')
      finalInfo[i].image = link
    }
    setSelectedItemsInfo([])
    setSelectedItemsInfo(finalInfo)

  }

  const handleGenerateProductInfo = async () => {
    setGettingInfo(true)
    setBulkListingStep(2)

    for (let i = 0; i < finalInfo.length; i++) {
      const current = finalInfo[i]
      // upload each image to the cloud
      let signedUrl = ""
      let imageName = ""

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
        setBulkListingStep(1)
        setGettingInfo(false)
        return false
      })


      if (typeof current.image === "string") {
        const url = current.image;
        const fileObj = await fetch(url)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], "image.png", { type: "image/png" })
            return file
          })
        current.imageDataProcessed = fileObj
      }
      else current.imageDataProcessed = current.image

      await fetch(signedUrl, {
        method: 'put',
        headers: { 'Content-Type': 'image/*' },
        body: current.imageDataProcessed
      }).then((results) => {
        if (results.status !== 200) {
          enqueueSnackbar("There was an issue uploading the image.", {
            variant: 'error',
            autoHideDuration: 2500
          });
          setBulkListingStep(1)
          setGettingInfo(false)
        }
      }).catch((error) => {
        console.log(error)
        enqueueSnackbar("There was an issue connecting to the server", {
          variant: 'error',
          autoHideDuration: 2500
        });
        setBulkListingStep(1)
        setGettingInfo(false)
        return false
      })


      finalInfo[i].imageLink = window.mediaURL + imageName

      const formData = {
        "name": finalInfo[i].name,
        "price": 0,
        "type": 1,
        "quantity": finalInfo[i].amount,
        "description": "",
        "attributes": {},
        "images": [imageName]
      }
      TotalFormData[finalInfo[i].ID] = formData
      /*
      // check whether supported by OCR
       const lowerCaseName = current.name.toLowerCase()
       const supportedTags = { "computer": "Computer", "mobile": "Mobile Gadgets", "gadget": "Mobile Gadgets", "notebook": "Computer", "laptop": "Computer", "desktop": "Computer" }
      let supported = false
      let category = ""
      for (const tag in supportedTags) {
        if (lowerCaseName.indexOf(tag) !== -1) {
          supported = true
          category = supportedTags[tag]
          break
        }
      }
      if (supported) {
        console.log(JSON.stringify({
          "category": category,
          "image_url": finalInfo[i].imageLink
        }))
        await fetch("https://cors-anywhere.herokuapp.com/http://182.160.1.242:8080/extract", {
          method: 'post',
          headers: { 'Content-Type': 'application/json', 'Authorization': window.token },
          body: JSON.stringify({
            "category": category,
            "image_url": finalInfo[i].imageLink
          })
        }).then((results) => {
          return results.json(); //return data in JSON (since its JSON data)
        }).then(async (data) => {
          console.log(data)
        }).catch((error) => {
          console.log(error)
          enqueueSnackbar("There was an issue connecting to the server", {
            variant: 'error',
            autoHideDuration: 2500
          });
          setBulkListingStep(1)
          setGettingInfo(false)
          return false
        })*/

    }
    console.log(TotalFormData)
    setGettingInfo(false)
    setSelectedItemsInfo([])
    setSelectedItemsInfo(finalInfo)
    loadFormData(0)
  }

  const loadFormData = async (id) => {
    const data = TotalFormData[id]
    currentFormID = id
    setName(data.name)
    setPrice(data.price)
    setType(data.type)
    setQuantity(data.quantity)
    setDescription(data.description)
    setAttributes(Object.keys(data.attributes))
  }

  const OCRCurrentImage = async () => {
    await fetch("https://cors-anywhere.herokuapp.com/http://182.160.1.242:8080/extract", {
      method: 'post',
      headers: { 'Content-Type': 'application/json', 'Authorization': window.token },
      body: JSON.stringify({
        "category": OCRCat,
        "image_url": window.mediaURL + TotalFormData[currentFormID].images[0]
      })
    }).then((results) => {
      return results.json(); //return data in JSON (since its JSON data)
    }).then(async (data) => {
      console.log(data)
      if (data.success === "true") {
        for (const attribute in data.result) {
          TotalFormData[currentFormID].attributes[attribute] = data.result[attribute]
        }
        setAttributes(Object.keys(TotalFormData[currentFormID].attributes))
      }
      else {
        enqueueSnackbar("Failed to OCR image", {
          variant: 'error',
          autoHideDuration: 2500
        });
      }
    }).catch((error) => {
      console.log(error)
      enqueueSnackbar("There was an issue connecting to the server", {
        variant: 'error',
        autoHideDuration: 2500
      });
      setBulkListingStep(1)
      setGettingInfo(false)
      return false
    })
  }

  const AttributesInference = async () => {
    await fetch(window.globalURL + "/product/attributes/inference", {
      method: 'post',
      headers: { 'Content-Type': 'application/json', 'Authorization': window.token },
      body: JSON.stringify({
        "description": description,
        "attributes": selectedAttributes
      })
    }).then((results) => {
      return results.json(); //return data in JSON (since its JSON data)
    }).then(async (data) => {
      console.log(data)
      
    }).catch((error) => {
      console.log(error)
      enqueueSnackbar("There was an issue connecting to the server", {
        variant: 'error',
        autoHideDuration: 2500
      });
      setBulkListingStep(1)
      setGettingInfo(false)
      return false
    })
  }

  const handleSubmit = async () => {
    let listings = []
    for (const current in TotalFormData) {
      listings.push(TotalFormData[current])
    }
    await fetch(window.globalURL + "/product/create", {
      method: 'post',
      headers: { 'Content-Type': 'application/json', 'Authorization': window.token },
      body: JSON.stringify({
        "type": "bulk",
        "listings": listings
      })
    }).then((results) => {
      return results.json(); //return data in JSON (since its JSON data)
    }).then(async (data) => {
      if (data.success === true) {
        enqueueSnackbar("Created listing successfully!", {
          variant: 'success',
          autoHideDuration: 2500
        });
        setPage("options")
        setBulkListingStep(0)
      }
      
    }).catch((error) => {
      console.log(error)
      enqueueSnackbar("There was an issue connecting to the server", {
        variant: 'error',
        autoHideDuration: 2500
      });
      setBulkListingStep(1)
      setGettingInfo(false)
      return false
    })
  }

  return (
    <div className='fadeIn video-container-style' style={{ padding: "1ch" }}>
      <div className="video-container-style" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", textAlign: "center" }}>
        {page === "options" && (
          <Grow in={true}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
              <h1>Create:</h1>
              <Paper onClick={() => { setPage("bulk-listing") }} elevation={16} style={{ padding: "2ch", display: "flex", alignItems: "center", justifyContent: "center", width: "80vw", flexDirection: "column" }}>
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
            <div style={{ width: "100%", display: "flex", alignItems: "center", paddingTop: "5ch", paddingBottom: "5ch", justifyContent: "center", flexDirection: "column", textAlign: "center" }}>
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
                    <div className="video-container-style" style={{ margin: "1ch", marginBottom: "5ch" }}>
                      <h3>Step 2</h3>
                      <span>Tap on the boxes below to add items!</span>
                      <Paper elevation={12} style={{ width: "100%", maxHeight: "50vh", borderRadius: "15px", padding: "1ch", marginTop: "1ch" }}>
                        <div style={{ position: "relative", width: "fit-content", height: "fit-content" }}>
                          <img ref={imgRef} src={imageLink} crossOrigin="anonymous" onLoad={(e) => { drawBoundingBoxes(e) }} style={{ height: "100%", width: "100%", objectFit: "scale-down" }} />
                          {boundingBoxInfo.map((current) => <div
                            key={"instance-" + current.instanceID + "bounding-box-" + current.itemID}
                            onClick={() => {
                              const newID = JSON.parse(JSON.stringify(chosenIDs))
                              if (chosenIDs[current.itemID]) newID[current.itemID] = false
                              else newID[current.itemID] = true
                              setChosenIDs(newID)
                              generateProductListingInfo(newID)
                            }} style={{ border: chosenIDs[current.itemID] ? "4px solid #4caf50" : "4px solid #f44336", position: "absolute", top: current.top, left: current.left, width: current.width, height: current.height }}>
                            <div style={{ position: "absolute", right: 0, bottom: 0 }}>
                              <Checkbox checked={current.itemID in chosenIDs ? chosenIDs[current.itemID] : true} style={{ padding: 0 }} />
                            </div>
                          </div>)}
                        </div>
                      </Paper>
                      <h2>Selected Items</h2>
                      <div style={{ overflowX: "auto", overflowY: "hidden", display: "flex", width: "100%" }}>
                        {selectedItemsInfo.map((current) =>
                          <Paper key={current.name + "-image"} className='listing-styles' elevation={12} style={{ width: "45vw", marginLeft: "1ch" }}>
                            <div>
                              <img src={current.image} style={{ width: "100%", height: "15ch", objectFit: "cover" }} />
                            </div>
                            <div className='listing-info-style'>
                              <div style={{ display: "flex" }}>
                                <h5 className='listing-title-style'> {current.name}</h5>
                              </div>
                              <h4 className='listing-quantity-style'><b>Category:</b> {current.category}</h4>
                              <h4 className='listing-quantity-style'><b>Amount:</b> {current.amount}</h4>
                            </div>
                          </Paper>
                        )}
                      </div>

                      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "10ch" }}>
                        <Button style={{ marginTop: "3ch" }} onClick={() => {
                          setBulkListingStep(0)
                        }} variant="outlined" startIcon={<ArrowCircleLeftOutlined />}>
                          Back
                        </Button>
                        <Button style={{ marginTop: "3ch", marginLeft: "2ch" }} onClick={() => {
                          setBulkListingStep(2)
                          handleGenerateProductInfo()
                        }} color="success" variant="contained" endIcon={<CheckIcon />}>
                          Confirm Selection
                        </Button>
                      </div>
                    </div>
                  )}
                </Fragment>
              )}
              {bulkListingStep === 2 && (
                <Fragment>
                  {gettingInfo ? (
                    <div style={{ margin: "5ch" }}>
                      <CircularProgress size="12ch" />
                      <h3>Uploading Images</h3>

                      <span>This shouldn't take too long</span>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: 'column', justifyContent: "center", alignItems: "center" }}>
                      <h3>Step 3</h3>
                      <div style={{ overflowX: "auto", overflowY: "hidden", display: "flex", width: "100%", marginBottom: "2ch" }}>
                        {selectedItemsInfo.map((current) =>
                          <Paper onClick={() => { loadFormData(current.ID) }} key={current.name + "-image"} className='listing-styles' elevation={12} style={{ width: "45vw", marginLeft: "1ch" }}>
                            <div>
                              <img src={current.imageLink} style={{ width: "100%", height: "15ch", objectFit: "cover" }} />
                            </div>
                            <div className='listing-info-style'>
                              <div style={{ display: "flex" }}>
                                <h5 className='listing-title-style'> {current.name}</h5>
                              </div>
                              <h4 className='listing-quantity-style'><b>Category:</b> {current.category}</h4>
                              <h4 className='listing-quantity-style' style={{ marginBottom: "1ch" }}><b>Amount:</b> {current.amount}</h4>

                              <Divider />
                              <span style={{ display: "flex", alignItems: "center", marginTop: "1ch", fontSize: "1.5ch" }}>Tap to edit this item <EditOutlinedIcon style={{ marginLeft: "5px" }} /></span>
                            </div>
                          </Paper>
                        )}


                      </div>


                      <Divider style={{ width: "100%" }} />

                      <h3>Experimental Section</h3>

                      <div style={{ display: "flex" }}>
                        <LoadingButton onClick={() => { OCRCurrentImage() }} variant="contained">OCR Current Image</LoadingButton>
                        <Select
                          label="Category"
                          name="category"
                          value={OCRCat}
                          varaint="filled"
                          onChange={(e) => {
                            setOCRCat(e.target.value)
                          }}
                          style={{ marginLeft: "1ch" }}
                        >
                          <MenuItem value="Computer">Computer</MenuItem>
                          <MenuItem value="Mobile Gadgets">Mobile Gadgets</MenuItem>
                        </Select>
                      </div>
                      <span style={{ marginTop: "2px" }}>Generates attributes by conducting OCR on any text present in the image</span>

                      <div style={{ display: "flex" }}>
                        <LoadingButton variant="contained" onClick={() => { AttributesInference() }} style={{ marginTop: "2ch" }}>Generate Attributes</LoadingButton>
                        <Select
                          multiple
                          value={selectedAttributes}
                          onChange={(e) => {
                            setSelectedAttributes(e.target.value)
                          }}
                          input={<OutlinedInput label="Name" />}
                        >
                          {attributes.map((name) => (
                            <MenuItem
                              key={name}
                              value={name}
                            >
                              {name}
                            </MenuItem>
                          ))}
                        </Select>
                      </div>
                      <span style={{ marginTop: "2px" }}>Generates attribute <b>values</b> by inferring from the description</span>

                      <h3>Currently Editing: <code>{name}</code></h3>
                      <form style={{ display: "flex", flexDirection: "column", width: "90vw" }}
                        onSubmit={async (e) => {
                          e.preventDefault()

                        }}
                      >
                        <TextField
                          className="input-style"
                          label="Item Name *"
                          variant='filled'
                          name="name"
                          value={name}
                          onChange={(e) => {
                            setName(e.target.value)
                            TotalFormData[currentFormID].name = e.target.value
                            selectedItemsInfo[currentFormID].name = e.target.value
                            setSelectedItemsInfo(selectedItemsInfo)
                          }}
                        />
                        <TextField
                          className="input-style"
                          label="Price *"
                          variant='filled'
                          name="price"
                          value={price}
                          onChange={(e) => {
                            setPrice(e.target.value)
                            TotalFormData[currentFormID].price = e.target.value
                          }}
                        />
                        <Select
                          label="Type"
                          name="type"
                          value={type}
                          varaint="filled"
                          onChange={(e) => {
                            setType(e.target.value)
                            TotalFormData[currentFormID].type = e.target.value
                          }}
                        >
                          <MenuItem value={1}>Product</MenuItem>
                          <MenuItem value={0}>Repair Service</MenuItem>
                        </Select>
                        <TextField
                          className="input-style"
                          label="Quantity *"
                          variant='filled'
                          name="quantity"
                          value={quantity}
                          onChange={(e) => {
                            setQuantity(e.target.value)
                            TotalFormData[currentFormID].quantity = e.target.value
                            selectedItemsInfo[currentFormID].amount = e.target.value
                            setSelectedItemsInfo(selectedItemsInfo)
                          }}
                        />
                        <TextField
                          className="input-style"
                          label="Description *"
                          multiline
                          variant='filled'
                          name="description"
                          value={description}
                          onChange={(e) => {
                            setDescription(e.target.value)
                            TotalFormData[currentFormID].description = e.target.value
                          }}
                        />

                      </form>
                      <h3>Attributes</h3>

                      <div>
                        {attributes.map((current, index) =>
                          <div key={index + "-attribute"} style={{ display: "flex", width: "100%", alignItems: "center", marginTop: "1ch", textTransform: "capitalize" }}>
                            <TextField value={current} onChange={(e) => {
                              const oldAttributes = JSON.parse(JSON.stringify(TotalFormData[currentFormID].attributes))
                              TotalFormData[currentFormID].attributes[e.target.value] = oldAttributes[current]
                              delete TotalFormData[currentFormID].attributes[current]

                              setAttributes([])
                              setAttributes(Object.keys(TotalFormData[currentFormID].attributes))

                            }} name={"value-" + current.attr_name} label={"Attribute Name"} style={{ marginRight: "1ch" }} />
                            <TextField value={TotalFormData[currentFormID].attributes[current]} fullWidth onChange={(e) => {
                              TotalFormData[currentFormID].attributes[current] = e.target.value
                              setAttributes([])
                              setAttributes(Object.keys(TotalFormData[currentFormID].attributes))
                            }} name={"value-" + current.attr_name} label={"Attribute Value"} />
                          </div>
                        )}
                      </div>

                      <Button onClick={() => {
                        TotalFormData[currentFormID].attributes["new attribute " + Object.keys(attributes).length] = "new value"
                        setAttributes([])
                        setAttributes(Object.keys(TotalFormData[currentFormID].attributes))
                      }}>Add Attribute</Button>


                      <LoadingButton variant="contained" onClick={() => {handleSubmit()}} style={{ marginTop: "2ch" }}>Submit All Items</LoadingButton>
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
