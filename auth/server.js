var http = require('http');

var server = http.createServer(function (request, response) {
  console.log("Received request");
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.end("Hello, this is the Auth service\n");
});

server.listen(80);

console.log("Server running at http://127.0.0.1:80/");
