import sales from './../assets/sales.jpg';
import { Paper, SwipeableDrawer, Chip, Button } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import fragrance from './../assets/fragrance.png'
import { useState } from 'react';

const container = window !== undefined ? () => window.document.body : undefined;
const BulkListing = () => {
    const [openDrawer, setopenDrawer] = useState(false)

    return (
        <div style={{ margin: -10 }}>
            <img src={sales} style={{ width: "100%" }} />

            <SwipeableDrawer
                container={container}
                anchor="bottom"
                open={openDrawer}
                onClose={() => { setopenDrawer(false) }}
                onOpen={() => { setopenDrawer(true) }}
                swipeAreaWidth={500}
                disableSwipeToOpen={false}
                ModalProps={{
                    keepMounted: true,
                }}
                style={{marginTop: "50vh"}}

            >
                <div style={{ padding: "10px"}}>
                    <h1>Products In This Video</h1>

                    <div style={{ padding: "7px", overflowY: "auto" }}>
                    <Paper elevation={24} style={{ marginBottom: "1ch", borderRadius: "10px", padding: "10px", position: "relative" }}>
                            <h2>Vintage Fragance</h2>

                            <img src={fragrance}/>

                            <span><b>Description: </b>Fragance straight from venice</span>
                            <br />
                            <span><b>Amount: </b><code>2</code></span>
                            <br />
                            <span><b>Tags: </b>
                                <Chip
                                    style={{ marginRight: "4px" }}
                                    label="Beauty"
                                    onClick={() => { }}
                                    onDelete={() => { }}
                                />
                                <Chip
                                    style={{ marginRight: "4px" }}
                                    label="Fragrance"
                                    onClick={() => { }}
                                    onDelete={() => { }}
                                />
                                
                            </span>
                            <br />
                            <Button variant="contained" style={{ marginTop: "2ch" }} startIcon={<VisibilityIcon />}>View Item </Button>
                        </Paper>

                      
                    </div>
                </div>
            </SwipeableDrawer>
        </div>
    )
}

export default BulkListing