// Returns a pre-signed URL which clients should use to upload images or videos via PUT
// Authorization Required - API Gateway Custom Authorizer required.

const RD = require("reallydangerous");
const mysql = require("mysql2/promise");
const childProcess = require("child_process");
const ObsClient = require("esdk-obs-nodejs");
const short = require("short-uuid");

let connection = null;

// Declare potential errors
const validationError = {
  "statusCode": 200,
  "headers": { "Content-Type": "application/json" },
  "isBase64Encoded": false,
  "body": JSON.stringify({
    success: false,
    error: "check-parameters",
  }),
};

const notFoundError = {
  "statusCode": 200,
  "headers": { "Content-Type": "application/json" },
  "isBase64Encoded": false,
  "body": JSON.stringify({
    success: false,
    error: "not-found",
  }),
};

const permissionError = {
  "statusCode": 200,
  "headers": { "Content-Type": "application/json" },
  "isBase64Encoded": false,
  "body": JSON.stringify({
    success: false,
    error: "unauthorised",
  }),
};

exports.initializer = async (context, callback) => {
  try {
    connection = await mysql.createConnection(JSON.parse(context.getUserData("gaussDBconnect"))) // MUST CONNECT IN VPC FOR DATABASE USAGE

    callback(null, "");
  } catch (e) {
    callback("error", e);
  }
};

exports.handler = async (event, context) => {
  try {
    const body = JSON.parse((Buffer.from(event.body, 'base64')).toString());
    const authData = JSON.parse(event.headers.authData);

    if (!("type" in body)) {
      return validationError;
    }

    let path = `user-image/${short.generate()}`;

    if (body["type"] == "video") { // if user is uploading a video, it must be associated with an existing product
      if (body["product"] == undefined) return validationError;

      const [rows, fields] = await connection.execute('SELECT `owner` FROM `product` WHERE `id` = ? ', [body["product"]]);

      if (rows.length === 0) return notFoundError;
      if (rows[0]["owner"] !== authData["username"]) return permissionError;

      // generate the video path, which contains the shortUUID and the product ID
      path = `user-video/${short.generate()}.${body["product"]}`;
    }

    const obsClient = new ObsClient({
      access_key_id: context.getAccessKey(),
      secret_access_key: context.getSecretKey(),
      server: "obs.ap-southeast-1.myhuaweicloud.com",
      max_retry_count: 1,
      timeout: 20,
      ssl_verify: false,
      long_conn_param: 0
    });

    const response = {
      "statusCode": 200,
      "headers": { "Content-Type": "application/json" },
      "isBase64Encoded": false,
      "body": JSON.stringify({
        uploadPath: path,
        uploadParams: obsClient.createSignedUrlSync({
          Method: 'PUT',
          Bucket: 'ecoshop-data',
          Key: path,
          Headers: { 'Content-Type': body["type"] == "video" ? "video/*" : "image/*" },
        }),
      }),
    };

    return response;
  }
  catch (e) {
    return {
      "statusCode": 200,
      "headers": { "Content-Type": "application/json" },
      "isBase64Encoded": false,
      "body": JSON.stringify({
        error: e.toString(),
      }),
    };
  }
};