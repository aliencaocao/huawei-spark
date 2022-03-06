// FUNCTION SHOULD ONLY BE TRIGGERED BY OBS EVENT. NOT FOR PUBLIC USE.
// Creates an MPC transcoding task when new video files are added to user-video/

var signer = require('./signer'); // https://support.huaweicloud.com/intl/en-us/devg-apisign/api-sign-sdk-nodejs.html#section1
var https = require("https");
const MPC_URL = "https://mts.ap-southeast-3.myhuaweicloud.com/v1/0f2d658c2e00f40e2fd8c0099b46f5e9/transcodings";

exports.handler = async (event, context) => {
  try {
    // Gets OBS key
    let path = decodeURIComponent(event["Records"][0].s3.object.key);

    if (!path.includes("user-video/")) {
      return;
    }

    console.log(path);

    try {
      var sig = new signer.Signer();
      // Get access key and secret key for request signing
      sig.Key = context.getAccessKey();
      sig.Secret = context.getSecretKey();

      // Create request
      var r = new signer.HttpRequest("POST", MPC_URL);

      r.headers = {
        "Content-Type": "application/json",
        "X-Project_Id": "0f2d658c2e00f40e2fd8c0099b46f5e9",
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
        "trans_template_id": [7000512]
      });

      var opt = sig.Sign(r);
      console.log(opt.headers["X-Sdk-Date"]);
      console.log(opt.headers["Authorization"]);

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