import './App.css';
import { Button, CircularProgress } from '@mui/material'
import { Fragment, useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import BulkListing from './Components/BulkListing';
import Shorts from './Components/Shorts';
import Login from './Components/Login'

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

    enqueueSnackbar("Welcome back " + tokenData.username + "!", {variant: "success", autoHideDuration: 2500})
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
              autoHideDuration: 2500
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
    <div style={{ overflowX: "hidden", height: "100vh", width: "100vw"}}>
      {loadingGlobal ? (
        <div style={{ overflow: "hidden", height: "97vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CircularProgress size="10ch" />
        </div>
      ) :
        (
          <Fragment>
            {token ? (
              <Fragment>
                <h1>Welcome back {username}</h1>
                {page === "home" && (
                  <Fragment>
                    <Button variant="contained" style={{ marginRight: 5 }} onClick={() => { updatePage("bulk") }}>Bulk Listing</Button>
                    <Button variant="contained" onClick={() => { updatePage("shorts") }}>EcoShop Shorts</Button>
                    <Button variant="contained" onClick={() => {handleLogout()}}>Log Out</Button>
                  </Fragment>
                )}
                {page === "bulk" && (
                  <BulkListing />
                )}
                {page === "shorts" && (
                  <Shorts />
                )}
               
              </Fragment>
            ) :
              (
                <Login handleNewLogin={handleNewLogin}/>
              )
            }
          </Fragment>
        )}

    </div>
  );
}

export default App;
