# Chat Socket Server API Docs

All data sent and received are in `JSON`, so `stringify` and `parse` etc.

## General Format of Receiving Data (Success)

```json
{ type: "TYPE-OF-MSG", success: true, data: rows }
```

## General Format of Receiving Data (Error)

```json
{ type: "TYPE-OF-MSG", success: true, error: "error-msg" }
```

## Type of Messages

### `init`

```json
{"action":"init","token":"TOKEN"}
```

- You have 60s to call init after you connect before u are timed-out and kicked

#### Response:

```json
{"type":"init","success":true,"data":"init-success"}
```

### `load-msgs`

- Load msgs from a specific chat

```json
{"action":"load-msgs","token":"TOKEN", "chatID": 1}
```

#### Response:

```json
{"type":"load-msgs","success":true,"data":
[
    {
    "sender":"tkai","recipient":"howingyip","content":"hello world!","sent":"2022-03-13T10:34:42.000Z","obs_image":"","answer_bot":1
    }
]
}
```

### `load-chats`

- Load the list of chats a user has access to

```json
{"action":"load-chats","token":"TOKEN"}
```

#### Response:

```json
{"type":"load-chats","success":true,"data":
[
    {
    "id":1,"buyer":"howingyip","seller":"tkai","name":"big chair ikea","obs_image":"https://www.ikea.com/sg/en/images/products/loberget-blyskaer-swivel-chair-white__0806543_pe770241_s5.jpg?f=s","started":"2022-03-12T16:55:48.000Z"}
]
}
```

### `new-chat`

- Creates a new chat

```json
{"action":"new-chat","token":"TOKEN", "buyer": "tkai", "seller": "howingyip", "answerBot": 1, "productID": 1}
```

- `productID` is the `ID` of a product (integer)

- `answerBot` is either `0` or `1` for enabled/disabled

- When a new chat is created, the event `new-chat-notif` is broadcasted to the client which created the chat as well

#### Response:

```json
{ "type": "new-chat-created", "success": true }
```

### `new-msg`

- Send a new msg

```json
{"action":"new-msg","token":"TOKEN", "chatID": 1, "content": "hello world!", "answerBot": 1, "obs_image": ""}
```

- `content` is the text message

- `answerBot` is whether this is an answerBot message (0 for not answer bot msg)

- `obs_image` for the OBS image link (see `image_upload.html` )

- The process for uploading an image goes like:
  
  - Get link from OBS on where to upload the image to
  - `PUT` the image to OBS
  - Get link from OBS where the image is stored at
  - Send link to chat server via this `new-msg` socket

#### Response:

```json
{ type: "new-msg-sent", success: true }
```



## Event Messages Sent to Client

### `new-chat-notif`

- Sent when a new chat is created

```json
{ type: "new-chat-notif", success: true, chatID: 32 }
```

### `new-msg`

- New msg event

```json
{ type: "new-msg", success: true, data: 
{
        sender: "tkai",
        recipient: "howingyip",
        content: "hello world!",
        sent: currentTime,
        obs_image: "obs link",
        answer_bot: 0    
}
}
```

- Note that the client/socket that **sent the new msg will not receive any new msg notifications**

- In the event the receipient is a **seller** and he has **enabled auto msg bot**. A `new-msg` event is sent with the `answer_bot`  value of`1`




