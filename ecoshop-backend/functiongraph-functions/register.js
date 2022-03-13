// Creates a new user

const RD = require("reallydangerous");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");

const BCRYPT_ROUNDS = 10;

let signer = null;
let connection = null;

// Declare potential errors
const usernameExistError = {
  "statusCode": 200,
  "headers": { "Content-Type": "application/json" },
  "isBase64Encoded": false,
  "body": JSON.stringify({
    success: false,
    error: "username-exists"
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
    callback(e.toString(), e);
  }
};

exports.handler = async (event, context) => {
  try {
    const body = JSON.parse((Buffer.from(event.body, 'base64')).toString())

    if (!("username" in body) || !("password" in body)) return validationError

    try {
      const [rows, fields] = await connection.execute(
        'INSERT INTO `user` (`user`, `pass`, `plan`, `reputation`)  VALUES(?, ?, ?, ?) ',
        [
          body.username,
          await bcrypt.hash(body.password, BCRYPT_ROUNDS),
          1, // for our promotional period, all users get EcoShop Pro on registering a new account!
          0,
        ]
      );
    }
    catch (e) {
      if (e.errno === 1062) {
        return usernameExistError;
      }
      else {
        return {
          "statusCode": 500,
          "headers": { "Content-Type": "application/json" },
          "isBase64Encoded": false,
          "body": JSON.stringify({
            success: false,
            error: e.toString()
          }),
        };
      }
    }

    return {
      "statusCode": 200,
      "headers": { "Content-Type": "application/json" },
      "isBase64Encoded": false,
      "body": JSON.stringify({
        success: true,
        token: signer.sign(JSON.stringify({ username: body.username }))
      }),
    };
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