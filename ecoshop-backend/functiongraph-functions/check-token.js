// Checks whether a token is valid (valid signature + user exists)

const RD = require("reallydangerous");
const mysql = require("mysql2/promise");

let signer = null;
let connection = null;

// Declare potential errors
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
    console.log(e);
    callback(e.toString(), e);
  }
};

exports.handler = async (event, context) => {
  try {
    if (!("authorization" in event.headers)) return missingAuthorization

    let tokenData = {}
    try {
      tokenData = JSON.parse(signer.unsign(event.headers["authorization"].replace(/\\/g, ""))); // check token validity
    }
    catch (e) {
      return invalidToken;
    }

    const [rows, fields] = await connection.execute('SELECT `pass` FROM `user` WHERE `user` = ? ', [tokenData.username]); // check if user exists in database
    if (rows.length === 0) return missingUser; // user was not found

    return {
      "statusCode": 200,
      "headers": { "Content-Type": "application/json" },
      "isBase64Encoded": false,
      "body": JSON.stringify({
        success: true
      }),
    };
  }
  catch (e) {
    return {
      "statusCode": 200,
      "headers": { "Content-Type": "application/json" },
      "isBase64Encoded": false,
      "body": JSON.stringify({
        success: false,
        error: e.toString(),
      }),
    };
  }
};