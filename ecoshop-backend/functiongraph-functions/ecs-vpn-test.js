const fetch = require("node-fetch");
const RD = require("reallydangerous");
const mysql = require("mysql2/promise");
const childProcess = require("child_process");
const ObsClient = require("esdk-obs-nodejs");

let signer = null;
let connection = null;

// exports.initializer = async (context, callback) => {
//   try {
//     // signer = new RD.Signer(context.getUserData("secret"), context.getUserData("salt")), // MUST DECLARE ENCRYPTED VARIABLE AND SALT
//     // connection = await mysql.createConnection(JSON.parse(context.getUserData("gaussDBconnect"))) // MUST CONNECT IN VPC FOR DATABASE USAGE

//     callback(null, '');
//   } catch (e) {
//     callback("error", e);
//   }
// };

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
        signatureVerified: await fetch("http://192.168.2.92").then(res => res.text()),
      }),
    };

    return response;
  }
  catch (e) {
    const errorBody = {
      "statusCode": 200,
      "headers": { "Content-Type": "application/json" },
      "isBase64Encoded": false,
      "body": JSON.stringify({
        error: e.toString(),
        // tempSignature: signer.sign("cool"),
      }),
    };

    return errorBody;
  }
};