# All information below are NO LONGER VALID. It is only kept here for record purposes.

#### APPCODE (applies to all APIs below): `b50c2b3280ce4962a72610a4a4e0fc14f3b6b05932de4346b21e41ec5c32c4ac`

## QnA
API_ENDPOINT = `https://01516f373f434921a874bf502a986a58.apig.ap-southeast-3.huaweicloudapis.com/v1/infers/4bee9f8d-7d7d-4ccc-a4a9-e0be7a3b49e7`

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
    "success": "true",
    "answer": "string"
}
```

If error occurred, the `success` field will be `false` and the `answer` field will be replaced by `error` which contains the detailed error message.
```json
{
    "success": "false",
    "error": "error message"
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


## Tagger
API_ENDPOINT = `https://01516f373f434921a874bf502a986a58.apig.ap-southeast-3.huaweicloudapis.com/v1/infers/3a471035-f481-4f5e-bb16-ecf9a4d4dded`

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
    "success": "true",
    "tags": "tags separated by ;, tags are strictly single-word (may include hyphens)"
}
```

If error occurred, the `success` field will be `false` and the `tags` field will be replaced by `error` which contains the detailed error message.
```json
{
    "success": "false",
    "error": "error message"
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
