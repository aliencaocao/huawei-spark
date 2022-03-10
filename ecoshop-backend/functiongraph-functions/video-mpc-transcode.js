// Creates MPC encoding tasks when videos are uploaded to user-video/, and updates database entry to include video
// FUNCTION SHOULD ONLY BE TRIGGERED BY OBS EVENT. NOT FOR PUBLIC USE.

const mysql = require("mysql2/promise");
const signer = require('./signer'); // https://support.huaweicloud.com/intl/en-us/devg-apisign/api-sign-sdk-nodejs.html#section1
const https = require("https");
const PROJECT_ID = "0f2d658c2e00f40e2fd8c0099b46f5e9";
const MPC_URL = "https://mts.ap-southeast-3.myhuaweicloud.com/v1/0f2d658c2e00f40e2fd8c0099b46f5e9/transcodings";

exports.initializer = async (context, callback) => {
  try {
    connection = await mysql.createConnection(JSON.parse(context.getUserData("gaussDBconnect"))) // MUST CONNECT IN VPC FOR DATABASE USAGE

    callback(null, "");
  } catch (e) {
    callback("error", e);
  }
};

exports.handler = async (event, context) => {
  try {
    // Gets OBS key
    let path = decodeURIComponent(event["Records"][0].s3.object.key);

    if (!path.includes("user-video/")) {
      return;
    }

    console.log(path);

    try {
      // Get access key and secret key for request signing
      var sig = new signer.Signer();
      sig.Key = context.getAccessKey();
      sig.Secret = context.getSecretKey();

      // Create request
      var r = new signer.HttpRequest("POST", MPC_URL);

      r.headers = {
        "Content-Type": "application/json",
        "X-Project_Id": PROJECT_ID,
      };

      r.body = JSON.stringify({
        "input": {
          "bucket": "ecoshop-data",
          "location": "ap-southeast-3",
          "object": path,
        },
        "output": {
          "bucket": "ecoshop-data",
          "location": "ap-southeast-3",
          "object": path.replace("user-video", "mpc-video"),
        },
        "output_filenames": ["output"],
        "trans_template_id": [7000512], // DASH + HLS
        "thumbnail": {
          "params": {
            "type": "DOTS",
            "dots": [4],
            "output_filename": "thumbnail.jpg",
          },
        },
      });

      var opt = sig.Sign(r);
      console.log(opt.headers["X-Sdk-Date"]);
      console.log(opt.headers["Authorization"]);

      // Send request to MPC API to create transcoding task
      var req = https.request(opt, function (res) {
        console.log(res.statusCode);
        console.log('headers:', JSON.stringify(res.headers));
        res.on("data", function (chunk) {
          console.log(chunk.toString())
        })
      });

      req.on("error", function (err) {
        console.log(err.message)
      });

      req.write(r.body);
      req.end();

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

    const response = {};
    return response;
  }
  catch (e) {
    console.log(e);

    const errorBody = {};
    return errorBody;
  }
};