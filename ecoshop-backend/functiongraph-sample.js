const http = require('http'); // Import Node.js core module

var server = http.createServer(function (req, res) {   //create web server
  if (req.url.startsWith("/")) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write('<html><body><h2>This is http function.</h2></body></html>');
    res.write(JSON.stringify(req.headers));
    console.log(req.headers);
    // console.log(req.method);

    if (req.method === "POST") {
      let reqBody = "";
      res.write("POST");
      req.on('data', function (data) {
        reqBody += data;
      });

      req.on('end', function () {
        res.write(reqBody);
        res.write("end");
        res.end();
      });
      // console.log(req.body);
    }
    else {
      res.end();
    }

    // res.write(req.headers);
    // res.write(req.url);
  } else {
    res.end('Invalid Request!');
  }
});

server.listen(8000, '127.0.0.1'); //6 - listen for any incoming requests

console.log('Node.js web server at port 8000 is running..')
