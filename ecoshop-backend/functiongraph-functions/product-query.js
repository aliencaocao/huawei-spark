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
      const [rows, fields] = await connection.execute("SELECT `id`, `name`, `price`, `type`, `quantity`, `owner`, `obs_image`, COUNT(`user_product_bookmark`.`user`) AS `bookmarks` FROM `product` " +
        "INNER JOIN `product_image` ON `product_image`.`product` = `product`.`id` " +
        "LEFT OUTER JOIN `user_product_bookmark` ON `user_product_bookmark`.`product` = `product`.`id` " +
        "WHERE `product_image`.`order` = 1 " +
        "GROUP BY `id` ORDER BY `id` DESC LIMIT 21 ");

      output = rows;
    }
    else {
      if (!("fields" in body)) { // text-only query
        const [rows, fields] = await connection.execute("SELECT `id`, `name`, `price`, `type`, `quantity`, `owner`, `obs_image`, COUNT(`user_product_bookmark`.`user`) AS `bookmarks` FROM `product` " +
          "INNER JOIN `product_image` ON `product_image`.`product` = `product`.`id` " +
          "LEFT OUTER JOIN `user_product_bookmark` ON `user_product_bookmark`.`product` = `product`.`id` " +
          "WHERE MATCH(`name`, `tags`) AGAINST(? IN BOOLEAN MODE) " +
            "AND `product_image`.`order` = 1 " +
          "GROUP BY `id` ORDER BY `id` DESC LIMIT 21 ",
          [
            body["query"],
          ],
        );

        output = rows;
      }
      else { // query by text and filters
        let substitutions = [body["query"]];
        let conditions = "";

        for (const searchField of body["fields"]) {
          if (searchField["type"] == "int") {
            conditions += "AND `product_attr`.`attr_name` = ? ";

            if (searchField["condition"] == "gt") {
              conditions += "AND `product_attr`.`attr_int` > ? ";
            }
            else if (searchField["condition"] == "lt") {
              conditions += "AND `product_attr`.`attr_int` < ? ";
            }
            else {
              conditions += "AND `product_attr`.`attr_int` = ? ";
            }

            substitutions.push(searchField["attr"]);
            substitutions.push(searchField["value"]);
          }
          else if (searchField["type"] == "str") {
            conditions += "AND `product_attr`.`attr_name` = ? ";
            conditions += "AND `product_attr`.`attr_text` LIKE ? ";

            substitutions.push(searchField["attr"]);
            substitutions.push(searchField["value"] + "%");
          }
        }

        console.log("SELECT `id`, `name`, `price`, `type`, `quantity`, `owner`, `attr_name`, `attr_text`, `attr_int`, `obs_image`, COUNT(`user_product_bookmark`.`user`) AS `bookmarks` FROM `product` " +
          "INNER JOIN `product_attr` ON `product`.`id` = `product_attr`.`product` " +
          "INNER JOIN `product_image` ON `product_image`.`product` = `product`.`id` " +
          "LEFT OUTER JOIN `user_product_bookmark` ON `user_product_bookmark`.`product` = `product`.`id` " +
          "WHERE MATCH(`name`, `tags`) AGAINST(? IN BOOLEAN MODE) " +
            conditions +
            "AND `product_image`.`order` = 1 " +
          "GROUP BY `id` ORDER BY `id` DESC LIMIT 21 ");

        console.log(substitutions);

        const [rows, fields] = await connection.execute("SELECT `id`, `name`, `price`, `type`, `quantity`, `owner`, `attr_name`, `attr_text`, `attr_int`, `obs_image`, COUNT(`user_product_bookmark`.`user`) AS `bookmarks` FROM `product` " +
          "INNER JOIN `product_attr` ON `product`.`id` = `product_attr`.`product` " +
          "INNER JOIN `product_image` ON `product_image`.`product` = `product`.`id` " +
          "LEFT OUTER JOIN `user_product_bookmark` ON `user_product_bookmark`.`product` = `product`.`id` " +
          "WHERE MATCH(`name`, `tags`) AGAINST(? IN BOOLEAN MODE) " +
            conditions +
            "AND `product_image`.`order` = 1 " +
          "GROUP BY `id` ORDER BY `id` DESC LIMIT 21 ",
          substitutions,
        );

        output = rows;
      }
    }

    const response = {
      "statusCode": 200,
      "headers": { "Content-Type": "application/json" },
      "isBase64Encoded": false,
      "body": JSON.stringify({
        listings: output,
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
        error: e.toString(),
      }),
    };

    return errorBody;
  }
};