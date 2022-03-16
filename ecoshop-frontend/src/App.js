import './App.css';
import { Grow, Fade, CircularProgress, BottomNavigation, BottomNavigationAction, Paper, Checkbox, Grid, Divider, Avatar, AppBar, InputAdornment, TextField, Skeleton, Select, MenuItem, Button } from '@mui/material'
import { LoadingButton } from '@mui/lab/';
import { Routes, Route } from "react-router-dom";
import { Fragment, useEffect, useState } from 'react';
import useStateRef from 'react-usestateref'
import { useSnackbar } from 'notistack';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import VideocamIcon from '@mui/icons-material/Videocam';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useNavigate, useLocation } from "react-router-dom";
import Login from './Components/Login';
import Create from './Components/Create'
import ChatList from './Components/chats/ChatList';
import AddCircleTwoToneIcon from '@mui/icons-material/AddCircleTwoTone';
import ChatIcon from '@mui/icons-material/Chat';
import VideoList from './Components/VideoList';
import PullToRefresh from 'react-simple-pull-to-refresh';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import HandymanIcon from '@mui/icons-material/Handyman';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FilterListIcon from '@mui/icons-material/FilterList';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ecoShopIcon from './assets/ecoshop.svg';
import Videos from './Components/Videos';
import { debounce } from 'lodash';
import { blue } from '@mui/material/colors';
import ListingDetails from './Components/ListingDetails';


window.globalURL = "https://api.eco-shop.me"
window.mediaURL = "https://ecoshop-content.obs.ap-southeast-3.myhuaweicloud.com/user-image/";

const listLoadingSkeleton = []
for (let i = 0; i < 6; i++) {
  listLoadingSkeleton.push(
    <Grid item xs={6} sm={6} md={4} lg={3}>
      <Skeleton animation="wave" variant="rectangular" height="30vh" />
    </Grid>)
}
let attributesList = []
let attributeData = {}


const debouncedNumberCheck = debounce((e, current, setNumbersValuesList, numberValuesListRef, updateFilterList) => {
  const number = Number(e.target.value)
  if (e.target.value !== "" && !isNaN(number)) {
    numberValuesListRef.current[current.attr_name] = true
    setNumbersValuesList(numberValuesListRef.current)
    renderFilterList(attributeData, numberValuesListRef, setNumbersValuesList, updateFilterList)
  }
  else if (numberValuesListRef.current[current.attr_name]) {
    numberValuesListRef.current[current.attr_name] = false
    setNumbersValuesList(numberValuesListRef.current)
    renderFilterList(attributeData, numberValuesListRef, setNumbersValuesList, updateFilterList)
    // Whenever an item in a list of components changes, you have to RE-CREATE THE ENTIRE LIST for a change to occur
    // react will then look through the list and determine what needs to be re-rendered
  }
}, 100)

const renderFilterList = (data, numberValuesListRef, setNumbersValuesList, updateFilterList) => {
  let queryAttributeList = []
  for (let i = 0; i < data.attributes.length; i++) {
    const current = data.attributes[i]
    const queryAttribute = (
      <div key={current.attr_name + "-attribute"} style={{ display: "flex", alignItems: "center", marginTop: "1ch", textTransform: "capitalize" }}>
        <Checkbox name={"check-" + current.attr_name} />
        <TextField fullWidth onChange={(e) => {
          debouncedNumberCheck(e, current, setNumbersValuesList, numberValuesListRef, updateFilterList)
        }} name={"value-" + current.attr_name} label={current.attr_name} style={{ marginRight: "1ch" }} size="small" />
        {numberValuesListRef.current[current.attr_name] && (
          <Select
            name={"equality-" + current.attr_name}
            label="Age"
            key={"equality-" + current.attr_name}
            defaultValue="gt"
            size='small'
          >
            <MenuItem value="gt">Greater Than</MenuItem>
            <MenuItem value="eq">Equal</MenuItem>
            <MenuItem value="lt">Less Than</MenuItem>
          </Select>
        )}
      </div>)
    queryAttributeList.push(queryAttribute)
  }
  updateFilterList(queryAttributeList)
}

const searchQuery = debounce(async (query, setListLoading, setItems, enqueueSnackbar, updateFilterList, numberValuesListRef, setNumbersValuesList, setFilterLoading, loadVideoList) => {
  setListLoading(true)
  let body = {}
  if (query !== "") {
    setFilterLoading(true)
    body.query = query

    fetch(window.globalURL + "/product/attributes/query", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', "Authorization": window.token },
      body: JSON.stringify(body)
    }).then((results) => {
      return results.json(); //return data in JSON (since its JSON data)
    }).then(async (data) => {
      if (data.success === true) {
        attributesList = []
        let tempNumbersValuesList = {}
        for (let i = 0; i < data.attributes.length; i++) {
          const current = data.attributes[i]
          tempNumbersValuesList[current.attr_name] = false
          attributesList.push(current.attr_name)
        }
        setNumbersValuesList(tempNumbersValuesList)
        attributeData = data
        renderFilterList(data, numberValuesListRef, setNumbersValuesList, updateFilterList)
        if (data.attributes.length === 0) updateFilterList([])
        setFilterLoading(false)
      }
      else {
        enqueueSnackbar("Oops. Unknown error", {
          variant: 'error',
          autoHideDuration: 2500
        })
        console.log(data)
        setFilterLoading(false)
      }

    }).catch((error) => {
      enqueueSnackbar("There was an issue connecting to the server", {
        variant: 'error',
        autoHideDuration: 2500
      });
      console.log(error)
      setFilterLoading(false)
    })
  }
  loadVideoList(query)
  await fetch(window.globalURL + "/product/query", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', "Authorization": window.token },
    body: JSON.stringify(body)
  }).then((results) => {
    return results.json(); //return data in JSON (since its JSON data)
  }).then(async (data) => {
    if (data.success === true) {
      setItems(data.listings)
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

  setListLoading(false)
}, 300)


const App = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [page, updatePage] = useState("")
  // const [token, updateToken] = useState(null)
  const [token, updateToken] = useState(null)
  const [currentPlayer, setCurrentPlayer] = useState(null)
  const [username, updateUsername] = useState("")
  const [currentSliderIndex, updateCurrentSliderIndex, currentSliderIndexRef] = useStateRef(0)
  const [loadingGlobal, updateLoadingGlobal] = useState(true)
  const [items, setItems] = useState([])
  const [openListingId, setOpenListingId] = useState(null)
  const [filterList, updateFilterList] = useState([])
  const [listLoading, setListLoading] = useState(false)
  const [videoData, setVideoData] = useState([])
  const [videoListLoading, setVideoListLoading] = useState(false)
  const [filterloading, setFilterLoading] = useState(false)
  const [searchMode, setSearchMode] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [numberValuesList, setNumbersValuesList, numberValuesListRef] = useStateRef({})
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const handleNewLogin = (token, rememberMe) => {
    updateToken(token)
    const tokenData = JSON.parse(token.split(".")[0])
    updateUsername(tokenData.username)
    if (rememberMe) localStorage.setItem("ecoshop-token", token)
    window.token = token

    enqueueSnackbar("Welcome back " + tokenData.username + "!", { variant: "success", autoHideDuration: 1500 })
    loadItemList()
    loadVideoList()
  }

  const handleLogout = () => {
    updateToken(null)
    updateUsername("")
    window.token = null
    localStorage.removeItem("ecoshop-token")
  }

  const handleFilterSubmit = async (e) => {
    let fieldsObj = []
    for (let i = 0; i < attributesList.length; i++) {
      const currentCheckbox = e.target["check-" + attributesList[i]]
      if (currentCheckbox.checked) {
        let fields = {}
        const currentValue = e.target["value-" + attributesList[i]].value
        fields.attr = attributesList[i]
        if (numberValuesList[attributesList[i]]) {
          // current attribute is a number attribute
          fields.value = Number(currentValue)
          fields.type = "int"
          const currentEquality = e.target["equality-" + attributesList[i]].value
          fields.condition = currentEquality
        }
        else {
          fields.value = currentValue
          fields.type = "str"
        }
        fieldsObj.push(fields)
      }
    }
    if (fieldsObj.length > 0) loadItemList(searchValue, fieldsObj)
  }

  const loadItemList = async (query = false, fields = false) => {
    setListLoading(true)
    let body = {}
    if (fields) body.fields = fields
    if (query) body.query = query
    await fetch(window.globalURL + "/product/query", {
      method: 'post',
      headers: { 'Content-Type': 'application/json', 'Authorization': window.token },
      body: JSON.stringify(body)
    }).then((results) => {
      return results.json(); //return data in JSON (since its JSON data)
    }).then(async (data) => {
      if (data.success === true) {
        // updateItemList(data)
        setItems(data.listings)
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

  const loadVideoList = async (query = false) => {
    setVideoListLoading(true)
    let body = {}
    if (query) body.query = query
    await fetch(window.globalURL + "/video/query", {
      method: 'post',
      headers: { 'Content-Type': 'application/json', 'Authorization': window.token },
      body: JSON.stringify(body)
    }).then((results) => {
      return results.json(); //return data in JSON (since its JSON data)
    }).then(async (data) => {
      if (data.success === true) {
        setVideoData(data.listings)
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
    setVideoListLoading(false)
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
              if (location.pathname !== "/") updatePage(location.pathname.split("/")[1])

              const tokenData = JSON.parse(localStorageToken.split(".")[0])
              
              loadItemList()
              loadVideoList()
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

  // Handle location changes
  useEffect(() => {
    const currentPage = location.pathname.split("/")[1]
    if (page !== currentPage) {
      if (page === "videos" && currentPlayer) currentPlayer.destroy()
      updatePage(currentPage)
    }

  }, [location])

  const handleVideoClick = async (id) => {
    navigate("/videos/" + id)
  }

  return (
    <div style={{ overflowX: "hidden",  height: "100vh", width: "100vw" }}>
      {loadingGlobal ? (
        <div style={{ overflow: "hidden", height: "97vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CircularProgress size="10ch" />
        </div>
      ) :
        (
          <Fragment>
            {token ? (
              <div className='fadeIn' style={{ overflowY: "auto", width: "100%" }}>
                <Routes>
                  <Route path="/videos/:ID" element={<Videos setCurrentPlayer={setCurrentPlayer} currentSliderIndexRef={currentSliderIndexRef} currentSliderIndex={currentSliderIndex} updateCurrentSliderIndex={updateCurrentSliderIndex} />} />
                  <Route path="/videos" element={<Videos setCurrentPlayer={setCurrentPlayer} currentSliderIndexRef={currentSliderIndexRef} currentSliderIndex={currentSliderIndex} updateCurrentSliderIndex={updateCurrentSliderIndex} />} />
                  <Route path="/chats" element={<ChatList />} />
                  <Route path="/create" element={<Create />} />
                  <Route path="/" element={
                    <Fragment>
                      <AppBar>
                        <div style={{ height: "5ch", margin: "1ch", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <img className={(searchMode ? 'shrink-animation-style' : 'grow-animation-style') + ' icon-style'} src={ecoShopIcon} />
                          <TextField value={searchValue} onChange={(e) => { searchQuery(e.target.value, setListLoading, setItems, enqueueSnackbar, updateFilterList, numberValuesListRef, setNumbersValuesList, setFilterLoading, loadVideoList); setSearchValue(e.target.value) }} onClick={() => { if (!searchMode) setSearchMode(true) }} variant='outlined' style={{ width: "100%", marginLeft: "1ch", marginRight: "1ch" }} placeholder='Search Videos/Items/Services' size="small"
                            InputProps={
                              searchMode ? {
                                startAdornment: (
                                  <InputAdornment position="start" onClick={() => {
                                    setSearchMode(false);
                                    if (searchValue !== "") {
                                      loadItemList()
                                      loadVideoList()
                                      setSearchValue("")
                                      updateFilterList([])
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
                      <PullToRefresh isPullable={!searchMode} onRefresh={async () => {
                        await Promise.all([loadItemList(), loadVideoList()])
                        return true
                      }} pullDownThreshold={90} maxPullDownDistance={115} refreshingContent={(<h1 className='pull-text-style' style={{ color: "#4caf50" }}>Let go to refresh <ArrowDownwardIcon /></h1>)} pullingContent={(<h5 className='pull-text-style'>Pull to refresh <ArrowUpwardIcon /></h5>)}>
                        <Grow in={true}>
                          <div style={{ width: "100%", overflow: "hidden",  display: "flex", alignItems: "center", justifyContent: "center", padding: "1.3ch", flexDirection: "column", marginBottom: "10vh", marginTop: "6ch" }}>
                            {searchMode && (
                              <Paper elevation={12} style={{ width: "100%", padding: "2ch", marginTop: "1ch" }}>
                                <span style={{ fontSize: "2ch", fontWeight: "bold", display: "flex", alignContent: "center" }}>Filters <FilterListIcon style={{ marginLeft: "4px" }} /> {filterloading && (<CircularProgress size="2ch" style={{ marginLeft: "1ch" }} />)}</span>
                                {!filterloading && (
                                  <form
                                    style={{ display: "flex", flexDirection: "column", width: "100%", justifyContent: "center" }}
                                    onSubmit={async (e) => {
                                      e.preventDefault()
                                      handleFilterSubmit(e)
                                    }}
                                  >
                                    {filterList}
                                    <div style={{ marginTop: "3ch", alignSelf: "center" }}>
                                      {filterList.length > 0 ? (<LoadingButton loading={listLoading} type="submit" variant='outlined'>Apply Filters</LoadingButton>) : <span style={{ display: "flex", alignItems: "center" }}>No Filters Available  <SentimentDissatisfiedIcon style={{ marginLeft: "4px", color: "#2196f3" }} /></span>}
                                    </div>
                                  </form>
                                )}
                              </Paper>
                            )}
                            <Divider textAlign='left' style={{ alignSelf: "start", width: "100%" }}>{searchMode ? (<h5 style={{ fontSize: "2ch", fontWeight: "normal" }}>Video Results For: <b>{searchValue}</b></h5>) : (<h3>Videos For You</h3>)}</Divider>
                            <VideoList data={videoData} handleVideoClick={handleVideoClick} loading={videoListLoading} />
                            <Divider textAlign='left' style={{ alignSelf: "start", width: "100%" }}>{searchMode ? (<h5 style={{ fontSize: "2ch", fontWeight: "normal" }}>Item/Services Results For: <b>{searchValue}</b></h5>) : (<h2>Your Picks</h2>)}</Divider>
                            {listLoading ? (
                              <Grid container spacing={2}>
                                {listLoadingSkeleton}
                              </Grid>
                            )
                              : (
                                <Fade in={true}>
                                  <Grid container spacing={2} style={{ width: "100%", marginBottom: "20vh" }}>
                                    {items.length === 0 ? (
                                      <Grid item columns={12} style={{ width: "100%" }}>
                                        <Paper style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2ch" }} elevation={12}>
                                          <SentimentDissatisfiedIcon style={{ fontSize: "5ch", color: "#2196f3" }} />
                                          <h3>No Products/Services Were Found</h3>
                                          <span>Perhaps try typing a different search query?</span>
                                        </Paper>
                                      </Grid>
                                    ) : (
                                      <Fragment>
                                        {items.map((item) => (
                                          <Grid item xs={6} sm={6} md={4} lg={3} key={item.id}>
                                            <Paper className='listing-styles' elevation={12} onClick={() => setOpenListingId(item.id)}>
                                              <img src={window.mediaURL + item.obs_image} style={{ width: "100%", height: "15ch", objectFit: "cover" }} />
                                              <div className='listing-info-style'>
                                                <h5 className='listing-title-style'>{item.name}</h5>
                                                <h4 className='listing-price-style'>${item.price}</h4>
                                                <h5 className='listing-quantity-style'><b>Amount:</b> {item.quantity}</h5>
                                                <h5 className='listing-type-style'>{item.type === 1 ? (<Fragment><ShoppingBasketIcon className='type-style' /><span>Product</span></Fragment>) : (<Fragment><HandymanIcon className='type-style'/><span>Repair Service</span></Fragment>)}</h5>
                                  
                                                <span className='listing-bookmark-style'><FavoriteBorderIcon /> <span className='listing-bookmark-number-style'>{item.bookmarks}</span></span>
                                                <Divider />
                                                <span className='listing-owner-style'>
                                                  <Avatar style={{ height: "3ch", width: "3ch", backgroundColor: blue[500] }}>
                                                    <AccountCircleIcon />
                                                  </Avatar>
                                                  <span className='listing-owner-name-style'>
                                                    {item.owner}
                                                  </span>
                                                </span>
                                              </div>
                                            </Paper>
                                  
                                            <ListingDetails
                                              listing={item}
                                              setOpenListingId={setOpenListingId}
                                              drawerIsOpen={openListingId === item.id}
                                            />
                                          </Grid>
                                        ))}
                                      </Fragment>
                                    )}
                                  </Grid>
                                </Fade>
                              )}
                          </div>
                        </Grow>
                      </PullToRefresh>
                    </Fragment>
                  } />


                </Routes>

                <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={12}>
                  <BottomNavigation sx={{ backgroundColor: "transparent" }} value={page} onChange={(e, newValue) => { navigate("/" + newValue) }}>
                    <BottomNavigationAction
                      label="Home"
                      value=""
                      icon={<HomeIcon />}
                    />
                    <BottomNavigationAction
                      label="Videos"
                      value="videos"
                      icon={<VideocamIcon />}
                    />
                    <BottomNavigationAction
                      label="Sell"
                      value="create"
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
export default App;
