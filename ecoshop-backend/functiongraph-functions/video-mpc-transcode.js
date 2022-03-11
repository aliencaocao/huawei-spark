// Creates MPC encoding tasks when videos are uploaded to user-video/, and updates database entry to include video
// FUNCTION SHOULD ONLY BE TRIGGERED BY OBS EVENT. NOT FOR PUBLIC USE.

const huaweiSigner = require('./signer'); // https://support.huaweicloud.com/intl/en-us/devg-apisign/api-sign-sdk-nodejs.html#section1
const https = require("https");
const RD = require("reallydangerous");
const fetch = require("node-fetch");

const MPC_PROJECT_ID = "0ebb63c52200f4d22f1cc00b51ac69a9";
const MPC_URL = "https://mts.ap-southeast-3.myhuaweicloud.com/v1/0ebb63c52200f4d22f1cc00b51ac69a9/transcodings";

const INSERTION_FUNCTION_URL = "https://550bf209274345648b958a0b003b655c.apig.ap-southeast-1.huaweicloudapis.com/video/database/add";

exports.initializer = async (context, callback) => {
  try {
    signer = new RD.Signer(context.getUserData("secret"), context.getUserData("salt")), // MUST DECLARE ENCRYPTED VARIABLE

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
      let sig = new huaweiSigner.Signer();
      sig.Key = context.getAccessKey();
      sig.Secret = context.getSecretKey();

      // Create MPC request
      let mpcReqSigner = new huaweiSigner.HttpRequest("POST", MPC_URL);

      mpcReqSigner.headers = {
        "Content-Type": "application/json",
        "X-Project_Id": MPC_PROJECT_ID,
      };

      mpcReqSigner.body = JSON.stringify({
        "input": {
          "bucket": "ecoshop-content",
          "location": "ap-southeast-3",
          "object": path,
        },
        "output": {
          "bucket": "ecoshop-content",
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

      let mpcReqOptions = sig.Sign(mpcReqSigner);
      console.log(mpcReqOptions.headers["X-Sdk-Date"]);
      console.log(mpcReqOptions.headers["Authorization"]);

      // Send request to MPC API to create transcoding task
      let mpcReq = https.request(mpcReqOptions, function (res) {
        console.log(res.statusCode);
      });

      mpcReq.on("error", function (err) {
        console.log(err.message)
      });

      mpcReq.write(mpcReqSigner.body);
      mpcReq.end();

      // Send video insertion request
      let insertRes = await fetch(INSERTION_FUNCTION_URL, {
        method: "post",
        body: JSON.stringify({
          path: signer.sign(path),
        }),
        headers: {
          "content-type": "application/json",
          "authorization": context.getUserData("apiKey"),
        },
      }).then(res => res.text());
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