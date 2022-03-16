import "../css/profile.css";
import "../css/global.css"
import EnergySavingsLeafIcon from '@mui/icons-material/EnergySavingsLeaf';
import { Avatar, Box, Card, CardContent, Divider } from "@mui/material";
import { useState, useEffect, Fragment } from "react";

const Profile = (props) => {
  const [userInfo, setUserInfo] = useState(null);

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

  useEffect(loadProfileDetails, []);

  return (
    <main>
      <h1>Your Profile</h1>
      {userInfo !== null && (
        <Fragment>
          <Box id="profile-top">
            <Avatar src="https://ecoshop-content.obs.ap-southeast-3.myhuaweicloud.com/user-image/dievfAvZhNmFJGAtQrVf1h" />
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
              <Box>
                Buy more things to get more Green Points!
              </Box>
            </CardContent>
          </Card>
        </Fragment>
      )}
    </main>
  )
};

export default Profile;
