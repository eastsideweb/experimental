'use strict';

// Teams controller
angular.module('teams').controller('TeamsController', ['$scope', '$stateParams', '$location','Authentication', 'Teams', 'Players',
	function($scope, $stateParams, $location, Authentication, Teams, Players) {
		$scope.authentication = Authentication;
		$scope.showPlayerMenu = false;
		// Create new Team
		$scope.create = function() {
			// Create new Team object
			var team = new Teams ({
			    name: this.name,
			    description: this.description,
			    active: this.active,
                teamLeadId: this.teamLeadId,
                playerIds: this.playerIds
			});

			// Redirect after save
			team.$save(function(response) {
				$location.path('teams/' + response._id);

				// Clear form fields
				$scope.name = '';
				$scope.description = '';
				delete $scope.teamLeadId;
				$scope.playerIds = [];
				$scope.players = [];

			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Team
		$scope.remove = function(team) {
			if ( team ) { 
				team.$remove();

				for (var i in $scope.teams) {
					if ($scope.teams [i] === team) {
						$scope.teams.splice(i, 1);
					}
				}
			} else {
				$scope.team.$remove(function() {
					$location.path('teams');
				});
			}
		};

		// Update existing Team
		$scope.update = function() {
			var team = $scope.team;
			var id = team._id;
			team.$update(function () {
			    // $location.path('teams/' + team._id); <-- Doesn't work
				$location.path('teams/' + id);
			}, function(errorResponse) {
				$scope.error = errorResponse.title;
			});
		};

		// Find a list of Teams
		$scope.find = function() {
			$scope.teams = Teams.query();
		};

		// Find existing Team
		$scope.findOne = function() {
			$scope.team = Teams.get({ 
				teamId: $stateParams.teamId
			},
            function () {
                // get the name of the teamLead
                $scope.teamLead = Players.get({ playerId: $scope.team.teamLeadId });

                // get the names of the players
                if ($scope.team.playerIds.length !== 0) {
                    var playerIds = "";
                    $scope.team.playerIds.forEach(function (item, index) {
                        playerIds = playerIds.concat(item);
                        if (index !== $scope.team.playerIds.length - 1) {
                            playerIds = playerIds.concat(',');
                        }
                    });
                    $scope.team.players = Players.query({
                        "properties": "name",
                        "_id": playerIds
                    });
                }
                else 
                {
                    $scope.team.players = [];
                }

			});
		};

		$scope.togglePlayerMenu = function () {
		    $scope.showPlayerMenu = !$scope.showPlayerMenu;
		}
	}
]);