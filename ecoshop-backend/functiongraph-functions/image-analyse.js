// Calls Huawei Cloud Image Moderation and Image Tagging APIs on images uploaded by users
// TODO: delete images which fail moderation
// Authorization Required - API Gateway Custom Authorizer required.

const huaweiSigner = require('./signer'); // https://support.huaweicloud.com/intl/en-us/devg-apisign/api-sign-sdk-nodejs.html#section1
const fetch = require("node-fetch");
const RD = require("reallydangerous");
const mysql = require("mysql2/promise");
const childProcess = require("child_process");
const ObsClient = require("esdk-obs-nodejs");
const https = require("https");

const OBS_URL = "https://ecoshop-content.obs.ap-southeast-3.myhuaweicloud.com";
const IMG_MODERATION_URL = "https://moderation.ap-southeast-1.myhuaweicloud.com/v2/017ae3a1064e417fb0c520416f56fb26/moderation/image";
const IMG_TAGGING_URL = "https://image.ap-southeast-1.myhuaweicloud.com/v2/017ae3a1064e417fb0c520416f56fb26/image/tagging";

let signer = null;
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

const explicitContentError = {
  "statusCode": 200,
  "headers": { "Content-Type": "application/json" },
  "isBase64Encoded": false,
  "body": JSON.stringify({
    success: false,
    error: "explicit-content",
  }),
};

exports.handler = async (event, context) => {
  try {
    const body = JSON.parse((Buffer.from(event.body, 'base64')).toString());

    if (!("image" in body)) return validationError;

    let sig = new huaweiSigner.Signer();
    sig.Key = context.getAccessKey();
    sig.Secret = context.getSecretKey();
    
    // image moderation API
    let moderationReqSigner = new huaweiSigner.HttpRequest("POST", IMG_MODERATION_URL);

    moderationReqSigner.headers = {
      "content-type": "application/json",
      // "X-Project_Id": PROJECT_ID, // not needed for this API
    };

    moderationReqSigner.body = JSON.stringify({
      "url": `${OBS_URL}/user-image/${body["image"]}`,
      "categories": ["porn"], // check if image is porn
    });

    let moderationReqOptions = sig.Sign(moderationReqSigner);

    let moderationRes = await fetch(IMG_MODERATION_URL, {
      method: "post",
      headers: moderationReqOptions.headers,
      body: moderationReqSigner.body,
    }).then(res => res.json());

    console.log(moderationRes);

    // return if explicit content is detected
    if (moderationRes["result"]["suggestion"] !== "pass") return explicitContentError;

    // image tagging API
    let taggingReqSigner = new huaweiSigner.HttpRequest("POST", IMG_TAGGING_URL);

    taggingReqSigner.headers = {
      "content-type": "application/json",
      // "X-Project_Id": PROJECT_ID, // not needed for this API
    };

    taggingReqSigner.body = JSON.stringify({
      "url": `${OBS_URL}/user-image/${body["image"]}?x-image-process=style/limit-2000`,
      "limit": 10,
      "language": "en", // Chinese (ZH) or English (EN)
    });

    let taggingReqOptions = sig.Sign(taggingReqSigner);

    let taggingRes = await fetch(IMG_TAGGING_URL, {
      method: "post",
      headers: taggingReqOptions.headers,
      body: taggingReqSigner.body,
    }).then(res => res.json());

    return {
      "statusCode": 200,
      "headers": { "Content-Type": "application/json" },
      "isBase64Encoded": false,
      "body": JSON.stringify({
        success: true,
        result: taggingRes,
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