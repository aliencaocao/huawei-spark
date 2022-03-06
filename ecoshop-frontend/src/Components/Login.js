import { Button, TextField, InputAdornment, Checkbox, FormControlLabel, FormGroup } from '@mui/material'
import { LoadingButton } from '@mui/lab/';
import { Fragment, useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import Register from './Register';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ArrowCircleRightOutlinedIcon from '@mui/icons-material/ArrowCircleRightOutlined';
import ecoShopSVG from './../assets/ecoshop.svg';


const handleSubmit = async (e, enqueueSnackbar, updateLoginLoading, handleNewLogin, setInputError) => {
    const username = e.target.username.value
    const password = e.target.password.value
    let validationPassed = true


    if (!username) {
        setInputError("username")
        validationPassed = false
    }
    if (!password) {
        setInputError("password")
        validationPassed = false
    }

    if (validationPassed) {
        await fetch(window.globalURL + "/login", {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "username": username,
                "password": password,
            })
        }).then((results) => {
            return results.json(); //return data in JSON (since its JSON data)
        }).then(async (data) => {
            if (data.success === true) handleNewLogin(data.token, e.target.rememberMe.checked)
            else {

                if (data.error === "invalid-credentials") {
                    enqueueSnackbar("Oops. Your login details were incorrect. Please try again", {
                        variant: 'error',
                        autoHideDuration: 2500
                    })
                }
                else {
                    enqueueSnackbar("Oops. Unknown error", {
                        variant: 'error',
                        autoHideDuration: 2500
                    })
                    console.log(data)
                }

            }

        }).catch((error) => {
            console.log(error)
            enqueueSnackbar("There was an issue connecting to the server", {
                variant: 'error',
                autoHideDuration: 2500
            });
        })
    }

    updateLoginLoading(false)

}

const Login = (props) => {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const [registerPage, setRegisterPage] = useState(false);
    const [usernameError, setUsernameError] = useState(false);
    const [usernameErrorText, setUsernameErrorText] = useState("");
    const [passwordError, setPasswordError] = useState(false);
    const [passwordErrorText, setPasswordErrorText] = useState("");
    const [loginLoading, updateLoginLoading] = useState(false);

    const setInputError = async (type) => {
        if (type === "username") {
            setUsernameError(true)
            setUsernameErrorText("Please enter your account username")
        }
        else if (type === "password") {
            setPasswordError(true)
            setPasswordErrorText("Please enter your account password")
        }
    }

    const clearInputError = async () => {
        setUsernameError(false)
        setPasswordError(false)
        setUsernameErrorText("")
        setPasswordErrorText("")
    }

    useEffect(async () => {
    }, [])

    return (
        <div className='login-page fadeIn' style={{ height: "100%", width: "100%", overflowX: "hidden", display: "flex", alignItems: "center", justifyContent: "center", padding: "2ch", flexDirection: "column" }}>
            <div style={{ width: '100%', marginTop: "4ch", marginBottom: "4ch", display: "flex", flexDirection: "column",  alignItems: "center", backgroundColor: "rgba(0, 0, 0, 0.8)", padding: "2.5ch", border: "1px transparent solid", borderRadius: "25px", boxShadow: "7px 7px 6px 6px rgba(0, 0, 0, .5)" }}>
                <img src={ecoShopSVG} style={{ width: "30%", marginTop: "2ch", marginBottom: "-2ch" }} />
                {registerPage ? (
                    <Register setRegisterPage={setRegisterPage} handleNewLogin={props.handleNewLogin} />) : (
                    <Fragment>

                        <h1 style={{ alignSelf: "flex-start" }}>Sign In</h1>
                        <form
                            style={{ display: "flex", flexDirection: "column", width: "100%", justifyContent: "center" }}
                            onSubmit={async (e) => {
                                e.preventDefault()
                                updateLoginLoading(true)
                                clearInputError()
                                handleSubmit(e, enqueueSnackbar, updateLoginLoading, props.handleNewLogin, setInputError)

                            }}
                        >
                            <TextField
                                className="input-style"
                                disabled={loginLoading}
                                label="Username *"
                                helperText={usernameErrorText}
                                variant='filled'
                                name="username"
                                error={usernameError}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <AccountCircleOutlinedIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <TextField
                                className="input-style"
                                disabled={loginLoading}
                                label="Password *"
                                type="password"
                                helperText={passwordErrorText}
                                variant='filled'
                                name="password"
                                error={passwordError}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockOutlinedIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <FormGroup>
                                <FormControlLabel control={<Checkbox defaultChecked />} name="rememberMe" label="Remember Me" />
                            </FormGroup>

                            <LoadingButton style={{ marginTop: "1ch" }} type="submit" variant="contained" loading={loginLoading} endIcon={<ArrowCircleRightOutlinedIcon />}>Login</LoadingButton>
                        </form>

                        <span style={{ marginTop: "8ch", textAlign: "center" }}>Don't have an account?</span>
                        <Button variant="outlined" style={{ marginTop: "1ch" }} onClick={() => { setRegisterPage(true) }}>Register</Button>
                    </Fragment>
                )}
            </div>
        </div>
    );
}

export default Login;
