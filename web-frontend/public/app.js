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
        mapTypeId: ROADMAP
    };

    $timeout(function () {
        $scope.map = new google.maps.Map(document.getElementById("map_canvas"), $scope.initialMapOptions);

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                $scope.position = { lat: position.coords.latitude, lng: position.coords.longitude };

                var marker = new google.maps.Marker({
                    position: $scope.position,
                    map: $scope.map
                });

                $scope.map.setCenter($scope.position);
                smoothZoom($scope.map, $scope.mapOptions.zoom, $scope.map.getZoom());
            });

        }
    }, 100);

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
