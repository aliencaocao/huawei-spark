const RD = require("reallydangerous");
const mysql = require("mysql2/promise");
const childProcess = require("child_process");
const ObsClient = require("esdk-obs-nodejs");
const short = require("short-uuid");

let signer = null;
let connection = null;

exports.initializer = async (context, callback) => {
  try {
    // signer = new RD.Signer(context.getUserData("secret"), context.getUserData("salt")), // MUST DECLARE ENCRYPTED VARIABLE AND SALT
    // connection = await mysql.createConnection(JSON.parse(context.getUserData("gaussDBconnect"))) // MUST CONNECT IN VPC FOR DATABASE USAGE

    callback(null, "");
  } catch (e) {
    callback("error", e);
  }
};

exports.handler = async (event, context) => {
  try {
    // const tokenData = JSON.parse(signer.unsign(event.headers["authorization"] ? event.headers["authorization"] : "")); // only for functions which require authentication.

    const obsClient = new ObsClient({
      access_key_id: context.getAccessKey(),
      secret_access_key: context.getSecretKey(),
      server: "obs.ap-southeast-3.myhuaweicloud.com",
      max_retry_count: 1,
      timeout: 20,
      ssl_verify: false,
      long_conn_param: 0
    });

    let path = decodeURIComponent(event["Records"][0].s3.object.key);

    if (!path.includes("public-img/")) {
      return;
    }

    console.log(path);

    try {
      obsClient.setObjectAcl({
      Bucket: 'ecoshop',
      Key: path,
      ACL: obsClient.enums.AclPublicRead,
    }, (err, result) => {
      if (err) {              
        console.log(err);
      }
      else {              
        console.log(result);   
      }
    });
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