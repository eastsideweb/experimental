'use strict';

// Teams controller
angular.module('teams').controller('LeaderboardController', ['$scope', '$stateParams', '$location', '$http', 'Authentication', 'Teams', 'Events',
	function($scope, $stateParams, $location, $http, Authentication, Teams, Events) {
		$scope.authentication = Authentication;

	    /**** Start Leaderboard support ***/
		$scope.initLeaderboard = function () {
		    $scope.teamScores = [];
		    $scope.updateLeaderboard();
		    window.leadeboardTimeout = setInterval($scope.updateLeaderboard, 3000);
		}

		$scope.updateLeaderboard = function () {
		    $scope.teamStates = [];
		    $scope.teams = Teams.query(function () {
		        $http.get('/events?active=true').success(function (responseEvent) {
		            if (responseEvent.length === 0) {
		                $scope.error = "Zero active events found.";
		                $scope.teamScores = [];
		            }
		            else {
		                if (responseEvent.length > 1) {
		                    $scope.error = "Zero or more than one active events found. Using the first event";
		                }
		                $scope.activeEvent = responseEvent[0];
		                var teamCount = $scope.activeEvent.teamIds.length;
		                $scope.teams.forEach(function (item, index) {
		                    if ($scope.activeEvent.teamIds.indexOf(item._id) !== -1) {
		                        //The team is part of the event, get the puzzlestates
		                        $http.get('/events/' + $scope.activeEvent._id + "/teams/" + item._id + "/puzzleStates").success(function (response) {
		                            $scope.teamStates.push({ "_id": item._id, "name": item.name, "puzzleStates": response });
		                            if ($scope.teamStates.length === teamCount) {
		                                $scope.teamScores = computeScores($scope.teamStates);
		                            }
		                        }).error(function (response) {
		                            $scope.teamStates.push({ "_id": item._id, "name": item.name, "puzzleStates": [] });
		                            $scope.error = "Error: " + JSON.stringify(response);
		                        });
		                    }
		                });
		            }
		        }).error(function (response) {
		            $scope.error = "Error: " + JSON.stringify(response);
		        });
		    }, function (errorResponse) {
		        $scope.error = "Error: " + errorResponse.statusText + " ( " + errorResponse.status + " )";
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