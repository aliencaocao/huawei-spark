// Returns a list of user-uploaded videos based on a query
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

    let output = [];

    if (!("query" in body)) { // get generic homepage
      const [rows, fields] = await connection.execute("SELECT `product`.`id`, `name`, `price`, `type`, `quantity`, `owner`, `obs_location`, `social_video`.`id`, " +
        "COUNT(CASE WHEN `user_video_react`.`react` = 1 THEN 1 ELSE NULL END) as `likes`, " +
        "COUNT(CASE WHEN `user_video_react`.`react` = 2 THEN 1 ELSE NULL END) as `dislikes`, " +
        "COUNT(CASE WHEN `user_video_react`.`user` = ? AND `user_video_react`.`react` = 1 THEN 1 ELSE NULL END) as `self_like`, " +
        "COUNT(CASE WHEN `user_video_react`.`user` = ? AND `user_video_react`.`react` = 2 THEN 1 ELSE NULL END) as `self_dislike` FROM `product` " +
        "INNER JOIN `social_video_product` ON `social_video_product`.`product` = `product`.`id` " +
        "INNER JOIN `social_video` ON `social_video_product`.`video` = `social_video`.`id` " +
        "LEFT OUTER JOIN `user_video_react` ON `user_video_react`.`video` = `social_video`.`id` " +
        "GROUP BY `social_video`.`id`, `product`.`id` ORDER BY `social_video`.`id` DESC LIMIT 5",
        [authData.username, authData.username]
      );

      output = rows;
    }
    else {
      const [rows, fields] = await connection.execute("SELECT `product`.`id`, `name`, `price`, `type`, `quantity`, `owner`, `obs_location`, `social_video`.`id`, " +
        "COUNT(CASE WHEN `user_video_react`.`react` = 1 THEN 1 ELSE NULL END) as `likes`, " +
        "COUNT(CASE WHEN `user_video_react`.`react` = 2 THEN 1 ELSE NULL END) as `dislikes`, " +
        "COUNT(CASE WHEN `user_video_react`.`user` = ? AND `user_video_react`.`react` = 1 THEN 1 ELSE NULL END) as `self_like`, " +
        "COUNT(CASE WHEN `user_video_react`.`user` = ? AND `user_video_react`.`react` = 2 THEN 1 ELSE NULL END) as `self_dislike` FROM `product` " +
        "INNER JOIN `social_video_product` ON `social_video_product`.`product` = `product`.`id` " +
        "INNER JOIN `social_video` ON `social_video_product`.`video` = `social_video`.`id` " +
        "LEFT OUTER JOIN `user_video_react` ON `user_video_react`.`video` = `social_video`.`id` " +
        "WHERE MATCH(`name`, `tags`) AGAINST(? IN BOOLEAN MODE) " +
        "GROUP BY `social_video`.`id`, `product`.`id` ORDER BY `social_video`.`id` DESC LIMIT 5",
        [authData.username, authData.username, body["query"]],
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