var request = require('request');
var morgan = require('morgan');
var express = require('express');

var app = express();
app.use(morgan("dev"));

// application -------------------------------------------------------------
app.get('/', function (req, res) {
    res.send("hello from bikes");
});

// api ------------------------------------------------------------
app.get('/api', function (req, res) {
    res.send("Hello from bikes/api");
});

app.get('/api/getAvailableBikes', function (req, res) {
    var queryLat = parseFloat(req.query.lat);
    var queryLng = parseFloat(req.query.lng);
    var resultsCount = parseInt(req.query.count);

    if (!queryLat || !queryLng) {
        res.send(200, "lat and lng parameters are required.");
    }

    if (!resultsCount || resultsCount > bikeData.length) {
        resultsCount = bikeData.length;
    }

    var availableBikes = [];
    for (var i = 0; i < resultsCount; i++) {
        availableBikes.push({ lat: queryLat + bikeData[i].lat, lng: queryLng + bikeData[i].lng });
    }

    res.send(availableBikes);
});

app.get('/api/test', function (req, res) {
    var lat = req.query.lat;
    var lng = req.query.lng;
    var location = { lat: lat, lng: lng };
    console.log('location: ' + lat + ', ' + lng);
    res.send(location);
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

//---------------------------------------
// hard-coded data
var bikeData = [
    { lat: 0.0001, lng: 0.001 },
    { lat: -0.001, lng: -0.003 },
    { lat: 0.003, lng: 0.0001 }
];


// var mongoClient = require("mongodb").MongoClient;
// mongoClient.connect(process.env.MYMONGO_CONNECTION_STRING, function (err, db) {
//     console.log('Connected to database ' + process.env.MYMONGO_CONNECTION_STRING);
//     db.close();
// });