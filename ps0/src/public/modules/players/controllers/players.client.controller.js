'use strict';

// Players controller
angular.module('players').controller('PlayersController', ['$scope', '$stateParams', '$location', 'Authentication', 'Players',
	function($scope, $stateParams, $location, Authentication, Players) {
		$scope.authentication = Authentication;

		// Create new Player
		$scope.create = function() {
			// Create new Player object
			var player = new Players ({
			    name: this.name,
			    description: this.description,
                active: this.active
			});

			// Redirect after save
			player.$save(function(response) {
				$location.path('players/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
			    $scope.error = "ERROR: " + errorResponse.data.message;
			});
		};

		// Remove existing Player
		$scope.remove = function(player) {
			if ( player ) { 
				player.$remove();

				for (var i in $scope.players) {
					if ($scope.players [i] === player) {
						$scope.players.splice(i, 1);
					}
				}
			} else {
				$scope.player.$remove(function() {
					$location.path('players');
				});
			}
		};

		// Update existing Player
		$scope.update = function() {
			var player = $scope.player;
			var id = player._id;
			player.$update(function () {
			    // $location.path('players/' + player._id); <-- Doesn't work
				$location.path('players/' + id);
			}, function(errorResponse) {
			    $scope.error = "ERROR: " + errorResponse.title;
			});
		};

		// Find a list of Players
		$scope.find = function() {
			$scope.players = Players.query();
		};

		// Find existing Player
		$scope.findOne = function() {
			$scope.player = Players.get({ 
				playerId: $stateParams.playerId
			});
		};
	}
]);