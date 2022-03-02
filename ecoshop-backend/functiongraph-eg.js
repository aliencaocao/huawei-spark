const RD = require("reallydangerous");
const mysql = require("mysql2/promise");
const childProcess = require("child_process");
const ObsClient = require("esdk-obs-nodejs");
const argon2 = require("argon2");

const signer = new RD.Signer("FunctionGraphSuisei");
let connection = null;

exports.handler = async (event, context) => {
  try {
    if (!connection) connection = await mysql.createConnection(JSON.parse(context.getUserData("gaussDBconnect")));

    const [rows, fields] = await connection.execute('SELECT * FROM `user`', []);

    const obsClient = new ObsClient({
      access_key_id: context.getAccessKey(),
      secret_access_key: context.getSecretKey(),
      server: "obs.ap-southeast-3.myhuaweicloud.com",
      max_retry_count: 1,
      timeout: 20,
      ssl_verify: false,
      long_conn_param: 0
    });

    const output = {
      "statusCode": 200,
      "headers": { "Content-Type": "application/json" },
      "isBase64Encoded": false,
      "body": JSON.stringify({
        "connection": connection.toString(),
        "rows": rows,
        // "fields": fields, // useless
        "post-link": obsClient.createSignedUrlSync({
          Method : 'POST',
          Bucket: "ecoshop-test",
          Key: "tkai.gif",
        }),
        "put-link": obsClient.createSignedUrlSync({
          Method : 'PUT',
          Bucket: "ecoshop-test",
          Key: "tkai.gif",
        }),
        "split": obsClient.createPostSignatureSync({ // must use this
          Bucket: 'ecoshop-test',
          Key: 'tkai.gif',
          FormParams: { acl: 'public-read' },
        }),
      }),
    };
  
    // const output = {
    //   "statusCode": 200,
    //   "headers": { "Content-Type": "application/json" },
    //   "isBase64Encoded": false,
    //   "body": JSON.stringify({
    //     "cpu": (await childProcess.execSync("cat /proc/cpuinfo")).toString(),
    //     "out": await argon2.hash("password"),
    //     "url": obsClient.createSignedUrlSync({
    //       Method : 'PUT',
    //       SpecialParam: 'acl',
    //       Headers : {
    //         'Content-Type' : 'text/plain',
    //         'x-obs-acl' : 'public-read',
    //       },
    //       Bucket: "ecoshop-test",
    //       Key: "tkai.jpg",
    //       Expires: 300,
    //     }),
    //     "function-name": context.getFunctionName(),
    //     "encrypted-var1": context.getUserData("hashcat"),
    //     "event": event,
    //     "oh-nyo": signer.sign("haha yes"),
    //     "oh-yes": signer.unsign(signer.sign("haha yes")),
    //   }),
    // };
    return output;
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
}
