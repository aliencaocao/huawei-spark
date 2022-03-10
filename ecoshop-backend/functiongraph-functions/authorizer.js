// Serves as the authorization backend for API Gateway Custom Authorizer

const RD = require('reallydangerous');

exports.handler = async (event, context) => {
  if (!("authorization" in event.headers)) {
    console.log("authorization missing");
    return {
      'statusCode': 200,
      'body': JSON.stringify({ status: 'deny', error: "authorization-header-missing" })
    }
  }
  try {
    const signer = new RD.Signer(context.getUserData("secret"), context.getUserData("salt"));
    const authData = signer.unsign(event.headers["authorization"])

    return {
      'statusCode': 200,
      'body': JSON.stringify({
        status: 'allow',
        context: { authData }, // maps to "authData" in API Gateway
      }),
    };
  }
  catch (e) {
    console.error(e)
    return {
      'statusCode': 200,
      'body': JSON.stringify({
        status: 'deny',
        context: {
          code: "1001",
          message: "incorrect-login",
        },
      }),
    };
  }
};