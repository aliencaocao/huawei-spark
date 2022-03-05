### `POST /register`

**Unauthed**

Creates a new account

#### Input

```json
{
    "username": "NEW_USERNAME",
    "password": "NEW_PASSWORD"
}
```

#### Output

```json
{
    "success": true,
    "token": <TOKEN>
}
```

#### Errors

| Error              | Definition                               |
| ------------------ | ---------------------------------------- |
| `username-taken`   | The username submitted is already in use |
| `check-parameters` | Paremeters missing                       |



### `POST /login`

**Unauthed**

Login to an existing acount

#### Input

```json
{
    "username": "USERNAME",
    "password": "PASSWORD"
}
```

#### Output

```json
{
    "success": true,
    "token": <TOKEN>
}
```

#### Errors

| Error                 | Definition                 |
| --------------------- | -------------------------- |
| `invalid-credentials` | Username/password is wrong |
| `check-parameters`    | Paremeters missing         |



### `GET /check-token`

**Unauthed**

Checks the authorization header token (token should be passed in the header to be checked)

#### Input

```json
N/A
```

#### Output

```json
{
    "success": true
}
```

#### Errors

| Error                   | Definition                                                 |
| ----------------------- | ---------------------------------------------------------- |
| `invalid-token`         | Token is invalid/expired                                   |
| `missing-user`          | Token is valid but user has been deleted from the database |
| `authorization-missing` | Authorization header is missing                            |


