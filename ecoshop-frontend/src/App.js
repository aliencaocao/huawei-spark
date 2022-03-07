import './App.css';
import { Grow, Fade, CircularProgress, BottomNavigation, BottomNavigationAction, Button, Paper, Checkbox, Grid, Divider, Avatar, AppBar, InputAdornment, TextField, Skeleton } from '@mui/material'
import { Fragment, useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import VideocamIcon from '@mui/icons-material/Videocam';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import BulkListing from './Components/BulkListing';
import Shorts from './Components/Shorts';
import Login from './Components/Login';
import AddCircleTwoToneIcon from '@mui/icons-material/AddCircleTwoTone';
import ChatIcon from '@mui/icons-material/Chat';
import officerChair from './assets/officechair.png';
import PullToRefresh from 'react-simple-pull-to-refresh';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import HandymanIcon from '@mui/icons-material/Handyman';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ecoShopIcon from './assets/ecoshop.svg';
import { debounce } from 'lodash';
import { blue } from '@mui/material/colors';


window.globalURL = "https://c2c098ec16264e4dbf33c1f9a0b88d42.apig.ap-southeast-3.huaweicloudapis.com"

const listLoadingSkeleton = []
for (let i = 0; i < 6; i++) {
  listLoadingSkeleton.push(
    <Grid item xs={6} sm={6} md={4} lg={3}>
      <Skeleton animation="wave" variant="rectangular" height="30vh" />
    </Grid>)
}
let attributesList = []
let fieldsObj = {}

const searchQuery = debounce(async (query, setListLoading, updateItemList, enqueueSnackbar, updateFilterList) => {
  setListLoading(true)
  let body = {}
  if (query !== "") { body.query = query
  await Promise.all([
    fetch(window.globalURL + "/product/query", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', "Authorization": window.token },
      body: JSON.stringify(body)
    }).then((results) => {
      return results.json(); //return data in JSON (since its JSON data)
    }).then(async (data) => {
      if (data.success === true) {
        updateItemList(data)
      }
      else {
        enqueueSnackbar("Oops. Unknown error", {
          variant: 'error',
          autoHideDuration: 2500
        })
        console.log(data)
      }

    }).catch((error) => {
      enqueueSnackbar("There was an issue connecting to the server", {
        variant: 'error',
        autoHideDuration: 2500
      });
      console.log(error)
    })
    ,
    fetch(window.globalURL + "/product/attributes/query", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', "Authorization": window.token },
      body: JSON.stringify(body)
    }).then((results) => {
      return results.json(); //return data in JSON (since its JSON data)
    }).then(async (data) => {
      if (data.success === true) {
        attributesList = []
        fieldsObj = {}
        let queryAttributeList = []
        for (let i = 0; i < data.attributes.length; i++) {
          const current = data.attributes[i]
          const queryAttribute = (
            <div key={current.attr_name + "-attribute"} style={{ display: "flex", alignItems: "center", marginTop: "1ch", textTransform: "capitalize" }}>
              <Checkbox name={"check-" + current.attr_name} />
              <span style={{ marginRight: "1ch", whiteSpace: "nowrap" }}>{current.attr_name}: </span>
              <TextField name={"value-" + current.attr_name} size="small" placeholder="Enter value" />
            </div>)
          queryAttributeList.push(queryAttribute)
          attributesList.push(current.attr_name)
        }
        updateFilterList(queryAttributeList)

      }
      else {
        enqueueSnackbar("Oops. Unknown error", {
          variant: 'error',
          autoHideDuration: 2500
        })
        console.log(data)
      }

    }).catch((error) => {
      enqueueSnackbar("There was an issue connecting to the server", {
        variant: 'error',
        autoHideDuration: 2500
      });
      console.log(error)
    })])
  }
  else {
    await fetch(window.globalURL + "/product/query", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', "Authorization": window.token },
      body: JSON.stringify(body)
    }).then((results) => {
      return results.json(); //return data in JSON (since its JSON data)
    }).then(async (data) => {
      if (data.success === true) {
        updateItemList(data)
      }
      else {
        enqueueSnackbar("Oops. Unknown error", {
          variant: 'error',
          autoHideDuration: 2500
        })
        console.log(data)
      }

    }).catch((error) => {
      enqueueSnackbar("There was an issue connecting to the server", {
        variant: 'error',
        autoHideDuration: 2500
      });
      console.log(error)
    })
    attributesList = []
    fieldsObj = {}
    updateFilterList([])
  }
  setListLoading(false)
}, 300)


const App = () => {
  const [page, updatePage] = useState("home")
  const [token, updateToken] = useState(null)
  const [username, updateUsername] = useState("")
  const [loadingGlobal, updateLoadingGlobal] = useState(true)
  const [itemListRender, updateItemListRender] = useState([])
  const [filterList, updateFilterList] = useState([])
  const [listLoading, setListLoading] = useState(false)
  const [searchMode, setSearchMode] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const handleNewLogin = (token, rememberMe) => {
    updateToken(token)
    const tokenData = JSON.parse(token.split(".")[0])
    updateUsername(tokenData.username)
    if (rememberMe) localStorage.setItem("ecoshop-token", token)
    window.token = token

    enqueueSnackbar("Welcome back " + tokenData.username + "!", { variant: "success", autoHideDuration: 1500 })
    loadItemList()
  }

  const handleLogout = () => {
    updateToken(null)
    updateUsername("")
    window.token = null
    localStorage.removeItem("ecoshop-token")
  }

  const handleFilterSubmit = async (e) => {
    console.log(e)
    for (let i = 0; i < attributesList.length; i++) {
      const currentCheckbox = e.target["check-" + attributesList[i]]
      console.log(currentCheckbox.checked)
      if (currentCheckbox.checked) {
        const currentValue = e.target["value-" + attributesList[i]]
        console.log(currentValue)
      }
    }
  }

  const updateItemList = async (data) => {
    let itemList = []
    for (let i = 0; i < data.listings.length; i++) {
      const current = data.listings[i]
      const itemComponent = (
        <Grid item xs={6} sm={6} md={4} lg={3} key={current.name + "-" + current.owner}>
          <Paper className='listing-styles' elevation={12}>
            <img src={officerChair} style={{ width: "100%", maxHeight: "15ch" }} />
            <div className='listing-info-style'>
              <h5 className='listing-title-style'>{current.name}</h5>
              <h4 className='listing-price-style'>${current.price}</h4>
              <h5 className='listing-quantity-style'><b>Amount:</b> {current.quantity}</h5>
              <h5 className='listing-type-style'>{current.type === 1 ? (<Fragment><ShoppingBasketIcon className='type-style' /><span>Product</span></Fragment>) : (<Fragment><HandymanIcon /><span>Repair Service</span></Fragment>)}</h5>

              <span className='listing-bookmark-style'><FavoriteBorderIcon /> <span className='listing-bookmark-number-style'>{current.bookmarks}</span></span>
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
        </Grid>
      )
      itemList.push(itemComponent)

    }
    updateItemListRender(itemList)
  }

  const loadItemList = async () => {
    setListLoading(true)
    await fetch(window.globalURL + "/product/query", {
      method: 'post',
      headers: { 'Content-Type': 'application/json', 'Authorization': window.token },
      body: JSON.stringify({})
    }).then((results) => {
      return results.json(); //return data in JSON (since its JSON data)
    }).then(async (data) => {
      if (data.success === true) {
        updateItemList(data)
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
    setListLoading(false)
  }

  useEffect(() => {

    const startup = async () => {
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

              loadItemList()
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

    }
    startup()
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
                      <div style={{ height: "5ch", margin: "1ch", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <img className={(searchMode ? 'shrink-animation-style' : 'grow-animation-style') + ' icon-style'} src={ecoShopIcon} />
                        <TextField value={searchValue} onChange={(e) => { searchQuery(e.target.value, setListLoading, updateItemList, enqueueSnackbar, updateFilterList); setSearchValue(e.target.value) }} onClick={() => { if (!searchMode) setSearchMode(true) }} variant='outlined' style={{ width: "100%", marginLeft: "1ch", marginRight: "1ch" }} placeholder='Search' size="small"
                          InputProps={
                            searchMode ? {
                              startAdornment: (
                                <InputAdornment position="start" onClick={() => {
                                  setSearchMode(false);
                                  if (searchValue !== "") {
                                    loadItemList()
                                    setSearchValue("")
                                  }
                                }
                                }>
                                  <ArrowBackIcon />
                                  <Divider orientation="vertical" />
                                </InputAdornment>
                              ),
                              endAdornment: (
                                <InputAdornment position="end">
                                  <SearchIcon />
                                </InputAdornment>
                              )
                            }
                              :
                              {
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <SearchIcon />
                                  </InputAdornment>
                                ),
                              }}>
                        </TextField>

                      </div>
                    </AppBar>
                    <PullToRefresh isPullable={!searchMode} onRefresh={loadItemList} pullDownThreshold={120} maxPullDownDistance={145} refreshingContent={(<h1 className='pull-text-style' style={{ color: "#4caf50" }}>Let go to refresh <ArrowDownwardIcon /></h1>)} pullingContent={(<h5 className='pull-text-style'>Pull to refresh <ArrowUpwardIcon /></h5>)}>
                      <Grow in={true}>
                        <div style={{ height: "fit-content", width: "100%", overflowX: "hidden", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.3ch", flexDirection: "column", paddingBottom: "10vh", marginTop: "6ch" }}>
                          {searchMode && (
                            <Paper elevation={12} style={{ width: "100%", padding: "2ch", marginTop: "1ch" }}>
                              <span style={{ fontSize: "2ch", fontWeight: "bold" }}>Filters {listLoading && (<CircularProgress size="2ch" style={{marginLeft: "1ch"}} />)}</span>
                              {!listLoading && (
                                <form
                                  style={{ display: "flex", flexDirection: "column", width: "100%", justifyContent: "center" }}
                                  onSubmit={async (e) => {
                                    e.preventDefault()
                                    handleFilterSubmit(e)
                                  }}
                                >
                                  {filterList}
                                  <Button type="submit">Submit</Button>
                                </form>
                              )}
                            </Paper>
                          )}
                          <Divider textAlign='left' style={{ alignSelf: "start", width: "100%" }}>{searchMode ? (<h5 style={{ fontSize: "2ch", fontWeight: "normal" }}>Video Results For: <b>{searchValue}</b></h5>) : (<h2>Your Videos</h2>)}</Divider>
                          <Divider textAlign='left' style={{ alignSelf: "start", width: "100%" }}>{searchMode ? (<h5 style={{ fontSize: "2ch", fontWeight: "normal" }}>Item/Services Results For: <b>{searchValue}</b></h5>) : (<h2>Your Picks</h2>)}</Divider>


                          {listLoading ? (
                            <Grid container spacing={2}>
                              {listLoadingSkeleton}
                            </Grid>
                          )
                            : (
                              <Fade in={true}>
                                <Grid container spacing={2} style={{ width: "100%" }}>
                                  {itemListRender.length === 0 ? (
                                    <Grid item columns={12} style={{ width: "100%" }}>
                                      <Paper style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2ch" }} elevation={12}>
                                        <SentimentDissatisfiedIcon style={{ fontSize: "5ch", color: "#2196f3" }} />
                                        <h3>No Results Were Found</h3>
                                        <span>Perhaps try typing a different search query?</span>
                                      </Paper>
                                    </Grid>
                                  ) : (
                                    <Fragment>
                                      {itemListRender}
                                    </Fragment>
                                  )}
                                </Grid>
                              </Fade>
                            )}


                        </div>
                      </Grow>
                    </PullToRefresh>
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
                      label="Sell"
                      value="sell"
                      showLabel
                      style={{ color: "#4caf50", fontWeight: "bold" }}
                      icon={<AddCircleTwoToneIcon style={{ fontSize: "4ch" }} />}
                    />
                    <BottomNavigationAction
                      label="Chats"
                      value="chats"
                      icon={<ChatIcon />}
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
        )
      }

    </div >
  );
}

/*
                    <Button variant="contained" style={{ marginRight: 5 }} onClick={() => { updatePage("bulk") }}>Bulk Listing</Button>
                    <Button variant="contained" onClick={() => { updatePage("shorts") }}>EcoShop Shorts</Button>
                    <Button variant="contained" onClick={() => { handleLogout() }}>Log Out</Button>
                    */
export default App;
