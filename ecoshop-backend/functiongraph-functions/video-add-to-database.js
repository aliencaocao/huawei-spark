// Internal-use function which adds entries for user-uploaded videos to the database
// FUNCTION SHOULD ONLY BE TRIGGERED BY ANOTHER FUNCTION. NOT FOR PUBLIC USE - API KEY REQUIRED.

const mysql = require("mysql2/promise");
const https = require("https");
const RD = require("reallydangerous");

exports.initializer = async (context, callback) => {
  try {
    signer = new RD.Signer(context.getUserData("secret"), context.getUserData("salt")), // MUST DECLARE ENCRYPTED VARIABLE
    connection = await mysql.createConnection(JSON.parse(context.getUserData("gaussDBconnect"))) // MUST CONNECT IN VPC FOR DATABASE USAGE

    callback(null, "");
  } catch (e) {
    callback("error", e);
  }
};

exports.handler = async (event, context) => {
  try {
    const body = JSON.parse((Buffer.from(event.body, 'base64')).toString());

    if (event.headers["authorization"].trim() !== context.getUserData("apiKey")) return {
      "statusCode": 200,
      "headers": { "Content-Type": "application/json" },
      "isBase64Encoded": false,
      "body": JSON.stringify({
        success: false,
      }),
    };

    // Gets OBS key
    let path = signer.unsign(body.path);

    try {
      // Insert video entry into database
      let productId = path.split(".")[1];
      const [rows, fields] = await connection.execute(
        "INSERT INTO `social_video` (`obs_location`, `impressions`) VALUES (?, ?)",
        [path.split("/")[1], 0],
      );
      await connection.execute(
        "INSERT INTO `social_video_product` (`video`, `product`) VALUES (?, ?)",
        [rows.insertId, productId],
      );
    }
    catch (e) {
      console.log(e);
    }

    return {
      "statusCode": 200,
      "headers": { "Content-Type": "application/json" },
      "isBase64Encoded": false,
      "body": JSON.stringify({
        success: true,
      }),
    };
  }
  catch (e) {
    return {
      "statusCode": 200,
      "headers": { "Content-Type": "application/json" },
      "isBase64Encoded": false,
      "body": JSON.stringify({
        success:false,
        error: e.toString(),
      }),
    };
  }
};