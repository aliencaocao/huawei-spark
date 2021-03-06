// Issues tokens when users login with their username and password

const RD = require("reallydangerous");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");

let signer = null;
let connection = null;

// Declare potential errors
const invalidCredentialsResponse = {
  "statusCode": 200,
  "headers": { "Content-Type": "application/json" },
  "isBase64Encoded": false,
  "body": JSON.stringify({
    success: false,
    error: "invalid-credentials"
  }),
}

const validationError = {
  "statusCode": 200,
  "headers": { "Content-Type": "application/json" },
  "isBase64Encoded": false,
  "body": JSON.stringify({
    success: false,
    error: "check-parameters"
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
    const body = JSON.parse((Buffer.from(event.body, 'base64')).toString()) 
  
    if (!("username" in body) || !("password" in body)) return validationError;

    const [rows, fields] = await connection.execute('SELECT `pass`, `plan` FROM `user` WHERE `user` = ? ', [body.username]);
    if (rows.length === 0) return invalidCredentialsResponse // user was not found
    const savedHash = rows[0].pass
    if (await bcrypt.compare(body.password, savedHash)) {
      return {
        "statusCode": 200,
        "headers": { "Content-Type": "application/json" },
        "isBase64Encoded": false,
        "body": JSON.stringify({
          success: true,
          token: signer.sign(JSON.stringify({ username: body.username, plan: rows[0].plan }))
        }),
      };
    }
    else return invalidCredentialsResponse;
  }
  catch (e) {
    return {
      "statusCode": 200,
      "headers": { "Content-Type": "application/json" },
      "isBase64Encoded": false,
      "body": JSON.stringify({
        success: false,
        error: e.toString()
      }),
    };
  }
};