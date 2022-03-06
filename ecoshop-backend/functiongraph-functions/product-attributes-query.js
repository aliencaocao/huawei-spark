const RD = require("reallydangerous");
const mysql = require("mysql2/promise");
const childProcess = require("child_process");
const ObsClient = require("esdk-obs-nodejs");
const short = require("short-uuid");

let connection = null;

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
    callback("error", e);
  }
};

exports.handler = async (event, context) => {
  try {
    const body = JSON.parse((Buffer.from(event.body, 'base64')).toString());

    console.log(context);
    console.log(event);

    let output = [];

    if (!("query" in body)) { // get generic homepage
      return validationError;
    }

    const [rows, fields] = await connection.execute("SELECT `attr_name`, COUNT(`attr_name`) AS `frequency` FROM `product` INNER JOIN `product_attr` ON `product`.`id` = `product_attr`.`product` " +
      "WHERE MATCH(`name`, `tags`) AGAINST(? IN BOOLEAN MODE) " +
      "GROUP BY `attr_name` ORDER BY `frequency` DESC LIMIT 7 ",
      [body["query"]],
    );

    output = rows;

    const response = {
      "statusCode": 200,
      "headers": { "Content-Type": "application/json" },
      "isBase64Encoded": false,
      "body": JSON.stringify({
        success: true,
        attributes: output,
      }),
    };

    return response;
  }
  catch (e) {
    const errorBody = {
      "statusCode": 200,
      "headers": { "Content-Type": "application/json" },
      "isBase64Encoded": false,
      "body": JSON.stringify({
           success:false,
        error: e.toString(),
      }),
    };

    return errorBody;
  }
};