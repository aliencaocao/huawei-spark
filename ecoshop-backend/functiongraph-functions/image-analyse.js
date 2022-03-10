// Calls Huawei Cloud Image Moderation and Image Tagging APIs on images uploaded by users
// Authorization Required - API Gateway Custom Authorizer required.

const fetch = require("node-fetch");
const RD = require("reallydangerous");
const mysql = require("mysql2/promise");
const childProcess = require("child_process");
const ObsClient = require("esdk-obs-nodejs");

let signer = null;
let connection = null;

exports.initializer = async (context, callback) => {
  try {
    // signer = new RD.Signer(context.getUserData("secret"), context.getUserData("salt")), // MUST DECLARE ENCRYPTED VARIABLE AND SALT
    // connection = await mysql.createConnection(JSON.parse(context.getUserData("gaussDBconnect"))) // MUST CONNECT IN VPC FOR DATABASE USAGE

    callback(null, '');
  } catch (e) {
    callback(e.toString(), e);
  }
};

exports.handler = async (event, context) => {
  try {
    // const tokenData = JSON.parse(signer.unsign(event.headers["authorization"] ? event.headers["authorization"] : "")); // only for functions which require authentication.

    // function logic goes here...
    // image moderation
    // then, if it passes, call image tagging API

    const response = {
      "statusCode": 200,
      "headers": { "Content-Type": "application/json" },
      "isBase64Encoded": false,
      "body": JSON.stringify({
        tkai: "cool",
        signatureVerified: await fetch("https://example.com").then(res => res.text()),
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