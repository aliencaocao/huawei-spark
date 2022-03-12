import { Divider, Paper, Avatar, Skeleton } from '@mui/material'
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import VideocamIcon from '@mui/icons-material/Videocam';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbDownOffAltOutlinedIcon from '@mui/icons-material/ThumbDownOffAltOutlined';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import { blue } from '@mui/material/colors';

const listLoadingSkeleton = []
for (let i = 0; i < 3; i++) {
    listLoadingSkeleton.push(
        <Skeleton animation="wave" variant="rectangular" height="30vh" width="20vh" style={{ marginRight: "2ch" }} />
    )
}


const VideoList = (props) => {

    return (
        <div style={{ overflowX: "auto", overflowY: "hidden", display: "flex", width: "100%" }}>
            {props.loading ? (
                <div key={"loading-video"} style={{ display: "flex" }}>
                    {listLoadingSkeleton}
                </div>
            ) : (
                props.data && props.data.length > 0 ? (
                    props.data.map((current) =>
                        <Paper key={current.name + "-video"} className='listing-styles' elevation={12} style={{ width: "45vw", marginLeft: "1ch" }} onClick={() => { props.handleVideoClick(current.obs_location) }}>
                            <div>
                                <img src={`https://ecoshop-content.obs.ap-southeast-3.myhuaweicloud.com/mpc-video/${current.obs_location}/thumbnail.jpg`} style={{ width: "100%", height: "15ch", objectFit: "cover" }} />
                            </div>
                            <div className='listing-info-style'>
                                <div style={{ display: "flex" }}>
                                    <VideocamIcon style={{ marginRight: "3px", color: blue[500] }} /> <h5 className='listing-title-style'> {current.name}</h5>
                                </div>
                                <span className='listing-bookmark-style'><ThumbUpOutlinedIcon /> <span className='listing-bookmark-number-style'>{current.likes}</span> <ThumbDownOffAltOutlinedIcon style={{ marginLeft: "1ch" }} /> <span className='listing-bookmark-number-style'>{current.dislikes}</span></span>

                                <Divider />
                                <span className='listing-owner-style'>
                                    <Avatar style={{ height: "3ch", width: "3ch", backgroundColor: blue[500] }}>
                                        <AccountCircleIcon />
                                    </Avatar>
                                    <span className='listing-owner-name-style'>
                                        {current.owner}
                                    </span>
                                </span>
                            </div>
                        </Paper>
                    )
                ) : (
                    <div key={"empty-video"} style={{ width: "100%", padding: "16px" }}>
                        <Paper style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2ch" }} elevation={12}>
                            <VideocamOffIcon style={{ fontSize: "5ch", color: "#2196f3" }} />
                            <h3>No Videos Were Found</h3>
                            <span>Perhaps try typing a different search query?</span>
                        </Paper>
                    </div>
                )

            )}

        </div>
    );
}

export default VideoList;
