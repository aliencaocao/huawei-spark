// Lists the products which belong to the current user
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

    const [rows, fields] = await connection.execute("SELECT `id`, `name`, `price`, `type`, `quantity`, `owner`, `obs_image`, COUNT(`user_product_bookmark`.`user`) AS `bookmarks` FROM `product` " +
      "INNER JOIN `product_image` ON `product_image`.`product` = `product`.`id` " +
      "LEFT OUTER JOIN `user_product_bookmark` ON `user_product_bookmark`.`product` = `product`.`id` " +
      "WHERE `owner` = ? AND `product_image`.`order` = 1 " +
      "GROUP BY `id` ORDER BY `id` DESC LIMIT 21 ",
      [authData.username],
    );

    return {
      "statusCode": 200,
      "headers": { "Content-Type": "application/json" },
      "isBase64Encoded": false,
      "body": JSON.stringify({
        success: true,
        listings: rows,
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