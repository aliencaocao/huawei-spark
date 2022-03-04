import { Button, TextField, FormControl } from '@mui/material'
import { LoadingButton } from '@mui/lab/';
import { Fragment, useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';


const handleSubmit = async (e, enqueueSnackbar, updateLoginLoading, handleNewLogin) => {
    e.preventDefault()

    await fetch(window.globalURL + "/login", {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            "username": e.target.username.value,
            "password": e.target.password.value,
        })
    }).then((results) => {
        return results.json(); //return data in JSON (since its JSON data)
    }).then(async (data) => {
        //console.log(data)
        if (data.success === true) handleNewLogin(data.token)
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

    updateLoginLoading(false)

}

const Login = (props) => {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const [loginLoading, updateLoginLoading] = useState(false);

    useEffect(async () => {
    }, [])

    return (
        <div style={{ height: "100%", overflowX: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <form style={{ width: '95%', display: "flex", flexDirection: "column" }}
                onSubmit={(e) => {
                    handleSubmit(e, enqueueSnackbar, updateLoginLoading, props.handleNewLogin)
                    updateLoginLoading(true)
                }}
                >
                <TextField
                    required
                    label="Username"
                    helperText="Please enter your account username"
                    variant='filled'
                    name="username"
                />
                <TextField
                    style={{ marginTop: "2ch" }}
                    required
                    label="Password"
                    type="password"
                    helperText="Please enter your account password."
                    variant='filled'
                    name="password"
                />
                <LoadingButton type="submit" variant="outlined" loading={loginLoading}>Login</LoadingButton>
            </form>
        </div>
    );
}

export default Login;
