console.log("Starting Bidding.io server...");

/// ----------------- GENERAL ----------------- ///

var fs = require("fs");
var app = require("express")();
var http = require("http").Server(app);
var io = require('socket.io')(http);

var contents = fs.readFileSync("content.json");
var contentsJson = JSON.parse(contents);

const PORT = 9998;

/// ----------------- REST SERVER ----------------- ///

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
    response.end(JSON.stringify(contentsJson));
};

app.get("/auctions", function (request, response) {
    console.log("REST - GET " + request.url);
    handler_get(request, response);
});

/// ----------------- WEBSOCKET SERVER ----------------- ///

contentsJson.forEach((auction) => {
    io.of("/auction/"+auction.id)
    .on('connection', function(socket) {
        console.log('a user connected for auction id '+auction.id);
        socket.on('disconnect', function () {
            console.log('user disconnected for auction id '+auction.id);
        });
    });
}, this);

/// ----------------- START SERVER ----------------- ///

http.listen(PORT, function () {
    console.log("Listening on http://localhost:%s", PORT);
});