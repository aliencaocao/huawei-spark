import "../css/profile.css";
import "../css/global.css"
import EnergySavingsLeafIcon from '@mui/icons-material/EnergySavingsLeaf';
import VideocamIcon from '@mui/icons-material/Videocam';
import { Avatar, Box, Button, Card, CardContent, CircularProgress, Divider, Grid, Paper } from "@mui/material";
import { useState, useEffect, Fragment } from "react";
import { AccountCircle, Person } from "@mui/icons-material";

const Profile = (props) => {
  const [userInfo, setUserInfo] = useState(null);
  const [userListings, setUserListings] = useState([]);

  let tokenData;
  if (window.token) {
    tokenData = JSON.parse(window.token.split(".")[0]);
  }

  const loadProfileDetails = () => {
    fetch(`${window.globalURL}/user/info`, {
      method: "POST",
      headers: { "Authorization": window.token },
    })
        .then((res) => res.json())
        .then(({ userInfo: receivedUserInfo }) => {
          setUserInfo(receivedUserInfo);
        });
  };

  const loadUserListings = () => {
    fetch(`${window.globalURL}/product/owned`, {
      method: "POST",
      headers: { "Authorization": window.token },
    })
        .then((res) => res.json())
        .then(({ listings }) => {
          setUserListings(listings);
        });
  };

  useEffect(() => {
    loadProfileDetails();
    loadUserListings();
  }, []);

  return (
    <main>
      <h1>My Profile</h1>
      {userInfo === null ? <CircularProgress sx={{ alignSelf: "center" }} /> : (
        <Fragment>
          <Box id="profile-top">
            {/* <Avatar src="https://ecoshop-content.obs.ap-southeast-3.myhuaweicloud.com/user-image/dievfAvZhNmFJGAtQrVf1h" /> */}
            <Avatar><AccountCircle /></Avatar>
            <Box id="profile-top-text">
              <h1>{tokenData.username}</h1>
              <h2>Joined {
                new Date(userInfo.created).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              }</h2>
              <h2>Plan: EcoShop {userInfo.plan === 0 ? "Free" : "Pro"}</h2>
            </Box>
          </Box>
          
          <Card id="profile-green-points">
            <CardContent>
              <Box>
                <h1><EnergySavingsLeafIcon /> {userInfo.green}</h1>
                <span>Green Points</span>
              </Box>
              <Divider orientation="vertical" flexItem />
              <Box>Buy more things to get more Green Points!</Box>
            </CardContent>
          </Card>

          <h2>My Listings</h2>
          {
            userListings.length > 0 ? (
              <Grid container spacing={2} className="profile-listings">
                {userListings.map((listing) => (
                  <Grid item xs={6} key={listing.id}>
                    <Paper>
                      <img src={window.mediaURL + listing.obs_image} />
                      <Box className="profile-listing-text">
                        <h3>{listing.name}</h3>
                        <div>${listing.price}</div>
                        <div>Quantity: {listing.quantity}</div>
                        <Button
                          variant="outlined"
                          size="medium"
                          className="profile-listing-add-video-button"
                        ><VideocamIcon />Add video</Button>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : "No listings."
          }
        </Fragment>
      )}
    </main>
  )
};

export default Profile;
