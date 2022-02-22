const RD = require('reallydangerous');
const mysql = require("mysql2");
const signer = new RD.Signer('FunctionGraphSuisei');

exports.handler = async (event, context) => {
  const output = {
    'statusCode': 200,
    'headers': { 'Content-Type': 'application/json' },
    'isBase64Encoded': false,
    'body': JSON.stringify({
      "event": event,
      "oh-nyo": signer.sign("haha yes"),
      "oh-yes": signer.unsign(signer.sign("haha yes")),
    }),
  }
  return output;
}
