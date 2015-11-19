'use strict';

// Teams controller
angular.module('teams').controller('AnalyticsController', ['$scope', '$stateParams', '$location', '$http', 'Authentication', 'Teams', 'Events','Puzzles',
	function($scope, $stateParams, $location, $http, Authentication, Teams, Events, Puzzles) {
		$scope.authentication = Authentication;

	    /**** start Analytics support ***/

	    /************ Assumptions: Once the analytics page is up, the active event and the set of teams and puzzles assigned to the active event don't change *******/

		$scope.initAnalytics = function () {
		    var teamIds = "";
		    var puzzleIds = "";
		    var nameSort = function(pz1,pz2){
		        return  (pz1.name < pz2.name ? -1 : (pz1.name === pz2.name ? 0 : 1));
		    }

		    // Find the active event information
		    $http.get('/events?active=true').success(function (responseEvent) {
		        // Start success function for get('event')
		        if (responseEvent.length === 0) {
		            $scope.error = "ERROR: Zero active events found.";
		            $scope.teamScores = [];
		        }
		        else {
		            if (responseEvent.length > 1) {
		                $scope.error = "ERROR: Zero or more than one active events found. Using the first event";
		            }
		            $scope.activeEvent = responseEvent[0];
		            // get the names of the teams
		            $scope.teamCount = $scope.activeEvent.teamIds.length;
		            $scope.puzzleCount = $scope.activeEvent.puzzleIds.length;

		            if ($scope.teamCount !== 0 && $scope.puzzleCount !== 0) {
		                teamIds = "";
		                $scope.activeEvent.teamIds.forEach(function (item, index) {
		                    teamIds = teamIds.concat(item);
		                    if (index !== $scope.activeEvent.teamIds.length - 1) {
		                        teamIds = teamIds.concat(',');
		                    }
		                });
		                $scope.teams = Teams.query({
		                    "properties": "name",
		                    "_id": teamIds
		                }, function (response) {
		                    // Start Success function for Teams.query 
		                    // get the names of the puzzles
		                    puzzleIds = "";
		                    $scope.activeEvent.puzzleIds.forEach(function (item, index) {
		                        puzzleIds = puzzleIds.concat(item);
		                        if (index !== $scope.activeEvent.puzzleIds.length - 1) {
		                            puzzleIds = puzzleIds.concat(',');
		                        }
		                    });
		                    $scope.puzzles = Puzzles.query({
		                        "properties": "name",
		                        "_id": puzzleIds
		                    }, function (puzzleResponse) {
		                        // Start success function puzzles.query
		                        // Sort both the Id arrays
		                        $scope.puzzles.sort(nameSort);
		                        $scope.teams.sort(nameSort);

		                        $scope.analytics = initEmptyAnalytics($scope.puzzles, $scope.teams);
		                        $scope.updateAnalytics();
		                        window.analyticsTimeout = setInterval($scope.updateAnalytics, 3000);
		                        // End success function Puzzles.query
		                    });
		                    // End success function Teams.query
		                });
		            }// if(teamCount != 0 && puzzleCount)
		        }
		        // End success function for get('event')
		    });
		} // initAnalytics()

		var initEmptyAnalytics = function (puzzles, teams) {
		    var emptyAnalytics = {};
		    emptyAnalytics.totalSolvedForPuzzles = {};
		    emptyAnalytics.totalSolvedForTeams = {};
		    emptyAnalytics.analyticsInfo = {};
		    // We have the puzzles and teams array. Create the analyticsInfo 2d array
		    puzzles.forEach(function (pzItem, pzIndex) {
		        emptyAnalytics.analyticsInfo[pzItem._id] = {};
		        emptyAnalytics.totalSolvedForPuzzles[pzItem._id] = 0;
		        teams.forEach(function (tmItem, tmIndex) {
		            emptyAnalytics.analyticsInfo[pzItem._id][tmItem._id] = { solved: false, bonus: 0 };
		        });
		    });
		    teams.forEach(function (tmItem, tmIndex) {
		        emptyAnalytics.totalSolvedForTeams[tmItem._id] = 0;
		    });
		    return emptyAnalytics;
		}
		$scope.updateAnalytics = function () {
		    delete $scope.teamStates;
		    $scope.teamStates = [];
		    $scope.teams.forEach(function (item, index) {
		        $http.get('/events/' + $scope.activeEvent._id + "/teams/" + item._id + "/puzzleStates").success(function (response) {
                    /// Start success function get puzzlestates
		            $scope.teamStates.push({ "_id": item._id, "name": item.name, "puzzleStates": response });
		            if ($scope.teamStates.length === $scope.teamCount) {
		                $scope.analytics = updateTotals($scope.teamStates);
		            }
		            /// End success function get puzzlestates
		        }).error(function (response) {
		            /// Start error function get puzzlestates
		            $scope.teamStates.push({ "_id": item._id, "name": item.name, "puzzleStates": [] });
		            $scope.error = "Error: " + JSON.stringify(response);
		            /// End error function get puzzlestates
		        });
		    });
		}

		$scope.getSolved = function (puzzle, rowItem) {
		    var solved = $scope.analytics.analyticsInfo[puzzle._id][rowItem];
		    return rowItem.solved;
		}
		var updateTotals = function (pzStates) {
		    var teamScores = [], retVal;

		    retVal = initEmptyAnalytics($scope.puzzles, $scope.teams);

		    pzStates.forEach(function (item, index) {
		        if (Array.isArray(item.puzzleStates)) {
		            item.puzzleStates.forEach(function (pz) {
		                if (pz.solved === true) {
		                    retVal.totalSolvedForTeams[item._id]++;
		                    retVal.totalSolvedForPuzzles[pz.puzzleId]++;
		                    retVal.analyticsInfo[pz.puzzleId][item._id].solved = pz.solved;
		                    retVal.analyticsInfo[pz.puzzleId][item._id].bonus = pz.bonus;
		                }
		            });
		        }
		    });
		    return retVal;
		}
	    /**** End Analytics support ***/
	}
]);