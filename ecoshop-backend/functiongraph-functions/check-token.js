const RD = require("reallydangerous");
const mysql = require("mysql2/promise");

let signer = null;
let connection = null;

const invalidToken = {
  "statusCode": 200,
  "headers": { "Content-Type": "application/json" },
  "isBase64Encoded": false,
  "body": JSON.stringify({
    success: false,
    error: "invalid-token"
  }),
}

const missingUser = {
  "statusCode": 200,
  "headers": { "Content-Type": "application/json" },
  "isBase64Encoded": false,
  "body": JSON.stringify({
    success: false,
    error: "missing-user"
  }),
}

const missingAuthorization = {
  "statusCode": 200,
  "headers": { "Content-Type": "application/json" },
  "isBase64Encoded": false,
  "body": JSON.stringify({
    success: false,
    error: "authorization-missing"
  }),
}

exports.initializer = async (context, callback) => {

  try {
    signer = new RD.Signer(context.getUserData("secret"), context.getUserData("salt")), // MUST DECLARE ENCRYPTED VARIABLE
      connection = await mysql.createConnection(JSON.parse(context.getUserData("gaussDBconnect"))) // MUST CONNECT IN VPC FOR DATABASE USAGE

    callback(null, '');
  } catch (e) {
    callback("error", e);
  }
};

exports.handler = async (event, context) => {

  try {
    if (!("authorization" in event.headers)) return missingAuthorization

    let tokenData = {}
    try {
      tokenData = JSON.parse(signer.unsign(event.headers["authorization"].replace(/\\/g, ""))) // only for functions which require authentication.
    }
    catch (e) {
        return invalidToken
    }

    const [rows, fields] = await connection.execute('SELECT `pass` FROM `user` WHERE `user` = ? ', [tokenData.username]);
    if (rows.length === 0) return missingUser // user was not found

    return {
      "statusCode": 200,
      "headers": { "Content-Type": "application/json" },
      "isBase64Encoded": false,
      "body": JSON.stringify({
        success: true
      }),
    }
  }
  catch (e) {
    const errorBody = {
      "statusCode": 200,
      "headers": { "Content-Type": "application/json" },
      "isBase64Encoded": false,
      "body": JSON.stringify({
        success: false,
        error: e.toString()
      }),
    };

    return errorBody;
  }
};