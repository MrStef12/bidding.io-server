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
    var auctionIO = io
    .of("/auction/"+auction.id)
    .on('connection', function(socket) {
        console.log('WS - a user connected for auction id '+auction.id);
        socket.emit("auctionInfo", auction);

        socket.on("placeBid", function(bid) {
            console.log("WS - Got bid of "+ bid + " from auction "+auction.id);
            if(bid > auction.price) {
                console.log("WS - Accepted bid. Destributing new price.");
                auction.price = bid;
                auctionIO.emit("priceUpdate", auction.price);
            } else {
                console.log("WS - Declined bid. Reason: Lower or equal to current bid.");
            }
        });

        socket.on('disconnect', function () {
            console.log('WS - user disconnected for auction id '+auction.id);
        });
    });
}, this);

/// ----------------- START SERVER ----------------- ///

http.listen(PORT, function () {
    console.log("Listening on http://localhost:%s", PORT);
});