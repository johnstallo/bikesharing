// @ts-check
var app = angular.module('myApp', []);

app.controller('MainController', function ($scope, $http, $timeout, $window, $log) {

    $scope.map = null;
    var BUILDING_43 = { lat: 47.639488, lng: -122.134240 };
    var BUILDING_18 = { lat: 47.6443, lng: -122.1296 };
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

        var queryString = "?" + "lat=" + currentPosition.lat + "&lng=" + currentPosition.lng;
        var serviceUrl = "/api/availablebikes" + queryString + "&_=" + Date.now();

        $http.get(serviceUrl).then(function (response) {
            var availableBikes = response.data;

            for (var i = 0; i < availableBikes.length; i++) {
                var bikeData = availableBikes[i];
                var marker = new google.maps.Marker({
                    position: bikeData.position,
                    icon: '/images/bike-icon.png',
                    animation: google.maps.Animation.DROP,
                    map: map
                });

                // bikeData.position = marker.position;
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
            navigator.geolocation.getCurrentPosition(function (position) {
                $scope.position = { lat: position.coords.latitude, lng: position.coords.longitude };
                
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

            });
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
            $scope.reservationMessage = response.data;
            $scope.bikeIsReserved = true;
        });
    };

    $scope.cancelReservation = function () {
        $scope.bikeIsReserved = false;
    };

    $scope.estimateMinutesToWalk = function (distanceMiles) {
        //Note: Unit for distanceMiles.value is meters
        if (distanceMiles) {
            return Math.round((distanceMiles.value / 1000) * 20);
        }
        return 0;
    }
});
