var app = angular.module('myApp', ['ngRoute', 'ngMap']);

app.controller('MainController', function ($scope, $http, NgMap) {

    $scope.messages = [];
    $scope.sayHelloToServer = function () {
        $http.get("/api?_=" + Date.now()).then(function (response) {
            $scope.messages.push(response.data);

            // Make request to /metrics            
            // $http.get("/metrics?_=" + Date.now()).then(function(response) {
            //     $scope.metrics = response.data;
            // });
        });
    };

    $scope.sayHelloToServer();

    var styles = [];
    var colors = ["black", "green", "red", "blue", "orange", "purple", "gray"];
    var colorIndex = 0;

    $scope.getStyle = function (message) {
        if (!styles[message]) {
            styles[message] = { 'color': colors[colorIndex] };
            colorIndex = colorIndex < colors.length - 1 ? colorIndex + 1 : 0;
        }
        return styles[message];
    };

    console.log("hello ");
    // NgMap.getMap().then(function (map) {
    //     console.log("world");
    //     console.log(map.getCenter());
    //     console.log('markers', map.markers);
    //     console.log('shapes', map.shapes);
    // });

    NgMap.getMap().then(function (map) {
        console.log('world');
        console.log(map.getCenter());
        console.log('markers', map.markers);
        console.log('shapes', map.shapes);
    });

});
