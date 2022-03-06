var signer = require('./signer');
var https = require("https");
var sig = new signer.Signer();
//Set the AK/SK to sign and authenticate the request.
sig.Key = "";
sig.Secret = "";

//The following example shows how to set the request URL and parameters to query a VPC list.
//Specify a request method, such as GET, PUT, POST, DELETE, HEAD, and PATCH.
//Set request host.
//Set request URI.
//Set parameters for the request URL.
var r = new signer.HttpRequest("POST", "https://mts.ap-southeast-3.myhuaweicloud.com/v1/0f2d658c2e00f40e2fd8c0099b46f5e9/transcodings");
//Add header parameters, for example, x-domain-id for invoking a global service and x-project-id for invoking a project-level service.
r.headers = {
  "Content-Type": "application/json",
  "X-Project_Id": "0f2d658c2e00f40e2fd8c0099b46f5e9",
};
//Add a body if you have specified the PUT or POST method. Special characters, such as the double quotation mark ("), contained in the body must be escaped.
r.body = JSON.stringify({
  "input": {
    "bucket": "ecoshop-data",
    "location": "ap-southeast-3",
    "object": "user-video/9P3z5mbrW6iehYdmXi7tLz"
  },
  "output": {
    "bucket": "ecoshop-data",
    "location": "ap-southeast-3",
    "object": "mpc-video/9P3z5mbrW6iehYdmXi7tLz"
  },
  "output_filenames": ["output"],
  "trans_template_id": [7000512]
});

var opt = sig.Sign(r);
console.log(opt.headers["X-Sdk-Date"]);
console.log(opt.headers["Authorization"]);

var req = https.request(opt, function (res) {
  console.log(res.statusCode);
  console.log('headers:', JSON.stringify(res.headers));
  res.on("data", function (chunk) {
    console.log(chunk.toString())
  })
});

req.on("error", function (err) {
  console.log(err.message)
});
req.write(r.body);
req.end();
