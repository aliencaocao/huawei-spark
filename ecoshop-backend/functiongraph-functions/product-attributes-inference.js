// Helps to suggest values for product attributes given a description during listing creation
// Authorization Required - API Gateway Custom Authorizer required.

const fetch = require("node-fetch");
const RD = require("reallydangerous");
const mysql = require("mysql2/promise");
const childProcess = require("child_process");
const ObsClient = require("esdk-obs-nodejs");
const https = require("https");

const OBS_URL = "https://ecoshop-content.obs.ap-southeast-3.myhuaweicloud.com";
const CTRLSUM_URL = "https://01516f373f434921a874bf502a986a58.apig.ap-southeast-3.huaweicloudapis.com/v1/infers/4bee9f8d-7d7d-4ccc-a4a9-e0be7a3b49e7/qna";
const MAX_ATTR = 10;
let APPCODE = "";

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
    APPCODE = context.getUserData("modelartsAppcode");

    callback(null, "");
  } catch (e) {
    callback("error", e);
  }
};

exports.handler = async (event, context) => {
  try {
    const body = JSON.parse((Buffer.from(event.body, 'base64')).toString());

    let output = {};
    if (!("description" in body)) return validationError;
    if (body.attributes.length > MAX_ATTR) return validationError;
    for (const attribute of body.attributes) {
      console.log(attribute);
      let response = await fetch(CTRLSUM_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Apig-Appcode": APPCODE,
        },
        body: JSON.stringify({
          "source": body.description,
          "prompt": `The ${attribute} is:`,
          "query": `What is the ${attribute}?`,
        }),
        timeout: 3000,
      }).then(res => res.json());

      if (response.success) {
        output[attribute] = response.answer.replace(`The ${attribute} is:`, "");
      }
    }

    return {
      "statusCode": 200,
      "headers": { "Content-Type": "application/json" },
      "isBase64Encoded": false,
      "body": JSON.stringify({
        success: true,
        result: output,
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