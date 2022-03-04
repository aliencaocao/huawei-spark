import { Button, TextField, FormControl } from '@mui/material'
import { Fragment, useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';

const Login = () => {


    useEffect(async () => {
    }, [])

    return (
        <div style={{ height: "100%", overflowX: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FormControl style={{width: '95%'}}>
                <TextField
                    required
                    label="Username"
                    helperText="Please enter your account username"
                    variant='filled'
                />
                <TextField
                style={{marginTop: "2ch"}}
                    required
                    label="Password"
                    type="password"
                    helperText="Please enter your account password."
                    variant='filled'
                />
                <Button type="submit">Login</Button>
            </FormControl>
        </div>
    );
}

export default Login;
