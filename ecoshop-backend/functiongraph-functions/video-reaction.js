// Saves users' video reactions (likes and dislikes)
// Authorization Required - API Gateway Custom Authorizer required.

const mysql = require("mysql2/promise");

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

exports.initializer = async (context, callback) => {
  try {
    connection = await mysql.createConnection(JSON.parse(context.getUserData("gaussDBconnect"))) // MUST CONNECT IN VPC FOR DATABASE USAGE

    callback(null, "");
  } catch (e) {
    callback(e.toString(), e);
  }
};

exports.handler = async (event, context) => {
  try {
    const body = JSON.parse((Buffer.from(event.body, 'base64')).toString());
    const authData = JSON.parse(event.headers["authData"]); // verified by API Gateway Custom Authorizer

    let output = [];

    if (!("action" in body) || !("video" in body)) return validationError;

    // reset reaction
    await connection.execute("DELETE FROM `user_video_react` WHERE `user` = ? AND `video` = ?", [authData.username, body.video]);

    switch (body.action) {
      case "like":
        await connection.execute("INSERT INTO `user_video_react` (`user`, `video`, `react`) VALUES(?, ?, ?)", [authData.username, body.video, 1]);
        break;
      case "dislike":
        await connection.execute("INSERT INTO `user_video_react` (`user`, `video`, `react`) VALUES(?, ?, ?)", [authData.username, body.video, 2]);
        break;
      case "undislike":
        break;
      case "unlike":
        break;
      default:
        return validationError;
    }

    const response = {
      "statusCode": 200,
      "headers": { "Content-Type": "application/json" },
      "isBase64Encoded": false,
      "body": JSON.stringify({
        success: true,
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
        success: false,
        error: e.toString(),
      }),
    };
  }
};