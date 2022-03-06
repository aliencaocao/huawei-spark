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
    callback("error", e);
  }
};

exports.handler = async (event, context) => {
  try {
    const body = JSON.parse((Buffer.from(event.body, 'base64')).toString());

    let output = [];

    if (!("query" in body)) { // get generic homepage
      const [rows, fields] = await connection.execute("SELECT `product`.`id`, `name`, `price`, `type`, `quantity`, `owner`, `obs_location`, `social_video`.`id`, " +
        "COUNT(CASE WHEN `user_video_react`.`react` = 1 THEN 1 ELSE NULL END) as `likes`, " +
        "COUNT(CASE WHEN `user_video_react`.`react` = 2 THEN 1 ELSE NULL END) as `dislikes` FROM `product`  " +
        "INNER JOIN `social_video_product` ON `social_video_product`.`product` = `product`.`id` " +
        "INNER JOIN `social_video` ON `social_video_product`.`video` = `social_video`.`id` " +
        "LEFT OUTER JOIN `user_video_react` ON `user_video_react`.`video` = `social_video`.`id` " +
        "GROUP BY `social_video`.`id`, `product`.`id` ORDER BY `social_video`.`id` DESC LIMIT 5");

      output = rows;
    }
    else {
      const [rows, fields] = await connection.execute("SELECT `product`.`id`, `name`, `price`, `type`, `quantity`, `owner`, `obs_location`, `social_video`.`id`, " +
        "COUNT(CASE WHEN `user_video_react`.`react` = 1 THEN 1 ELSE NULL END) as `likes`, " +
        "COUNT(CASE WHEN `user_video_react`.`react` = 2 THEN 1 ELSE NULL END) as `dislikes` FROM `product`  " +
        "INNER JOIN `social_video_product` ON `social_video_product`.`product` = `product`.`id` " +
        "INNER JOIN `social_video` ON `social_video_product`.`video` = `social_video`.`id` " +
        "LEFT OUTER JOIN `user_video_react` ON `user_video_react`.`video` = `social_video`.`id` " +
        "WHERE MATCH(`name`, `tags`) AGAINST(? IN BOOLEAN MODE) " +
        "GROUP BY `social_video`.`id`, `product`.`id` ORDER BY `social_video`.`id` DESC LIMIT 5",
        [body["query"]],
      );

      output = rows;
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
    const errorBody = {
      "statusCode": 200,
      "headers": { "Content-Type": "application/json" },
      "isBase64Encoded": false,
      "body": JSON.stringify({
        success: false,
        error: e.toString(),
      }),
    };

    return errorBody;
  }
};