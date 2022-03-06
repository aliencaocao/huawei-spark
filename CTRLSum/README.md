####APPCODE (applies to all APIs below): `b50c2b3280ce4962a72610a4a4e0fc14f3b6b05932de4346b21e41ec5c32c4ac`

##QnA
API_ENDPOINT = `https://01516f373f434921a874bf502a986a58.apig.ap-southeast-3.huaweicloudapis.com/v1/infers/2f77d2c9-7332-4cfd-a64a-1158631126a0`

### `POST API_ENDPOINT/qna`

Perform question answering on CTRLSum

### Input

head:
```json
{
    "Content-Type": "application/json",
    "X-Apig-Appcode": "APPCODE"
}
```

Body:
```json
{
    "source": "SOURCE",
    "prompt": "Starting words of the answer, can be empty string",
    "query": "Question, can be empty string"
}
```

### Output

```json
{
    "answer": "string"
}
```

### `GET API_ENDPOINT/health`

Obtain the health status of the service

### Input

```
N/A
```

### Output

healthy:
```json
{
    "health": "true"
}
```

unhealthy:
```json
{
    "health": "false"
}
```


##Tagger
API_ENDPOINT = `https://01516f373f434921a874bf502a986a58.apig.ap-southeast-3.huaweicloudapis.com/v1/infers/16a630d6-a82c-4bec-879f-ef107cbd2fc4`

### `POST API_ENDPOINT/tagger`

Generate tags from text using CTRLSum

#### Input

```json
{
    "source": "text to tag"
}
```

#### Output

```json
{
    "tags": "tags separated by ;, tags are strictly single-word (may include hyphens)"
}
```

### `GET API_ENDPOINT/health`

Obtain the health status of the service

### Input

```
N/A
```

### Output

healthy:
```json
{
    "health": "true"
}
```

unhealthy:
```json
{
    "health": "false"
}
```