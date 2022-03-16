// Returns list of products using flexible and extensive filtering options
// Authorization Required - API Gateway Custom Authorizer required.

const mysql = require("mysql2/promise");

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
    callback(e.toString(), e);
  }
};

exports.handler = async (event, context) => {
  try {
    const body = JSON.parse((Buffer.from(event.body, 'base64')).toString());

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
        let conditions = "", substitutions = [body["query"]];

        if ("price" in body) {
          if (body.price.condition == "gt") {
            conditions += "AND (`product`.`price` > ?) ";
          }
          else if (body.price.condition == "lt") {
            conditions += "AND (`product`.`price` < ?) ";
          }
          else {
            conditions += "AND (`product`.`price` = ?) ";
          }

          substitutions.push(body.price.value);
        }

        const [rows, fields] = await connection.execute("SELECT `id`, `name`, `price`, `type`, `quantity`, `owner`, `obs_image`, COUNT(`user_product_bookmark`.`user`) AS `bookmarks` FROM `product` " +
          "INNER JOIN `product_image` ON `product_image`.`product` = `product`.`id` " +
          "LEFT OUTER JOIN `user_product_bookmark` ON `user_product_bookmark`.`product` = `product`.`id` " +
          "WHERE MATCH(`name`, `tags`) AGAINST(? IN BOOLEAN MODE) " +
            "AND `product_image`.`order` = 1 " +
            conditions +
          "GROUP BY `id` ORDER BY `id` DESC LIMIT 21 ",
          substitutions,
        );

        output = rows;
      }
      else { // query by text and filters
        let substitutions = [body["query"]];
        let conditions = "";
        let firstField = true;

        for (const searchField of body["fields"]) {
          if (!firstField) conditions += "OR ";
          else firstField = false;

          if (searchField["type"] == "int") {
            conditions += "(`product_attr`.`attr_name` = ? ";

            if (searchField["condition"] == "gt") {
              conditions += "AND `product_attr`.`attr_int` > ?) ";
            }
            else if (searchField["condition"] == "lt") {
              conditions += "AND `product_attr`.`attr_int` < ?) ";
            }
            else {
              conditions += "AND `product_attr`.`attr_int` = ?) ";
            }

            substitutions.push(searchField["attr"]);
            substitutions.push(searchField["value"]);
          }
          else if (searchField["type"] == "str") {
            conditions += "(`product_attr`.`attr_name` = ? ";
            conditions += "AND `product_attr`.`attr_text` LIKE ?) ";

            substitutions.push(searchField["attr"]);
            substitutions.push(searchField["value"] + "%");
          }
        }

        if ("price" in body) {
          if (body.price.condition == "gt") {
            conditions += "AND (`product`.`price` > ?) ";
          }
          else if (body.price.condition == "lt") {
            conditions += "AND (`product`.`price` < ?) ";
          }
          else {
            conditions += "AND (`product`.`price` = ?) ";
          }

          substitutions.push(body.price.value);
        }

        const [rows, fields] = await connection.execute("SELECT `id`, `name`, `price`, `type`, `quantity`, `owner`, `attr_name`, `attr_text`, `attr_int`, `obs_image`, COUNT(`user_product_bookmark`.`user`) AS `bookmarks` FROM `product` " +
          "INNER JOIN `product_attr` ON `product`.`id` = `product_attr`.`product` " +
          "INNER JOIN `product_image` ON `product_image`.`product` = `product`.`id` " +
          "LEFT OUTER JOIN `user_product_bookmark` ON `user_product_bookmark`.`product` = `product`.`id` " +
          "WHERE MATCH(`name`, `tags`) AGAINST(? IN BOOLEAN MODE) " +
            "AND " +
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
        success: true,
        listings: output,
      }),
    };

    return response;
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