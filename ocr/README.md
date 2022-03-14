## OCR Information Extraction
API_ENDPOINT = `http://182.160.1.242:8080`

**Note: The API does NOT support HTTPS, only HTTP.**

### `POST API_ENDPOINT/extract`

Run OCR on the given image (via URL) and then run custom information extraction algorithms based on category supplied. Returns the extracted and filled fields.

### Input

head:
```
N/A
```

Body:
```json
{
    "category": "category of the product (currently only supports 'Computer' and 'Mobile Gadgets')",
    "image_url": "Publicly accessible URL of the image to extract information from"
}
```

### Output

```json
{
    "success": "true",
    "result": "A JSON object containing the extracted information, where key is the field name and value is the field value"
}
```
For example:
```json
{
    "success": "true",
    "result":
            {
              "Processor": "AMD Ryzen 5 2400G with Radeon Vega Graphics",
              "RAM": "2.00 GB"
            }
}
```

If error occurred, the `success` field will be `false` and the `answer` field will be replaced by `error` which contains the detailed error message.
```json
{
    "success": "false",
    "error": "error message"
}
```