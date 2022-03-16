import { Alert, Paper, Grow, Button, CircularProgress, InputLabel, FormControl, IconButton, Checkbox, Divider, TextField, Select, MenuItem, OutlinedInput, getFormLabelUtilityClasses } from "@mui/material";
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
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import DeleteIcon from '@mui/icons-material/Delete';

import { DropzoneArea } from 'material-ui-dropzone';

const formData = {
    "name": "",
    "price": 1,
    "type": 1,
    "quantity": 1,
    "description": "",
    "attributes": {},
    "images": []
}

const SingeListing = (props) => {
    const [step, setStep] = useState(0)
    const [uploadingImage, setUploadingImage] = useState(false)
    const [attributes, setAttributes] = useState([])
    const [attributeNameError, setattributeNameError] = useState(false)
    const [name, setName] = useState("")
    const [price, setPrice] = useState("")
    const [priceErrorMsg, setPriceErrorMsg] = useState("")
    const [priceError, setPriceError] = useState(false);
    const [quantityError, setQuantityError] = useState(false);
    const [quantityErrorMsg, setquantityErrorMsg] = useState("")
    const [type, setType] = useState("")
    const [OCRLoading, setOCRLoading] = useState(false)
    const [quantity, setQuantity] = useState("")
    const [description, setDescription] = useState("")
    const [OCRCat, setOCRCat] = useState("Computer")
    const [emptyValues, setEmptyValues] = useState(false)
    const [imageLink, setImageLink] = useState("")
    const [inferenceLoading, setInferenceLoading] = useState(false)
    const [submitLoading, setSubmitLoading] = useState(false)
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const OCRCurrentImage = async () => {
        setOCRLoading(true)
        await fetch("http://182.160.1.242:8080/extract", {
            method: 'post',
            headers: { 'Content-Type': 'application/json', 'Authorization': window.token },
            body: JSON.stringify({
                "category": OCRCat,
                "image_url": window.mediaURL + formData.images[0]
            })
        }).then((results) => {
            return results.json(); //return data in JSON (since its JSON data)
        }).then(async (data) => {
            let attributesEdited = 0
            if (data.success === "true") {
                for (const attribute in data.result) {
                    if (!(attribute in formData.attributes)) {
                        formData.attributes[attribute] = data.result[attribute]
                        attributesEdited += 1
                    }
                }
                const listAttributes = Object.keys(formData.attributes)
                setAttributes(listAttributes)
                enqueueSnackbar("Generated " + attributesEdited + " attributes successfully.", {
                    variant: 'success',
                    autoHideDuration: 2500
                });

                if (listAttributes.length - attributesEdited > 0) {
                    enqueueSnackbar("Skipped " + listAttributes.length - attributesEdited + " attributes as they were already present.", {
                        variant: 'info',
                        autoHideDuration: 3000
                    });
                }
            }
            else {
                enqueueSnackbar("Unable to glean any useful information from the image :c", {
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
            setStep(1)
            setUploadingImage(false)
            return false
        })
        setOCRLoading(false)
    }

    const AttributesInference = async () => {

        if (description.length === 0) {
            enqueueSnackbar("Please enter a description first", {
                variant: 'error',
                autoHideDuration: 2500
            });
            return false
        }
        setInferenceLoading(true)
        let emptyAttributes = []
        for (const attribute in formData.attributes) {
            if (formData.attributes[attribute] === "") emptyAttributes.push(attribute)
        }
        await fetch(window.globalURL + "/product/attributes/inference", {
            method: 'post',
            headers: { 'Content-Type': 'application/json', 'Authorization': window.token },
            body: JSON.stringify({
                "description": description,
                "attributes": emptyAttributes
            })
        }).then((results) => {
            return results.json(); //return data in JSON (since its JSON data)
        }).then(async (data) => {
            const keys = Object.keys(data.result)
            for (const attribute in data.result) {
                formData.attributes[attribute] = data.result[attribute].replace(".", "")
            }

            setAttributes([])
            setAttributes(Object.keys(formData.attributes))

            if (keys.length > 0) {
                enqueueSnackbar("Generated " + keys.length + " attributes successfully.", {
                    variant: 'success',
                    autoHideDuration: 2500
                });
            }
            else {
                enqueueSnackbar("Unable to automatically fill any attributes.", {
                    variant: 'error',
                    autoHideDuration: 2500
                });
            }
            setInferenceLoading(false)


        }).catch((error) => {
            console.log(error)
            enqueueSnackbar("There was an issue connecting to the server", {
                variant: 'error',
                autoHideDuration: 2500
            });
            setStep(1)
            setUploadingImage(false)
            return false
        })
    }

    useEffect(() => {
        if (step === 1) {
            for (const attribute in formData.attributes) {
                if (formData.attributes[attribute] === "") {
                    setEmptyValues(true)
                    return true
                }
            }
            setEmptyValues(false)
        }

    }, [attributes])

    const handleImageUpload = async (files) => {
        if (files.length > 0) {
            setStep(1)
            setUploadingImage(true)
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
                setStep(0)
                setUploadingImage(false)
                return false
            })

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
                    setStep(0)
                    setUploadingImage(false)

                }
                else {
                    setImageLink(window.mediaURL + imageName)

                }
            }).catch((error) => {
                console.log(error)
                enqueueSnackbar("There was an issue connecting to the server", {
                    variant: 'error',
                    autoHideDuration: 2500
                });
                setStep(0)
                setUploadingImage(false)
                return false
            })

            await fetch(window.globalURL + "/image/analyse ", {
                method: 'POST',
                headers: { 'Content-Type': 'image/*', 'Authorization': window.token },
                body: JSON.stringify({ image: imageName })
            }).then((results) => {
                return results.json(); //return data in JSON (since its JSON data)
            }).then(async (data) => {
                if (data.success === true) {
                    if (data.result.result.tags.length > 0) {
                        let highest = 0
                        let highestTag = {}
                        for (let i = 0; i < data.result.result.tags.length; i++) {
                            if (data.result.result.tags[i].confidence > highest) {
                                highest = data.result.result.tags[i].confidence
                                highestTag = data.result.result.tags[i]
                            }
                        }
                        formData.images = [imageName]
                        formData.name = highestTag.tag
                        setUploadingImage(false)
    
                        setName(formData.name)
                        setPrice(formData.price)
                        setType(formData.type)
                        setQuantity(formData.quantity)
                        setDescription(formData.description)
                        setAttributes(Object.keys(formData.attributes))
                    }
                    else {
                        enqueueSnackbar("Nothing could be detected from your image, please try another image.", {
                            variant: 'error',
                            autoHideDuration: 1500
                        });
                        setStep(0)
                        setUploadingImage(false)
                    }
                }
                else {
                    enqueueSnackbar("Your image was picked up by our moderation algorithms for: " + data.error, {
                        variant: 'error',
                        autoHideDuration: 2500
                    });
                    setStep(0)
                    setUploadingImage(false)
                }
                
            }).catch ((error) => {
                console.log(error)
                enqueueSnackbar("There was an issue connecting to the server", {
                    variant: 'error',
                    autoHideDuration: 2500
                });
                setStep(0)
                setUploadingImage(false)
                return false
            })

           
        }
    }


const handleSubmit = async () => {
    setSubmitLoading(true)
    for (const current in formData) {
        if (current === "") {
            enqueueSnackbar("Please fill in all fields first", {
                variant: 'error',
                autoHideDuration: 2500
            });
            setSubmitLoading(false)
            return false
        }
    }
    await fetch(window.globalURL + "/product/create", {
        method: 'post',
        headers: { 'Content-Type': 'application/json', 'Authorization': window.token },
        body: JSON.stringify({
            "type": "single",
            "listing": formData
        })
    }).then((results) => {
        return results.json(); //return data in JSON (since its JSON data)
    }).then(async (data) => {
        if (data.success === true) {
            enqueueSnackbar("Created listing successfully!", {
                variant: 'success',
                autoHideDuration: 2500
            });
            props.setPage("options")
            setStep(0)
        }
        else {
            console.log(data)
            enqueueSnackbar("An unknown error occurred.", {
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
        setStep(1)
        setUploadingImage(false)
        return false
    })
    setSubmitLoading(false)
}

return (
    <div style={{ width: "100%", display: "flex", alignItems: "center", paddingTop: "5ch", paddingBottom: "5ch", justifyContent: "center", flexDirection: "column", textAlign: "center" }}>
        <h1 className="normal-text">Single Listing Creation</h1>
        {step === 0 && (
            <Grow in={true}>
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
                    <span>Upload the cover image of your product/service! <br /></span>
                    <Button style={{ marginTop: "3ch" }} onClick={() => { props.setPage("options") }} variant="outlined" startIcon={<ArrowCircleLeftOutlined />}>
                        Back
                    </Button>
                </div>
            </Grow>
        )}
        {step === 1 && (
            <Grow in={true}>
                {uploadingImage ? (<div style={{ margin: "5ch" }}>
                    <CircularProgress size="12ch" />
                    <h3>Uploading Image</h3>

                    <span>This shouldn't take too long</span>
                </div>) : (

                    <div style={{ display: "flex", flexDirection: 'column', justifyContent: "center", alignItems: "center" }}>
                        <img src={imageLink} style={{ width: "100%", height: "25vh", objectFit: "cover", borderRadius: "15px" }} />

                        <h3>Step 2</h3>
                        <Alert style={{ display: "flex", flexDirection: "column", alignItems: "center" }} severity="info">
                            <div>
                                <span>Run OCR on the current product image by selecting a category. This generates attributes automatically via infomation from the image.</span>
                            </div>
                            <div style={{ display: "flex", marginTop: "2ch", alignItems: "center", justifyContent: "center" }}>

                                <LoadingButton loading={OCRLoading} onClick={() => { OCRCurrentImage() }} variant="contained">OCR Current Image</LoadingButton>
                                <FormControl variant="filled">
                                    <InputLabel id="category-label">Category</InputLabel>
                                    <Select
                                        disabled={OCRLoading}
                                        labelId="category-label"
                                        name="category"
                                        value={OCRCat}
                                        onChange={(e) => {
                                            setOCRCat(e.target.value)
                                        }}
                                        style={{ marginLeft: "1ch", textAlign: "center" }}
                                    >
                                        <MenuItem value="Computer">Computer</MenuItem>
                                        <MenuItem value="Mobile Gadgets">Mobile Gadgets</MenuItem>
                                    </Select>
                                </FormControl>
                            </div>
                        </Alert>

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
                                    formData.name = e.target.value
                                }}
                            />
                            <TextField
                                className="input-style"
                                label="Price *"
                                variant='filled'
                                name="price"
                                error={priceError}
                                helperText={priceErrorMsg}
                                value={price}
                                onChange={(e) => {

                                    let number = ""
                                    if (e.target.value !== "") number = Number(e.target.value)

                                    if (e.target.value !== "" && (isNaN(number) || number <= 0)) {
                                        setPriceError(true)
                                        setPriceErrorMsg("Please enter a valid numerical price >$0")
                                    }
                                    else {
                                        setPrice(number)
                                        setPriceError(false)
                                        setPriceErrorMsg("")
                                        formData.price = number
                                    }

                                }}
                            />
                            <FormControl variant="filled">
                                <InputLabel id="type-label">Type</InputLabel>
                                <Select
                                    name="type"
                                    labelId="type-label"
                                    value={type}
                                    onChange={(e) => {
                                        setType(e.target.value)
                                        formData.type = e.target.value
                                    }}
                                    style={{ marginBottom: "2ch" }}
                                >
                                    <MenuItem value={1}>Product</MenuItem>
                                    <MenuItem value={0}>Repair Service</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField
                                className="input-style"
                                label="Quantity *"
                                variant='filled'
                                name="quantity"
                                error={quantityError}
                                helperText={quantityErrorMsg}
                                value={quantity}
                                onChange={(e) => {
                                    let number = ""
                                    if (e.target.value !== "") number = Number(e.target.value)

                                    if (e.target.value !== "" && (isNaN(number) || number <= 0)) {
                                        setQuantityError(true)
                                        setquantityErrorMsg("Please set a quantity that is a valid number >= 0")
                                    }
                                    else {
                                        setQuantity(e.target.value)
                                        setquantityErrorMsg("")
                                        setQuantityError(false)
                                        formData.quantity = number
                                    }

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
                                    formData.description = e.target.value
                                }}
                            />

                        </form>
                        <h3>Attributes</h3>

                        <Alert severity="info" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <div>
                                <span>Automatically fill in any missing attribute <b>values</b> by inferring from your description!</span>
                            </div>
                            <LoadingButton loading={inferenceLoading} disabled={!emptyValues} variant="contained" onClick={() => { AttributesInference() }} style={{ marginTop: "2ch" }}>Infer Attributes</LoadingButton>
                        </Alert>
                        <div>
                            {attributes.map((current, index) =>
                                <div key={index + "-attribute"} style={{ display: "flex", width: "100%", marginTop: "1ch", textTransform: "capitalize" }}>
                                    <TextField
                                        error={attributeNameError}
                                        helperText={attributeNameError ? "No two attributes can have the same name" : ""}
                                        value={current} onChange={(e) => {
                                            if (e.target.value in formData.attributes) {
                                                setattributeNameError(true)
                                                return false
                                            }
                                            else if (attributeNameError) setattributeNameError(false)

                                            const oldAttributes = JSON.parse(JSON.stringify(formData.attributes))
                                            formData.attributes[e.target.value] = oldAttributes[current]
                                            delete formData.attributes[current]

                                            setAttributes([])
                                            setAttributes(Object.keys(formData.attributes))

                                        }} name={"value-" + current.attr_name} label={"Attribute Name"} style={{ marginRight: "1ch" }} />
                                    <TextField value={formData.attributes[current]} fullWidth onChange={(e) => {
                                        formData.attributes[current] = e.target.value
                                        setAttributes([])
                                        setAttributes(Object.keys(formData.attributes))
                                    }} name={"value-" + current.attr_name} label={"Attribute Value"} />
                                    <IconButton style={{ marginLeft: "1ch" }} onClick={() => {
                                        delete formData.attributes[current]
                                        setAttributes([])
                                        setAttributes(Object.keys(formData.attributes))
                                    }} color="error">
                                        <DeleteIcon />
                                    </IconButton>
                                </div>
                            )}
                        </div>

                        <Button endIcon={<AddCircleOutlineOutlinedIcon />} style={{ marginTop: "1ch" }} onClick={() => {
                            // find smallest unused integer
                            let counter = 0
                            while (true) {
                                const name = "Attribute " + counter
                                if (!(name in formData.attributes)) break
                                counter += 1
                            }
                            formData.attributes["Attribute " + counter] = ""
                            setAttributes([])
                            setAttributes(Object.keys(formData.attributes))
                        }}>Add Attribute</Button>


                        <LoadingButton loading={submitLoading} color="success" variant="contained" onClick={() => { handleSubmit() }} style={{ marginTop: "2ch" }} endIcon={<CheckIcon />}>Publish Item</LoadingButton>
                    </div>
                )}
            </Grow>
        )}
    </div >
)
}

export default SingeListing