'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$http', '$location', 'Authentication',
	function($scope, $http, $location, Authentication) {
	    $scope.authentication = Authentication;
	    $scope.credentials = {};

		// If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/');

		$scope.signup = function() {
			$http.post('/auth/signup', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// And redirect to the index page
				$location.path('/');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		$scope.signin = function () {
		    var posturl = '/series/' + $scope.series[$scope.credentials.seriesItemIndex]._id + '/session';
			$http.post(posturl, $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
			    $scope.authentication.user = {
			        "username": $scope.credentials.username,
			        "displayName": $scope.credentials.username,
			        "token": response.token,
			        "seriesId": $scope.series[$scope.credentials.seriesItemIndex]._id,
			        "seriesName": $scope.series[$scope.credentials.seriesItemIndex].name,
			        "roleType": $scope.credentials.roleType
			    };
			    $scope.token = response.token;
                // Add the token to the default header being sent with each http request
                $http.defaults.headers.common.token = $scope.token;                                
				// And redirect to the index page
				$location.path('/');
			}).error(function(response) {
				$scope.error = response.title;
			});
		};

		$scope.findseries = function () {
		    $http.get('/series').success(function(response) {
		        // If successful we assign the response to series
		        $scope.series = response;
		        if (response && response[0] && response[0]._id) {
		            $scope.credentials.seriesItemIndex = 0; 
		        }
		        $scope.credentials.roleType = 'administrator';
		    }).error(function(response) {
		        $scope.error = "Error: " + response.title ? response.title : JSON.stringify(response);
		    });
		}
	}
]);