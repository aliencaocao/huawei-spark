const RD = require("reallydangerous");
const mysql = require("mysql2/promise");
const argon2 = require("argon2");

let signer = null;
let connection = null;

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
        callback("error", e);
    }
};

exports.handler = async (event, context) => {

    try {

        const body = JSON.parse((Buffer.from(event.body, 'base64')).toString()) 

        if (!("username" in body) || !("password" in body)) return validationError

        try {
            const [rows, fields] = await connection.execute('INSERT INTO `user` (`user`, `pass`, `plan`, `reputation`)  VALUES(?, ?, ?, ?) ', [body.username, await argon2.hash(body.password), "standard", 0]);
        }
        catch (e) {
            if (e.errno === 1062) {
                return usernameExistError
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
                }
            }

        }

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
        const errorBody = {
            "statusCode": 200,
            "headers": { "Content-Type": "application/json" },
            "isBase64Encoded": false,
            "body": JSON.stringify({
                error: e.toString(),
            }),
        };

        return errorBody;
    }
};