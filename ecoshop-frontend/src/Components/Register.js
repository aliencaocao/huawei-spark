import { Button, TextField, InputAdornment } from '@mui/material'
import { LoadingButton } from '@mui/lab/';
import { useEffect, useState, Fragment } from 'react';
import { useSnackbar } from 'notistack';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ArrowCircleRightOutlinedIcon from '@mui/icons-material/ArrowCircleRightOutlined';



const handleSubmit = async (e, enqueueSnackbar, updateLoginLoading, handleNewLogin, setInputError, checkPasswordMatch) => {
    const username = e.target.username.value
    const password = e.target.password.value
    const confirmPassword = e.target.confirmPassword.value
    let validationPassed = true
  

    if (!username) {
        setInputError("username")
        validationPassed = false
    }
    if (!password) {
        setInputError("password")
        validationPassed = false
    }
    if (!confirmPassword) {
        setInputError("Cpassword")
        validationPassed = false
    }
    if (password !== confirmPassword) {
        checkPasswordMatch()
        validationPassed = false
    }

    if (validationPassed) {
        await fetch(window.globalURL + "/register", {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "username": username,
                "password": password,
            })
        }).then((results) => {
            return results.json(); //return data in JSON (since its JSON data)
        }).then(async (data) => {
            if (data.success === true) handleNewLogin(data.token)
            else {

                if (data.error === "username-exists") {
                    enqueueSnackbar("Oops. The username '" + username + "' is already in-use. Please use another username", {
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

const Register = (props) => {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const [usernameError, setUsernameError] = useState(false);
    const [usernameErrorText, setUsernameErrorText] = useState("");
    const [passwordError, setPasswordError] = useState(false);
    const [passwordErrorText, setPasswordErrorText] = useState("");
    const [CpasswordError, setCPasswordError] = useState(false);
    const [CpasswordErrorText, setCPasswordErrorText] = useState("");
    const [registerLoading, updateregisterLoading] = useState(false);

    const [passwordValue, setPasswordValue] = useState("")
    const [CpasswordValue, setCPasswordValue] = useState("")

    const setInputError = async (type) => {
        if (type === "username") {
            setUsernameError(true)
            setUsernameErrorText("Please enter your account username")
        }
        else if (type === "password") {
            setPasswordError(true)
            setPasswordErrorText("Please enter your account password")

        }
        else if (type === "Cpassword") {
            setCPasswordError(true)
            setCPasswordErrorText("Please confirm your account password by typing it again.")
        }
    }

    const clearInputError = async () => {
        setUsernameError(false)
        setPasswordError(false)
        setCPasswordError(false)
        setUsernameErrorText("")
        setPasswordErrorText("")
        setCPasswordErrorText("")
        return true
    }

    const checkPasswordMatch = async () => {
        if (CpasswordValue !== passwordValue && CpasswordValue !== "") {
            setPasswordError(true)
            setPasswordErrorText("Passwords do not match.")
            setCPasswordError(true)
            setCPasswordErrorText("Passwords do not match.")
        }
        else if (CpasswordError || passwordError) {
            setCPasswordError(false)
            setPasswordError(false)
            setPasswordErrorText("")
            setCPasswordErrorText("")
        }
    }

    useEffect(() => {checkPasswordMatch()}, [CpasswordValue, passwordValue])

    return (
       <Fragment>
            <h1 style={{alignSelf: "flex-start"}}>Register</h1>
            <form style={{display: "flex", flexDirection: "column", width: "100%" }}
                onSubmit={async (e) => {
                    e.preventDefault()
                    updateregisterLoading(true)
                    clearInputError()
                    handleSubmit(e, enqueueSnackbar, updateregisterLoading, props.handleNewLogin, setInputError, checkPasswordMatch)

                }}
            >
                <TextField
                    className="input-style"
                    disabled={registerLoading}
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
                    disabled={registerLoading}
                    label="Password *"
                    type="password"
                    helperText={passwordErrorText}
                    variant='filled'
                    name="password"
                    error={passwordError}
                    value={passwordValue}
                    onChange={(e) => { setPasswordValue(e.target.value) }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <LockOutlinedIcon />
                            </InputAdornment>
                        ),
                    }}
                />

                <TextField
                    className="input-style"
                    disabled={registerLoading}
                    label="Confirm Password *"
                    type="password"
                    helperText={CpasswordErrorText}
                    variant='filled'
                    name="confirmPassword"
                    error={CpasswordError}
                    value={CpasswordValue}
                    onChange={(e) => { setCPasswordValue(e.target.value) }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <LockOutlinedIcon />
                            </InputAdornment>
                        ),
                    }}
                />
                <LoadingButton type="submit" variant="contained" loading={registerLoading} endIcon={<ArrowCircleRightOutlinedIcon/>}>Register</LoadingButton>
            </form>

            <span style={{ marginTop: "8ch", textAlign: "center" }}>Already have an account?</span>
            <Button variant="outlined" style={{ marginTop: "1ch" }} onClick={() => { props.setRegisterPage(false) }}>Return to Login Page</Button>
            </Fragment>
    );
}

export default Register;
