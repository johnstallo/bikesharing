// @ts-check
var app = angular.module('myApp', []);

app.controller('MainController', function ($scope, $http, $timeout, $window, $log) {

    // var MAP_HEIGHT_FULL = { width: '100%', height: '93%' };
    // var MAP_HEIGHT_PARTIAL = { width: '100%', height: '80%' };
    $scope.map = null;
    $scope.markers = [];
    $scope.position = { lat: 39.8282, lng: -98.5795 };
    var ROADMAP = 'roadmap';

    $scope.initialMapOptions = {
        zoom: 4,
        center: $scope.position,
        mapTypeId: ROADMAP
    };

    $scope.mapOptions = {
        zoom: 17,
        center: $scope.position,
        mapTypeId: ROADMAP,
    };

    $scope.availableBikes = [];
    function getAvailableBikes(map, currentPosition) {
        console.log("getting available bikes...");
        // var availableBikes = [
        //     { lat: 0.0001, lng: 0.001 },
        //     { lat: -0.001, lng: -0.003 },
        //     { lat: 0.003, lng: 0.0001 }
        // ];

        var queryString = "?" + "lat=" + currentPosition.lat + "&lng=" + currentPosition.lng;
        var serviceUrl = "/api/availablebikes" + queryString + "_=" + Date.now();
        
        $http.get(serviceUrl).then(function (response) {
            var availableBikes = response.data;

            for (var i = 0; i < availableBikes.length; i++) {
                var bikeData = {
                    id: i,
                    name: "bike" + i,
                };
                var marker = new google.maps.Marker({
                    position: { lat: availableBikes[i].lat, lng: availableBikes[i].lng },
                    icon: '/images/bike-icon.png',
                    animation: google.maps.Animation.DROP,
                    map: map
                });

                bikeData.position = marker.position;
                attachBikeData(marker, bikeData);
                $scope.availableBikes.push(bikeData);
            }
        });
    };

    function attachBikeData(marker, bikeData) {
        marker.addListener('click', function () {
            $scope.openPanel(bikeData);
            calcRoute($scope.position, bikeData.position);
        });
    }

    var directionsService = new google.maps.DirectionsService();
    var directionsDisplay;

    $timeout(function () {
        directionsDisplay = new google.maps.DirectionsRenderer();

        $scope.map = new google.maps.Map(document.getElementById("map_canvas"), $scope.initialMapOptions);
        directionsDisplay.setMap($scope.map);

        if (navigator.geolocation) {
            // TODO: getCurrentPosition only works on HTTPS! Hard code for now.
            // navigator.geolocation.getCurrentPosition(function (position) {
            // $scope.position = { lat: position.coords.latitude, lng: position.coords.longitude };
            $scope.position = { lat: 47.639488, lng: -122.134240 };

            var marker = new google.maps.Marker({
                position: $scope.position,
                map: $scope.map
            });

            $scope.map.setCenter($scope.position);
            // $scope.map.setZoom($scope.mapOptions.zoom-1);
            smoothZoom($scope.map, $scope.mapOptions.zoom, $scope.map.getZoom());
            $timeout(function () {
                getAvailableBikes($scope.map, $scope.position);
            }, 2000);

            // });

        }
    }, 100);

    function calcRoute(start, end) {
        var request = {
            origin: start,
            destination: end,
            travelMode: 'WALKING'
        };
        directionsService.route(request, function (result, status) {
            if (status == 'OK') {
                directionsDisplay.setDirections(result);
                $scope.bikeData.distance = result.routes[0].legs[0].distance;
                $scope.$apply(); //hack!
                console.log(result);
            }
        });
    }

    $scope.openPanel = function (bikeData) {
        console.log("open panel");
        $scope.bikeData = bikeData;
        $scope.showPanel = true;
        $scope.mapStyle = getMapStyle();
        $scope.$apply();
    };


    function calculateMapHeight(panelIsVisible) {
        var NAVBAR_HEIGHT = 38 + 10;
        var maxMapHeightPixels = $window.innerHeight - NAVBAR_HEIGHT;
        if (panelIsVisible) {
            var MAP_PANEL_RATIO = 0.8;
            var MAX_PANEL_HEIGHT = 120;
            var panelHeight = maxMapHeightPixels * (1 - MAP_PANEL_RATIO);
            if (panelHeight > MAX_PANEL_HEIGHT) {
                maxMapHeightPixels = maxMapHeightPixels - MAX_PANEL_HEIGHT;
            }
            else {
                maxMapHeightPixels = maxMapHeightPixels * MAP_PANEL_RATIO;
            }
        }

        var mapHeight = (maxMapHeightPixels / $window.innerHeight) * 100 + "%";
        console.log("mapheight: ", mapHeight);
        return { width: '100%', height: mapHeight };
    }
    var MAP_STYLE_PARTIAL = calculateMapHeight(true);
    var MAP_STYLE_FULLSCREEN = calculateMapHeight(false);

    function getMapStyle() {
        if ($scope.showPanel) {
            return MAP_STYLE_PARTIAL;
        }
        return MAP_STYLE_FULLSCREEN
    }

    $scope.closePanel = function () {
        console.log("close panel");
        $scope.showPanel = false;
        $scope.mapStyle = getMapStyle();
        $scope.map.setCenter($scope.position);
        $scope.map.setZoom($scope.mapOptions.zoom - 1); // BUG: zoom seems to require setting to zoom-1 for this to work
        // smoothZoom($scope.map, $scope.mapOptions.zoom, $scope.map.getZoom());
    };

    function initializeLayout() {
        $scope.showPanel = false;
        $scope.mapStyle = getMapStyle();
        $scope.panelStyle = {};
    };
    initializeLayout();

    function smoothZoom(map, max, cnt) {
        console.log("smoothZoom start: ", cnt, max);
        if (cnt == max) {
            return;
        }
        if (cnt > max) {
            console.log("immediate zoom from " + cnt + " to " + max);
            map.setZoom(max - 1); // BUG: zooming seems to need to be max-1 
        }
        else {
            console.log("zooming from " + cnt + " to " + max);
            var z = google.maps.event.addListener(map, 'zoom_changed', function (event) {
                google.maps.event.removeListener(z);
                smoothZoom(map, max, cnt + 1);
            });
            setTimeout(function () { map.setZoom(cnt) }, 80); // 80ms is what I found to work well on my system -- it might not work well on all systems
        }
    };

    $scope.reserveBike = function (bikeData) {
        $http.get("/api/reservebike?_=" + Date.now()).then(function (response) {
            $scope.helloMessage = response.data;
            $scope.bikeIsReserved = true;
        });
    };

    $scope.cancelReservation = function () {
        $scope.bikeIsReserved = false;
    }

    $scope.sayHelloToServer = function () {
        $http.get("/api?_=" + Date.now()).then(function (response) {
            $scope.helloMessage = response.data;
        });
    };
});
