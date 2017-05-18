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
    //res.send("hello from getAvailableBikes");
    var bikeData = [
        { latDiff: 0.0001, lngDiff: 0.001 },
        { latDiff: -0.001, lngDiff: -0.003 },
        { latDiff: 0.003, lngDiff: 0.0001 }
    ];
    res.send(bikeData);
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