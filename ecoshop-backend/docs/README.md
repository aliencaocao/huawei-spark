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


### `POST /upload`

**Auth required - pass token in header**

Gets an upload link for images or videos.

Client is expected to save the uploadPath for image uploads - this will be sent along with the product data when POSTing to the product creation endpoint.

Videos can only be attached to an existing product. A valid product ID must be provided, and it must belong to the user.

#### Input

For video upload:

```json
{
    "type": "video",
    "product": "product ID of the product to link this video to"
}
```

For image upload:

```json
{
    "type": "image"
}
```

#### Output

You need to PUT to the SignedUrl, and send the Content-Type header specified in the response below. Otherwise, you will get a SignatureError or something similar.

```json
{
    "success": true,
    "uploadPath": "...",
    "uploadParams": {
        "ActualSignedRequestHeaders": {
            "Content-Type": "video/*",
            "Host": "ecoshop-data.obs.ap-southeast-3.myhuaweicloud.com"
        },
        "SignedUrl": "link to PUT to"
    }
}
```

#### Errors

| Error              | Definition                               |
| ------------------ | ---------------------------------------- |
| check-parameters   | parameters missing                       |
| unauthorised       | product does not belong to user          |
| not-found          | product does not exist                   |
