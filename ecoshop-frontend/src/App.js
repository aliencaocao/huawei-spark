import './App.css';
import { Grow, CircularProgress, BottomNavigation, BottomNavigationAction, Paper, Grid, Divider, Avatar, AppBar, InputAdornment, TextField } from '@mui/material'
import { Fragment, useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import VideocamIcon from '@mui/icons-material/Videocam';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import BulkListing from './Components/BulkListing';
import Shorts from './Components/Shorts';
import Login from './Components/Login';
import officerChair from './assets/officechair.png';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ecoShopIcon from './assets/ecoshop.svg';
import { blue } from '@mui/material/colors';


window.globalURL = "https://c2c098ec16264e4dbf33c1f9a0b88d42.apig.ap-southeast-3.huaweicloudapis.com"

const App = () => {
  const [page, updatePage] = useState("home")
  const [token, updateToken] = useState(null)
  const [username, updateUsername] = useState("")
  const [loadingGlobal, updateLoadingGlobal] = useState(true)
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const handleNewLogin = (token, rememberMe) => {
    updateToken(token)
    const tokenData = JSON.parse(token.split(".")[0])
    updateUsername(tokenData.username)
    if (rememberMe) localStorage.setItem("ecoshop-token", token)
    window.token = token

    enqueueSnackbar("Welcome back " + tokenData.username + "!", { variant: "success", autoHideDuration: 1500 })
  }

  const handleLogout = () => {
    updateToken(null)
    updateUsername("")
    window.token = null
    localStorage.removeItem("ecoshop-token")
  }

  useEffect(async () => {
    if (token === null) {
      const localStorageToken = localStorage.getItem("ecoshop-token")
      if (localStorageToken !== null) {
        updateToken(localStorageToken)
        window.token = localStorageToken

        await fetch(window.globalURL + "/check-token", {
          method: 'get',
          headers: { 'Content-Type': 'application/json', "Authorization": window.token },
        }).then((results) => {
          return results.json(); //return data in JSON (since its JSON data)
        }).then(async (data) => {
          if (data.success === true) {
            const tokenData = JSON.parse(localStorageToken.split(".")[0])

            updateUsername(tokenData.username)
            enqueueSnackbar("Welcome back " + tokenData.username + "!", {
              variant: 'success',
              autoHideDuration: 1500
            });
          }
          else {
            //Might be a fake token since server does not have it, exit
            updateToken(null)
            window.token = null
            localStorage.removeItem("ecoshop-token")
            enqueueSnackbar("There was an error while restoring your session. Please re-login", {
              variant: 'error',
              autoHideDuration: 2500
            });
          }
        }).catch((error) => {
          updateToken(null)
          window.token = null
          enqueueSnackbar("There was an issue connecting to the server", {
            variant: 'error',
            autoHideDuration: 2500
          });
          console.log(error)
        })
      }
    }
    updateLoadingGlobal(false)

  }, [])

  return (
    <div style={{ overflowX: "hidden", overflowY: "auto", height: "100vh", width: "100vw" }}>
      {loadingGlobal ? (
        <div style={{ overflow: "hidden", height: "97vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CircularProgress size="10ch" />
        </div>
      ) :
        (
          <Fragment>
            {token ? (
              <div className='fadeIn' style={{ height: "100%", width: "100%" }}>

                {page === "home" && (
                  <Fragment>
                    <AppBar>
                      <div style={{ margin: "1ch", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <img src={ecoShopIcon} style={{ height: "6ch" }} />
                        <TextField variant='outlined' style={{ width: "100%", marginLeft: "1ch", marginRight: "1ch" }} placeholder='Search 2nd Hand Items' size="small"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon />
                              </InputAdornment>
                            ),
                          }}>
                        </TextField>
                      </div>
                    </AppBar>
                    <Grow in={true}>
                      <div style={{ height: "fit-content", width: "100%", overflowX: "hidden", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.3ch", flexDirection: "column", paddingBottom: "10vh", marginTop: "6ch" }}>
                        <Divider textAlign='left' style={{ alignSelf: "start", width: "100%" }}><h2>Explore Categories</h2></Divider>
                        <Divider textAlign='left' style={{ alignSelf: "start", width: "100%" }}><h2>Your Picks</h2></Divider>
                        <Grid container spacing={2}>
                          <Grid item xs={6} sm={6} md={4} lg={3}>
                            <Paper className='listing-styles' elevation={12}>
                              <img src={officerChair} style={{ width: "100%", maxHeight: "15ch" }} />
                              <div className='listing-info-style'>
                                <h5 className='listing-title-style'>A very nice red office chair which is brand new!</h5>
                                <h4 className='listing-price-style'>$999</h4>
                                <h5 className='listing-type-style'><b>Type:</b> Office Chair</h5>
                                <h5 className='listing-quantity-style'><b>Amount:</b> 1</h5>

                                <span className='listing-bookmark-style'><FavoriteBorderIcon /> <span className='listing-bookmark-number-style'>32</span></span>
                                <Divider />
                                <span className='listing-owner-style'>
                                  <Avatar style={{ height: "3ch", width: "3ch", backgroundColor: blue[500] }}>
                                    <AccountCircleIcon />
                                  </Avatar>
                                  <span className='listing-owner-name-style'>
                                    tkai
                                  </span>
                                </span>
                              </div>
                            </Paper>
                          </Grid>
                          <Grid item xs={6} sm={6} md={4} lg={3}>
                            <Paper className='listing-styles' elevation={12}>
                              <img src={officerChair} style={{ width: "100%", maxHeight: "15ch" }} />
                              <div className='listing-info-style'>
                                <h5 className='listing-title-style'>A very nice red office chair</h5>
                                <h4 className='listing-price-style'>$999</h4>
                                <h5 className='listing-type-style'><b>Type:</b> Office Chair</h5>
                                <h5 className='listing-quantity-style'><b>Amount:</b> 1</h5>

                                <span className='listing-bookmark-style'><FavoriteBorderIcon /> <span className='listing-bookmark-number-style'>32</span></span>
                                <Divider />
                                <span className='listing-owner-style'>
                                  <Avatar style={{ height: "3ch", width: "3ch", backgroundColor: blue[500] }}>
                                    <AccountCircleIcon />
                                  </Avatar>
                                  <span className='listing-owner-name-style'>
                                    tkai
                                  </span>
                                </span>
                              </div>
                            </Paper>
                          </Grid>
                          <Grid item xs={6} sm={6} md={4} lg={3}>
                            <Paper className='listing-styles' elevation={12}>
                              <img src={officerChair} style={{ width: "100%", maxHeight: "15ch" }} />
                              <div className='listing-info-style'>
                                <h5 className='listing-title-style'>A very nice red office chair</h5>
                                <h4 className='listing-price-style'>$999</h4>
                                <h5 className='listing-type-style'><b>Type:</b> Office Chair</h5>
                                <h5 className='listing-quantity-style'><b>Amount:</b> 1</h5>

                                <span className='listing-bookmark-style'><FavoriteBorderIcon /> <span className='listing-bookmark-number-style'>32</span></span>
                                <Divider />
                                <span className='listing-owner-style'>
                                  <Avatar style={{ height: "3ch", width: "3ch", backgroundColor: blue[500] }}>
                                    <AccountCircleIcon />
                                  </Avatar>
                                  <span className='listing-owner-name-style'>
                                    tkai
                                  </span>
                                </span>
                              </div>
                            </Paper>
                          </Grid>
                          <Grid item xs={6} sm={6} md={4} lg={3}>
                            <Paper className='listing-styles' elevation={12}>
                              <img src={officerChair} style={{ width: "100%", maxHeight: "15ch" }} />
                              <div className='listing-info-style'>
                                <h5 className='listing-title-style'>A very nice red office chair</h5>
                                <h4 className='listing-price-style'>$999</h4>
                                <h5 className='listing-type-style'><b>Type:</b> Office Chair</h5>
                                <h5 className='listing-quantity-style'><b>Amount:</b> 1</h5>

                                <span className='listing-bookmark-style'><FavoriteBorderIcon /> <span className='listing-bookmark-number-style'>32</span></span>
                                <Divider />
                                <span className='listing-owner-style'>
                                  <Avatar style={{ height: "3ch", width: "3ch", backgroundColor: blue[500] }}>
                                    <AccountCircleIcon />
                                  </Avatar>
                                  <span className='listing-owner-name-style'>
                                    tkai
                                  </span>
                                </span>
                              </div>
                            </Paper>
                          </Grid>
                          <Grid item xs={6} sm={6} md={4} lg={3}>
                            <Paper className='listing-styles' elevation={12}>
                              <img src={officerChair} style={{ width: "100%", maxHeight: "15ch" }} />
                              <div className='listing-info-style'>
                                <h5 className='listing-title-style'>A very nice red office chair</h5>
                                <h4 className='listing-price-style'>$999</h4>
                                <h5 className='listing-type-style'><b>Type:</b> Office Chair</h5>
                                <h5 className='listing-quantity-style'><b>Amount:</b> 1</h5>

                                <span className='listing-bookmark-style'><FavoriteBorderIcon /> <span className='listing-bookmark-number-style'>32</span></span>
                                <Divider />
                                <span className='listing-owner-style'>
                                  <Avatar style={{ height: "3ch", width: "3ch", backgroundColor: blue[500] }}>
                                    <AccountCircleIcon />
                                  </Avatar>
                                  <span className='listing-owner-name-style'>
                                    tkai
                                  </span>
                                </span>
                              </div>
                            </Paper>
                          </Grid>
                          <Grid item xs={6} sm={6} md={4} lg={3}>
                            <Paper className='listing-styles' elevation={12}>
                              <img src={officerChair} style={{ width: "100%", maxHeight: "15ch" }} />
                              <div className='listing-info-style'>
                                <h5 className='listing-title-style'>A very nice red office chair</h5>
                                <h4 className='listing-price-style'>$999</h4>
                                <h5 className='listing-type-style'><b>Type:</b> Office Chair</h5>
                                <h5 className='listing-quantity-style'><b>Amount:</b> 1</h5>

                                <span className='listing-bookmark-style'><FavoriteBorderIcon /> <span className='listing-bookmark-number-style'>32</span></span>
                                <Divider />
                                <span className='listing-owner-style'>
                                  <Avatar style={{ height: "3ch", width: "3ch", backgroundColor: blue[500] }}>
                                    <AccountCircleIcon />
                                  </Avatar>
                                  <span className='listing-owner-name-style'>
                                    tkai
                                  </span>
                                </span>
                              </div>
                            </Paper>
                          </Grid>
                          <Grid item xs={6} sm={6} md={4} lg={3}>
                            <Paper className='listing-styles' elevation={12}>
                              <img src={officerChair} style={{ width: "100%", maxHeight: "15ch" }} />
                              <div className='listing-info-style'>
                                <h5 className='listing-title-style'>A very nice red office chair</h5>
                                <h4 className='listing-price-style'>$999</h4>
                                <h5 className='listing-type-style'><b>Type:</b> Office Chair</h5>
                                <h5 className='listing-quantity-style'><b>Amount:</b> 1</h5>

                                <span className='listing-bookmark-style'><FavoriteBorderIcon /> <span className='listing-bookmark-number-style'>32</span></span>
                                <Divider />
                                <span className='listing-owner-style'>
                                  <Avatar style={{ height: "3ch", width: "3ch", backgroundColor: blue[500] }}>
                                    <AccountCircleIcon />
                                  </Avatar>
                                  <span className='listing-owner-name-style'>
                                    tkai
                                  </span>
                                </span>
                              </div>
                            </Paper>
                          </Grid>
                        </Grid>

                      </div>
                    </Grow>
                  </Fragment>
                )}
                {page === "bulk" && (
                  <BulkListing />
                )}
                {page === "shorts" && (
                  <Shorts />
                )}

                <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={12}>
                  <BottomNavigation sx={{ backgroundColor: "transparent" }} value={page} onChange={(e, newValue) => { updatePage(newValue) }}>
                    <BottomNavigationAction
                      label="Home"
                      value="home"
                      icon={<HomeIcon />}
                    />
                    <BottomNavigationAction
                      label="Videos"
                      value="videos"
                      icon={<VideocamIcon />}
                    />
                    <BottomNavigationAction
                      label={username}
                      value="profile"
                      icon={<AccountCircleIcon />}
                    />
                  </BottomNavigation>
                </Paper>
              </div>
            ) :
              (
                <Login handleNewLogin={handleNewLogin} />
              )
            }

          </Fragment>
        )}

    </div>
  );
}

/*
                    <Button variant="contained" style={{ marginRight: 5 }} onClick={() => { updatePage("bulk") }}>Bulk Listing</Button>
                    <Button variant="contained" onClick={() => { updatePage("shorts") }}>EcoShop Shorts</Button>
                    <Button variant="contained" onClick={() => { handleLogout() }}>Log Out</Button>
                    */
export default App;
