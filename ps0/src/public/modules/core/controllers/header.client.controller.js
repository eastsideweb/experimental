'use strict';

angular.module('core').controller('HeaderController', ['$scope', '$http', '$location', 'Authentication', 'Menus',
	function($scope, $http, $location, Authentication, Menus) {
		$scope.authentication = Authentication;
		$scope.isCollapsed = false;
		$scope.menu = Menus.getMenu('topbar');

		$scope.toggleCollapsibleMenu = function() {
			$scope.isCollapsed = !$scope.isCollapsed;
		};

		$scope.signout = function () {
		    var deleteUrl = '/series/' + $scope.authentication.user.seriesId + '/session/' + $scope.authentication.user.token;
		    $http.delete(deleteUrl).success(function () {
		        delete $scope.authentication.user;
		        delete $http.defaults.headers.common.token;
		        $location.path('/');
		    }).error(function (errorResponse) {
		        $scope.error = "Error: " + errorResponse.statusText + " ( " + errorResponse.status + " )";
                // We will ignore the error for now
		        delete $scope.authentication.user;
		        delete $http.defaults.headers.common.token;
		        $location.path('/');
		    })
		}
		// Collapsing the menu after navigation
		$scope.$on('$stateChangeSuccess', function() {
			$scope.isCollapsed = false;
		});
	}
]);