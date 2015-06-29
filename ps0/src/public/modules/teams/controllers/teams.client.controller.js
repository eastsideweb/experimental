'use strict';

// Teams controller
angular.module('teams').controller('TeamsController', ['$scope', '$stateParams', '$location','Authentication', 'Teams', 'Players', 'Puzzles',
	function($scope, $stateParams, $location, Authentication, Teams, Players, Puzzles) {
		$scope.authentication = Authentication;
        $scope.showPlayerMenu = false;
        $scope.showPuzzleMenu = false;
		// Create new Team
		$scope.create = function() {
			// Create new Team object
			var team = new Teams ({
			    name: this.name,
			    description: this.description,
			    active: this.active,
                teamLeadId: this.teamLeadId,
                playerIds: this.playerIds,
                puzzleIds: this.puzzleIds
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
                $scope.puzzleIds = [];                                              

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
                // get the names of the puzzles
                if ($scope.team.puzzleIds.length !== 0) {
                    var puzzleIds = "";
                    $scope.team.puzzleIds.forEach(function (item, index) {
                        puzzleIds = puzzleIds.concat(item);
                        if (index !== $scope.team.puzzleIds.length - 1) {
                            puzzleIds = puzzleIds.concat(',');
                        }
                    });
                    $scope.team.puzzles = Puzzles.query({
                        "properties": "name",
                        "_id": puzzleIds
                    });
                }
                else {
                    $scope.team.puzzles = [];
                }
			});
		};

		$scope.togglePlayerMenu = function () {
		    $scope.showPlayerMenu = !$scope.showPlayerMenu;
        }
        $scope.togglePuzzleMenu = function () {
            $scope.showPuzzleMenu = !$scope.showPuzzleMenu;
        }
	}
]);