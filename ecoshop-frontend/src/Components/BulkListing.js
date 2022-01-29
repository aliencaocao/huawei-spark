import bulklisting from './../assets/bulklisting.png'
import officechair from './../assets/officechair.png'
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import InfoIcon from '@mui/icons-material/Info';
import CheckIcon from '@mui/icons-material/Check';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { Paper, Divider, Chip, Button, IconButton } from '@mui/material';
import { blue } from '@mui/material/colors';

const BulkListing = () => {
    return (
        <div style={{ padding: "6px" }}>
            <h1 style={{ color: blue[500] }}>Batch Listing <FormatListBulletedIcon /></h1>

            <Paper elevation={16} style={{ display: "flex", alignContent: "center", justifyContent: "center", marginBottom: "1ch", borderRadius: "15px", padding: "7px" }}>
                <img src={bulklisting} style={{ margin: "10px", width: "95%" }} />
            </Paper>
            <span style={{ marginBottom: "1ch", fontSize: "90%", display: "flex", alignItems: "center" }}> <InfoIcon style={{ marginRight: "5px" }} /> Please select the items above that you want to sell.</span>

            <Button variant="contained" startIcon={<FileUploadIcon />} style={{marginBottom: "2ch", marginTop: "3ch"}}>Upload Different Image</Button>

            <Divider />
            <h2 style={{ color: blue[500] }}>Items Selected <CheckIcon color="success" /></h2>

            <div style={{ padding: "7px", overflowY: "auto" }}>
                <Paper elevation={12} style={{ marginBottom: "1ch", borderRadius: "10px", padding: "10px", position: "relative" }}>
                    <IconButton color="error" style={{ position: "absolute", top: "7px", right: "7px" }}>
                        <DeleteIcon />
                    </IconButton>
                    <h2>Red Office Chair</h2>

                    <img src={officechair} style={{height: "10ch", marginBottom: "1ch"}}/>
                     
                     <br/>
                    <span><b>Generated Description: </b>A red table top office chair</span>
                    <br />
                    <span><b>Amount: </b><code>2</code></span>
                    <br />
                    <span><b>Tags: </b>
                        <Chip
                            style={{ marginRight: "4px" }}
                            label="Office"
                            onClick={() => { }}
                            onDelete={() => { }}
                        />
                        <Chip
                            style={{ marginRight: "4px" }}
                            label="Chair"
                            onClick={() => { }}
                            onDelete={() => { }}
                        />
                        <Chip
                            style={{ marginRight: "4px" }}
                            label="Red"
                            onClick={() => { }}
                            onDelete={() => { }}
                        />
                    </span>
                    <br />
                    <Button variant="contained" style={{ marginTop: "2ch" }} startIcon={<EditIcon />}>Edit Item </Button>
                </Paper>
            </div>

        </div>
    )
}

export default BulkListing