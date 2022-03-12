import { CircularProgress, SwipeableDrawer, IconButton, Avatar, Paper, Divider } from '@mui/material'
import SwipeableViews from 'react-swipeable-views';
import { virtualize } from 'react-swipeable-views-utils';
import { useEffect, useState, Fragment } from 'react';
import { useSnackbar } from 'notistack';
import shaka from 'shaka-player/dist/shaka-player.ui'
import { mod } from 'react-swipeable-views-core';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ThumbDownOffAltOutlinedIcon from '@mui/icons-material/ThumbDownOffAltOutlined';
import SwipeDownIcon from '@mui/icons-material/SwipeDown';
import { blue, grey } from '@mui/material/colors';
import ShareIcon from '@mui/icons-material/Share';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import HandymanIcon from '@mui/icons-material/Handyman';

const VirtualizeSwipeableViews = virtualize(SwipeableViews);
let videoData = []
let currentVideoIndexPlaying = 0
let currentSliderIndex = 0
let playWhenReady = false;
let player = null;

const container = window !== undefined ? () => window.document.body : undefined;

const Videos = (props) => {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const [currentData, setCurrentData] = useState({})
    const [openDrawer, setopenDrawer] = useState(false)
    const [loading, setLoading] = useState(true)
    let videoPlayerRef = {}
    let videoContainerRef = {}

    const playVideo = async (video_id) => {
        const currentPlayerRef = videoPlayerRef[currentSliderIndex]
        const currentContainerRef = videoContainerRef[currentSliderIndex]

        function errorHandler(e) {
            console.error('Shaka error');
            console.error(e);
        }

        shaka.polyfill.installAll();
        if (!shaka.Player.isBrowserSupported()) {
            alert('Please use another browser to play videos');
            return;
        }

        player = new shaka.Player(currentPlayerRef);

        player.configure({
            streaming: {
                useNativeHlsOnSafari: false,
            }
        });

        const ui = new shaka.ui.Overlay(
            player,
            currentContainerRef,
            currentPlayerRef
        );
        ui.configure({
            'controlPanelElements': ["time_and_duration", "mute"]
        })

        let prevVol = 0;
        const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
        currentContainerRef.addEventListener('keydown', e => {
            switch (e.key) {
                case 'f':
                    currentContainerRef.requestFullscreen();
                    break;
                case ' ':
                case 'k':
                    currentPlayerRef[currentPlayerRef.paused ? 'play' : 'pause']();
                    break;
                case 'ArrowLeft':
                    currentPlayerRef.currentTime -= 5;
                    break;
                case 'j':
                    currentPlayerRef.currentTime -= 10;
                    break;
                case 'ArrowRight':
                    currentPlayerRef.currentTime += 5;
                    break;
                case 'l':
                    currentPlayerRef.currentTime += 10;
                    break;
                case 'ArrowUp':
                    currentPlayerRef.volume += .1;
                    break;
                case 'ArrowDown':
                    currentPlayerRef.volume -= .1;
                    break;
                case 'm':
                    if (!currentPlayerRef.volume && !prevVol) currentPlayerRef.volume = 1;
                    else if (currentPlayerRef.volume) {
                        prevVol = currentPlayerRef.volume;
                        currentPlayerRef.volume = 0;
                    }
                    else currentPlayerRef.volume = prevVol;
                    break;
                case '<':
                    currentPlayerRef.playbackRate = playbackRates[Math.max(
                        playbackRates.indexOf(currentPlayerRef.playbackRate) - 1,
                        0
                    )];
                    break;
                case '>':
                    currentPlayerRef.playbackRate = playbackRates[Math.min(
                        playbackRates.indexOf(currentPlayerRef.playbackRate) + 1,
                        playbackRates.length - 1
                    )];
                    break;
                default:
                    return;
            }
            e.preventDefault();
        });

        player.addEventListener('error', errorHandler);

        currentPlayerRef.addEventListener('ended', handleVideoEnded)

        player.load(
            `https://ecoshop-content.obs.ap-southeast-3.myhuaweicloud.com/mpc-video/${video_id}/${(await shaka.Player.probeSupport()).manifest.mpd ? 'index.mpd' : 'output.m3u8'}`
        ).catch(errorHandler);

        currentPlayerRef.play()
    }

    useEffect(() => {
        const startup = async () => {
            await fetch(window.globalURL + "/video/query", {
                method: 'post',
                headers: { 'Content-Type': 'application/json', 'Authorization': window.token },
                body: JSON.stringify({})
            }).then((results) => {
                return results.json(); //return data in JSON (since its JSON data)
            }).then(async (data) => {
                if (data.success === true) {
                    console.log(data.listings)
                    videoData = data.listings
                    if (videoData.length > 0) {
                        if (props.videoIDRender !== "") {
                            for (let i = 0; i < videoData.length; i++) {
                                if (videoData[i].obs_location === props.videoIDRender) {
                                    currentVideoIndexPlaying = i
                                    props.setvideoIDRender("")
                                    break
                                }
                            }
                        }
                        currentSliderIndex = props.currentSliderIndex
                        setCurrentData(data.listings[currentVideoIndexPlaying])
                        playVideo(data.listings[currentVideoIndexPlaying].obs_location)
                    }
                }
                else {
                    enqueueSnackbar("Oops. Unknown error", {
                        variant: 'error',
                        autoHideDuration: 2500
                    })
                    console.log(data)
                }

            }).catch((error) => {
                console.log(error)
                enqueueSnackbar("There was an issue connecting to the server", {
                    variant: 'error',
                    autoHideDuration: 2500
                });
            })
            setLoading(false)
        }
        startup()
    }, [])

    const handleChangeIndex = async (index) => {
        props.updateCurrentSliderIndex(index)
        await player.destroy()
        currentSliderIndex = index
        if (currentVideoIndexPlaying === videoData.length - 1) currentVideoIndexPlaying = 0
        else currentVideoIndexPlaying += 1

        setCurrentData(videoData[currentVideoIndexPlaying])
        if (!videoPlayerRef[currentSliderIndex]) playWhenReady = true
        else playVideo(videoData[currentVideoIndexPlaying].obs_location)
    }

    const handleVideoEnded = async () => {
        handleChangeIndex(props.currentSliderIndexRef.current + 1)
    }

    function slideRenderer(params) {
        const { index, key } = params;
        switch (mod(index, 1)) {
            case 0:
                return (
                    <div className="video-container-style" style={{ position: "absolute" }} key={"video-" + index}>

                        {!loading && (
                            <Fragment>
                                <div style={{ overflow: "hidden", position: "absolute", right: "2%", bottom: "11%", zIndex: 3 }}>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                        <IconButton style={{ display: "flex", flexDirection: "column" }}>
                                            <ThumbUpOutlinedIcon style={{ fontSize: "2.4ch" }} />
                                            <span style={{ fontWeight: "bold", fontSize: "1.3ch", marginTop: "1px" }}>{currentData.likes}</span>
                                        </IconButton>

                                    </div>
                                    <div style={{ display: "flex", marginTop: "2px", flexDirection: "column", alignItems: "center" }}>
                                        <IconButton style={{ display: "flex", flexDirection: "column" }}>
                                            <ThumbDownOffAltOutlinedIcon style={{ fontSize: "2.4ch" }} />
                                            <span style={{ fontWeight: "bold", fontSize: "1.3ch", marginTop: "1px" }}>{currentData.likes}</span>
                                        </IconButton>


                                    </div>
                                    <div style={{ display: "flex", marginTop: "2px", flexDirection: "column", alignItems: "center" }}>
                                        <IconButton style={{ display: "flex", flexDirection: "column" }}>
                                            <ShareIcon style={{ fontSize: "2.5ch" }} />
                                            <span style={{ fontWeight: "bold", fontSize: "1.1ch", marginTop: "1px" }}>Share</span>
                                        </IconButton>

                                    </div>
                                </div>

                                <div style={{ overflow: "hidden", position: "absolute", left: "3%", bottom: "4%", zIndex: 3, display: "flex", flexDirection: "column" }}>
                                    <div style={{ fontWeight: 450, display: "flex", alignItems: 'center' }}>
                                        <span style={{ display: 'inline-block', maxWidth: "70vw", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", marginRight: "5px" }}>{currentData.name}</span> 
                                        <span style={{marginRight: "5px"}}>•</span> 
                                        <span style={{ color: blue[300] }}> ${currentData.price}</span>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", marginTop: "3px" }}>
                                        <Avatar style={{ height: "3ch", width: "3ch", marginRight: "1ch", backgroundColor: blue[500] }}>
                                            <AccountCircleIcon />
                                        </Avatar>
                                        {currentData.owner}
                                    </div>
                                </div>


                                <div style={{ overflow: "hidden", position: "absolute", left: "3%", bottom: "2%", zIndex: 3, display: "flex", alignItems: "center" }}>

                                </div>

                                <div style={{ overflow: "hidden", position: "absolute", width: "100%", top: "1%", zIndex: 3, textAlign: "center" }}>
                                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>Swipe For Product/Service Info <SwipeDownIcon style={{ marginLeft: "5px" }} /></span>
                                </div>


                            </Fragment>
                        )}

                        <div className="video-container-style" ref={(element) => {
                            if (element) videoContainerRef[index] = element
                            if (playWhenReady) {
                                playVideo(videoData[currentVideoIndexPlaying].obs_location)
                                playWhenReady = false
                            }
                        }} >
                            <video ref={(element) => {
                                if (element) videoPlayerRef[index] = element
                            }} style={{ width: "100%", height: "98%" }} />
                        </div>


                    </div>
                );

            default:
                return null;
        }
    }

    return (
        <div className='fadeIn' style={{ overflow: "hidden", display: "flex", width: "100%", height: "100%" }}>
            {loading && (
                <div style={{ overflow: "hidden", position: "absolute", left: "40%", top: "42%", zIndex: 2 }}>
                    <CircularProgress size="10ch" />
                </div>
            )}
            <SwipeableDrawer
                className='video-drawer'
                container={container}
                anchor="top"
                open={openDrawer}
                onClose={() => { setopenDrawer(false) }}
                onOpen={() => { setopenDrawer(true) }}
                swipeAreaWidth={100}
                disableSwipeToOpen={false}
                ModalProps={{
                    keepMounted: true,
                }}
                disableBackdropTransition={true}
                PaperProps={{ style: { borderRadius: "25px", borderTopRightRadius: "0px", borderTopLeftRadius: "0px" } }}
            >
                <div style={{ margin: "2ch" }} >
                    <img src={currentData.obs_image} style={{ width: "100%", height: "15ch", objectFit: "cover" }} />
                    <div className='listing-info-style'>
                        <h5 className='listing-title-style'>{currentData.name}</h5>
                        <h4 className='listing-price-style'>${currentData.price}</h4>
                        <h5 className='listing-quantity-style'><b>Amount:</b> {currentData.quantity}</h5>
                        <h5 className='listing-type-style'>{currentData.type === 1 ? (<Fragment><ShoppingBasketIcon className='type-style' /><span>Product</span></Fragment>) : (<Fragment><HandymanIcon /><span>Repair Service</span></Fragment>)}</h5>

                        <span className='listing-bookmark-style'><FavoriteBorderIcon /> <span className='listing-bookmark-number-style'>{currentData.bookmarks}</span></span>
                        <Divider />
                        <span className='listing-owner-style'>
                            <Avatar style={{ height: "3ch", width: "3ch", backgroundColor: blue[500] }}>
                                <AccountCircleIcon />
                            </Avatar>
                            <span className='listing-owner-name-style'>
                                {currentData.owner}
                            </span>
                        </span>
                    </div>

                    <div className='puller-style'> </div>
                </div>
            </SwipeableDrawer>
            <VirtualizeSwipeableViews overscanSlideAfter={3} index={props.currentSliderIndex} slideRenderer={slideRenderer} onChangeIndex={handleChangeIndex} style={{ height: "95vh", width: "100vw", zIndex: 1 }} />

        </div>
    );
}

export default Videos;
