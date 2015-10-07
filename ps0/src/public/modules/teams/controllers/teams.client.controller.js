'use strict';

// Teams controller
angular.module('teams').controller('TeamsController', ['$scope', '$stateParams', '$location', '$http', 'Authentication', 'Teams', 'Players', 'Puzzles',
	function($scope, $stateParams, $location, $http, Authentication, Teams, Players, Puzzles) {
		$scope.authentication = Authentication;
        $scope.showPlayerMenu = false;
        $scope.showPuzzleMenu = false;

	    // Following was added to make sure that the elements corresponding to the players currently in the team are checked.
	    // This doesnt work because the event is fired when the DOM is ready but not when the ng-repeat is executed and the elements
	    // added to the DOM. $scope.team is still just a promise
	    //$scope.$on('$viewContentLoaded', function () {
	    //    if ($scope.team.playerIds.length !== 0) {
	    //        $scope.team.playerIds.forEach(function (item, index) {
	    //            var temp = document.getElementById(item);
	    //            temp.checked = true;
	    //        });
	    //    }
	    //});

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
                    $scope.players = Players.query({
                        "properties": "name",
                        "_id": playerIds
                    });
                }
                else 
                {
                    $scope.players = [];
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
                    $scope.puzzles = Puzzles.query({
                        "properties": "name",
                        "_id": puzzleIds
                    });
                }
                else {
                    $scope.puzzles = [];
                }
			});
		};

	    /**** Start  sublist support ***/
		$scope.initSublist = function () {

		    $scope.team = Teams.get({
		        teamId: $stateParams.teamId
		    },
            function () {
                $scope.sublist = {};
                $scope.sublist.subtype = $stateParams.subtype;
                switch ($stateParams.subtype) {
                    case 'players':
                        $scope.sublist.service = Players;
                        $scope.sublist.currentItemList = $scope.team.playerIds;
                        break;
                    case 'puzzles':
                        $scope.sublist.service = Puzzles;
                        $scope.sublist.currentItemList = $scope.team.puzzleIds;
                        break;
                }
                $scope.allActiveItemList = $scope.sublist.service.query({
                    "properties": "name",
                    "active": true,
                }, function () {
                    if ($scope.sublist.currentItemList.length !== 0) {
                        //Adding a timeout to let the page render. Ideally should use viewContentLoaded event
                        setTimeout(function () {
                            $scope.sublist.currentItemList.forEach(function (item, index) {
                                var temp = document.getElementById(item);
                                temp.checked = true;
                            });
                        }, 150);
                    }
                });
            });
		}

		$scope.updateSublist = function () {
		    var addedItems = [], removedItems = [];
		    $scope.allActiveItemList.forEach(function(item, index) {
		        var elem = document.getElementById(item._id);
		        if ($scope.sublist.currentItemList.indexOf(item._id) !== -1) {
		            // item was part of the current item Ids
		            if (!elem.checked) {
		                // item should be removed
		                removedItems.push(item._id);
		            }
		        }
		        else if (elem.checked) {
		            // item needs to be added
		            addedItems.push(item._id);
		        }
		    });

		    addRemoveItemsToTeam($scope.team._id, $scope.sublist.subtype, addedItems, removedItems);
		}

		var addRemoveItemsToTeam = function (teamId, itemType, listAddedItems, listRemovedItems) {
		    if (listRemovedItems.length !== 0) {
		        // Send a delete request 
		        $http.delete('teams/' + teamId + '/' + itemType,
                    {
                        data: listRemovedItems,
                        headers: { 'Content-Type': 'application/json' }
                    }).success(function (response) {
		            // Now send add request if there are any items to be added
		            if (listAddedItems.length !== 0) {
		                $http.put('teams/' + teamId + '/' + $scope.sublist.subtype, listAddedItems).success(function (response) {
		                    $location.path('teams/' + teamId);
		                }).error(function (response) {
		                    $scope.error = response.message;
		                });
		            }
		            else {
		                $location.path('teams/' + teamId);
		            }
		        }).error(function (response) {
		            $scope.error = response.message;
		        });
		    }
		    else if (listAddedItems.length !== 0) {
		        $http.put('teams/' + teamId + '/' + $scope.sublist.subtype, listAddedItems).success(function (response) {
		            $location.path('teams/' + teamId);
		        }).error(function (response) {
		            $scope.error = response.message;
		        });
		    }
		    else {
                //There was no change in the items - navigate back
		        $location.path('teams/' + teamId);
		    }
		}
	    /**** End  sublist support ***/

	    /**** Start Leaderboard support ***/
		$scope.initLeaderboard = function () {
		    $scope.teams = Teams.query(function () {
		        $scope.teamScores = [];
		        $http.get('/events?active=true').success(function (responseEvent) {
		            // If successful we find the only active event
		            $scope.activeEventId = null;
		            if (responseEvent.length !== 1) {
		                $scope.error = "Zero or more than one active events found. Using the first event";
		            }
		            $scope.activeEventId = responseEvent[0]._id;
		            $scope.teamIds = responseEvent[0].teamIds;
                    // Save the setInterval return value, so we can clear the interval when moving away from this state
		            window.leadeboardTimeout = setInterval($scope.updateLeaderboard, 5000);
		            $scope.updateLeaderboard();
		        }).error(function (response) {
		            $scope.error = response.title;
		        });
		    });
            
		}

		$scope.updateLeaderboard = function () {
		    $scope.teamStates = [];
		    var teamCount = $scope.teamIds.length;
		    $scope.teams.forEach(function (item, index) {
		        if ($scope.teamIds.indexOf(item._id) !== -1) {
                    //The team is part of the event, get the puzzlestates
		            $http.get('/event/' + $scope.activeEventId + "/team/" + item._id + "/puzzleStates").success(function (response) {
		                $scope.teamStates.push({ "_id": item._id, "name": item.name, "puzzleStates": response });
		                if ($scope.teamStates.length === teamCount) {
		                    $scope.teamScores = computeScores($scope.teamStates);
		                }
		            }).error(function (response) {
		                $scope.teamStates.push({ "_id": item._id, "name": item.name, "puzzleStates": [] });
		                $scope.error = JSON.stringify(response);
		            });
		        }
		    });

		}

		var computeScores = function (pzStates) {
		    var teamScores = [], retVal;
		    pzStates.forEach(function (item, index) {
		        var score = 0;
		        if (Array.isArray(item.puzzleStates)) {
		            item.puzzleStates.forEach(function (pz) {
		                if (pz.solved === true) {
		                    score++;
		                }
		            });
		        }
		        teamScores.push({ "_id": item._id, "name": item.name, "score": score });
		    });
		    retVal = teamScores.sort(function (item1, item2) {
		        return item2.score - item1.score;
		    });
		    return retVal;
		}

	    /**** End Leaderboard support ***/
	}
]);
