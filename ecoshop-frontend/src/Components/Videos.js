import { CircularProgress, SwipeableDrawer, Paper } from '@mui/material'
import SwipeableViews from 'react-swipeable-views';
import { virtualize } from 'react-swipeable-views-utils';
import { useEffect, useState, Fragment } from 'react';
import { useSnackbar } from 'notistack';
import shaka from 'shaka-player/dist/shaka-player.ui'
import { mod } from 'react-swipeable-views-core';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbDownOffAltOutlinedIcon from '@mui/icons-material/ThumbDownOffAltOutlined';

const VirtualizeSwipeableViews = virtualize(SwipeableViews);
let videoData = []
let currentVideoIndexPlaying = 0
let currentSliderIndex = 0
let playWhenReady = false;
let player = null;

const Videos = (props) => {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const [currentData, setCurrentData] = useState({})
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
            `https://ecoshop-data.obs.ap-southeast-3.myhuaweicloud.com/mpc-video/${video_id}/${(await shaka.Player.probeSupport()).manifest.mpd ? 'index.mpd' : 'output.m3u8'}`
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
        console.log("video ended")
        handleChangeIndex(props.currentSliderIndexRef.current + 1)
    }

    function slideRenderer(params) {
        const { index, key } = params;

        console.log(index)
        switch (mod(index, 1)) {
            case 0:
                return (
                    <div className="video-container-style" style={{position: "absolute"}} key={"video-" + index}>
                        
                        <div style={{ overflow: "hidden", position: "absolute", right: "1%", bottom: "8%", zIndex: 3 }}>
                            <div style={{ display: "flex", fontSize: "2ch", flexDirection: "column", alignItems: "center" }}><ThumbUpOutlinedIcon style={{ marginRight: "1ch" }} /> {currentData.likes}</div>
                            <div style={{ display: "flex", marginTop: "1ch", fontSize: "2ch", flexDirection: "column", alignItems: "center" }}><ThumbDownOffAltOutlinedIcon style={{ marginRight: "1ch" }} /> {currentData.dislikes}</div>
                        </div>
                        <div className="video-container-style"  ref={(element) => {
                        if (element) videoContainerRef[index] = element
                        if (playWhenReady) {
                            playVideo(videoData[currentVideoIndexPlaying].obs_location)
                            playWhenReady = false
                        } 
                    }} >
                           <video ref={(element) => {
                            if (element) videoPlayerRef[index] = element
                        }} style={{ width: "100%", height: "100%" }} /> 
                        </div>
                        

                    </div>
                );

            default:
                return null;
        }
    }

    return (
        <div style={{ overflow: "hidden", display: "flex", width: "100%", height: "100%" }}>
            {loading && (
                <div style={{ overflow: "hidden", position: "absolute", left: "40%", top: "42%", zIndex: 2 }}>
                    <CircularProgress size="10ch" />
                </div>
            )}
            <VirtualizeSwipeableViews overscanSlideAfter={3} index={props.currentSliderIndex} slideRenderer={slideRenderer} onChangeIndex={handleChangeIndex} style={{ height: "95vh", width: "100vw", zIndex: 1 }} />

        </div>
    );
}

export default Videos;
