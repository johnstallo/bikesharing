var app = angular.module('myApp', ['ngRoute', 'ngMap']);

app.controller('MainController', function ($scope, $http, $timeout) {
    $scope.map = null;
    $scope.markers = [];
    $scope.markerId = 1;
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
        var BIKE_LOCATIONS = [
            { latDiff: 0.001, lngDiff: 0.001 },
            { latDiff: -0.001, lngDiff: -0.003 }
        ];

        for (var i = 0; i < BIKE_LOCATIONS.length; i++) {
            var bikeData = {
                id: i,
                name: "bike" + i,
            };
            var marker = new google.maps.Marker({
                position: { lat: currentPosition.lat + BIKE_LOCATIONS[i].latDiff, lng: currentPosition.lng + BIKE_LOCATIONS[i].lngDiff },
                icon: '/images/bike-icon.png',
                animation: google.maps.Animation.DROP,
                map: map
            });

            attachBikeData(marker, bikeData);

            // google.maps.event.addListener(bike.marker, 'click', function() {
            //     $scope.openPanel();
            // });
            // bike.marker.addListener('click', function (e) {
            //     $scope.openPanel();
            // });
            $scope.availableBikes.push(bikeData);
        }
    };

    function attachBikeData(marker, bikeData) {
        marker.addListener('click', function () {
                $scope.openPanel(bikeData);
            });
    }

    $timeout(function () {
        $scope.map = new google.maps.Map(document.getElementById("map_canvas"),
            $scope.initialMapOptions);

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                $scope.position = { lat: position.coords.latitude, lng: position.coords.longitude };

                var marker = new google.maps.Marker({
                    position: $scope.position,
                    // icon: '/images/male-icon.png',
                    map: $scope.map
                });

                $scope.map.setCenter($scope.position);
                smoothZoom($scope.map, $scope.mapOptions.zoom, $scope.map.getZoom());
                $timeout(function() {
                    getAvailableBikes($scope.map, $scope.position);
                }, 2000);
                
            });

        }
    }, 100);

    $scope.openPanel = function (bikeData) {
        console.log("open panel");
        $scope.bikeData = bikeData;
        $scope.showPanel = true;
        $scope.mapStyle = { width: '100%', height: '63%' };
        $scope.$apply();
    }

    $scope.closePanel = function () {
        if ($scope.showPanel) {
            console.log("close panel");
            $scope.showPanel = false;
            $scope.mapStyle = { width: '100%', height: '93%' };
        }
    };

    function initializeLayout() {
        $scope.showPanel = false;
        $scope.mapStyle = { width: '100%', height: '93%' };
        $scope.panelStyle = { width: '100%', height: '30%', 'background-color': 'green' };
    };
    initializeLayout();

    function smoothZoom(map, max, cnt) {
        if (cnt >= max) {
            return;
        }
        else {
            z = google.maps.event.addListener(map, 'zoom_changed', function (event) {
                google.maps.event.removeListener(z);
                smoothZoom(map, max, cnt + 1);
            });
            setTimeout(function () { map.setZoom(cnt) }, 80); // 80ms is what I found to work well on my system -- it might not work well on all systems
        }
    }
});
