'use strict';

// Teams controller
angular.module('teams').controller('LeaderboardController', ['$scope', '$stateParams', '$location', '$http', 'Authentication', 'Teams', 'Events',
	function($scope, $stateParams, $location, $http, Authentication, Teams, Events) {
		$scope.authentication = Authentication;

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