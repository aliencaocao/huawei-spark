const RD = require("reallydangerous");
const mysql = require("mysql2/promise");
const childProcess = require("child_process");
const ObsClient = require("esdk-obs-nodejs");
const argon2 = require("argon2");

let signer = null;
let connection = null;
let init = false;

exports.handler = async (event, context) => {
  if (!init) { // if we're coming from a cold start, we need to initialise the vars
    signer = new RD.Signer(context.getUserData("signer")); // MUST DECLARE ENCRYPTED VARIABLE
    connection = await mysql.createConnection(JSON.parse(context.getUserData("gaussDBconnect"))); // MUST CONNECT IN VPC FOR DATABASE USAGE
    init = true;
  }

  try {
    const tokenData = signer.unsign(event.headers["authorization"] ? event.headers["authorization"] : ""); // only for functions which require authentication.

    const obsClient = new ObsClient({
      access_key_id: context.getAccessKey(),
      secret_access_key: context.getSecretKey(),
      server: "obs.ap-southeast-3.myhuaweicloud.com",
      max_retry_count: 1,
      timeout: 20,
      ssl_verify: false,
      long_conn_param: 0
    });

    // function logic goes here...

    const response = {
      "statusCode": 200,
      "headers": { "Content-Type": "application/json" },
      "isBase64Encoded": false,
      "body": JSON.stringify({
        tkai: "cool",
        signatureVerified: true,
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
        tempSignature: signer.sign("cool"),
      }),
    };

    return errorBody;
  }
};