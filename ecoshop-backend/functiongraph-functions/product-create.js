// Handles single and bulk listing submissions
// Authorization Required - API Gateway Custom Authorizer required.

const mysql = require("mysql2/promise");
const https = require("https");
const RD = require("reallydangerous");

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

const planInsufficientError = {
  "statusCode": 200,
  "headers": { "Content-Type": "application/json" },
  "isBase64Encoded": false,
  "body": JSON.stringify({
    success: false,
    error: "plan-insufficient",
  }),
};

const REQUIRED_FIELDS = [
  "name",
  "price",
  "type",
  "quantity",
  "owner",
  "description",
  "attributes",
  "images",
];

exports.initializer = async (context, callback) => {
  try {
    connection = await mysql.createConnection(JSON.parse(context.getUserData("gaussDBconnect"))) // MUST CONNECT IN VPC FOR DATABASE USAGE

    callback(null, "");
  } catch (e) {
    callback("error", e);
  }
};

function validateListing(listing) {
  for (const field of REQUIRED_FIELDS) {
    if (!(field in listing)) return false;
  }
  
  return true;
}

async function insertListing(listing) {
  // get tags via CTRLsum

  // insert product
  const [rows, fields] = await connection.execute(
    "INSERT INTO `product` (`name`, `tags`, `price`, `type`, `quantity`, `owner`, `description`, `impressions`, `points`) " +
    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [listing.name, "", listing.price, listing.type, listing.quantity, listing.owner, listing.description, 0, Math.floor(listing.price / 10)],
  );

  const listingId = rows.insertId;

  // create product attributes
  const attributeKeys = Object.keys(listing.attributes);
  for (let i = 0; i < attributeKeys.length; i++) {
    let attrText = listing.attributes[attributeKeys[i]];
    let attrInt = 0;
    try {
      attrInt = parseInt(attrText);
    }
    catch (e) {
      attrInt = 0;
    }

    await connection.execute(
      "INSERT INTO `product_attr` (`product`, `attr_name`, `attr_text`, `attr_int`) " +
      "VALUES (?, ?, ?, ?)",
      [listingId, attributeKeys[i], attrText, attrInt],
    );
  }

  // insert product images
  for (let i = 0; i < listing.images.length; i++) {
    await connection.execute(
      "INSERT INTO `product_image` (`product`, `obs_image`, `order`) " +
      "VALUES (?, ?, ?)",
      [listingId, listing.images[i], i + 1],
    );
  }
}

exports.handler = async (event, context) => {
  try {
    const body = JSON.parse((Buffer.from(event.body, 'base64')).toString());
    const authData = JSON.parse(event.headers["authData"]); // verified by API Gateway Custom Authorizer

    if ("type" in body) {
      if (body.type === "bulk") { // for bulk listings only: check if authData plan is adequate
        if (authData.plan === 1) {
          for (const listing of body.listings) { // check if all listings contain the required fields
            listing.owner = authData.username;
            if (!validateListing(listing)) return validationError;
          }

          for (const listing of body.listings) {
            await insertListing(listing);
          }
        }
        else { // reject if plan is insufficient
          return planInsufficientError;
        }
      }
      else if (body.type === "single") {
        body.listing.owner = authData.username;
        if (!validateListing(body.listing)) return validationError; // check if the listing contains all required fields
        await insertListing(body.listing);
      }
      else {
        return validationError;
      }
    }

    return {
      "statusCode": 200,
      "headers": { "Content-Type": "application/json" },
      "isBase64Encoded": false,
      "body": JSON.stringify({
        success: true,
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