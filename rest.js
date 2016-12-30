var fs = require("fs");
var http = require("http");

var contents = fs.readFileSync("content.json");
var contentsJson = JSON.parse(contents);

send_header = function (response, responseCode) {
    response.writeHead(responseCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET'
    });
    console.log("REST - response code " + responseCode);
}

handler_get = function (request, response) {
    send_header(response, 200);
    if (request.url == "/auctions") {
        response.end(JSON.stringify(contentsJson));
    } else {
        response.end("{}");
    }
};

dispatch = {
    'GET': handler_get
};

exports.run = (port) => {
    var server = http.createServer(function (request, response) {
        console.log("REST - " + request['method'] + " " + request.url);
        dispatch[request['method']](request, response);
    });

    server.listen(port, function () {
        console.log("REST - Listening on http://localhost:%s", port);
    });
}