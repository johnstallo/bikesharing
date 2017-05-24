var os = require('os');
var request = require('request');
var morgan = require('morgan');
if (process.env.APPINSIGHTS_INSTRUMENTATIONKEY) {
    var appInsights = require('applicationinsights').setup().start();
    appInsights.client.commonProperties = {
        "Service name": require("./package.json").name
    };
}
var express = require('express');

var app = express();
app.use(express.static(__dirname + '/public'));
app.use(morgan("dev"));

// application -------------------------------------------------------------
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

// api ------------------------------------------------------------
app.get('/api', function (req, res) {
    res.send("Hello from service A");
});

app.get('/api/reservebike', function (req, res) {
    // Invoke reservation service
    request('http://reservations', function (error, response, body) {
        res.send(body);
    });
});

app.get('/api/availablebikes', function (req, res) {
    // forward query string as-is
    var bikeServiceUrl = req.url.replace("/api/availablebikes", 'http://bikesss/api/getAvailableBikes');
    // var bikeServiceUrl = 'http://bikes/api/getAvailableBikes';

    // Get available bikes
    request(bikeServiceUrl, function (error, response, body) {
        if (error || response.statusCode != 200) {
            console.log("ERROR: %j %j", error, response);
            res.send("Ooops, something bad happened. Please try again.");
            return;
        }

        res.send(body);
    });
});


var port = 80;
var server = app.listen(port, function () {
    console.log('Listening on port ' + port);
});

process.on("SIGINT", () => {
    process.exit(130 /* 128 + SIGINT */);
});

process.on("SIGTERM", () => {
    console.log("Terminating...");
    server.close();
});


// var mongoClient = require("mongodb").MongoClient;
// mongoClient.connect(process.env.MYMONGO_CONNECTION_STRING, function (err, db) {
//     console.log('Connected to database ' + process.env.MYMONGO_CONNECTION_STRING);
//     db.close();
// });