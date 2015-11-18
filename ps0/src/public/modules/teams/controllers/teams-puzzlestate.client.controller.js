'use strict';

// Puzzlestate controller for Teams
angular.module('teams').controller('PuzzleStateController', ['$scope', '$rootScope', '$stateParams', '$location', '$http', 'Authentication', 'Teams', 'Puzzles',
	function($scope, $rootScope, $stateParams, $location, $http, Authentication, Teams, Puzzles) {
		$scope.authentication = Authentication;
        $rootScope.objectClass = 'teamElementSignature';

	    /*** Start puzzleState support ***/
        $scope.initPuzzleState = function () {
            $scope.puzzleStates = [];
            $scope.teamId = $stateParams.teamId;
            $scope.puzzleId = $stateParams.puzzleId;

            $scope.puzzle = Puzzles.get({
                puzzleId: $stateParams.puzzleId
            });
            $scope.team = Teams.get({
                teamId: $stateParams.teamId
            },
            function () {
                // Find the active eventId - 
                $http.get('/events?active=true').success(function (responseEvent) {
                    // If successful we find the only active event
                    // TODO: Make sure there is only one active event present
                    $scope.activeEventId = null;
                    if (responseEvent.length !== 1) {
                        $scope.error = "ERROR: Zero or more than one active events found";
                    }
                    else {
                        $scope.activeEventId = responseEvent[0]._id;
                        $http.get('/events/' + $scope.activeEventId + '/teams/' + $scope.teamId + '/puzzleStates').success(function (response) {
                            $scope.puzzleStates = response;
                            $scope.puzzleState = {
                                solved: false,
                            };
                            response.forEach(function (item, index) {
                                if (item.puzzleId === $stateParams.puzzleId) {
                                    $scope.puzzleState = item;
                                }
                            });
                        }).error(function (response) {
                            $scope.error = "ERROR: " + response.title;
                        });

                    }
                }).error(function (responseEvent) {
                    $scope.error = "ERROR: " + responseEvent.title;
                });

            });
        };

		// Update puzzleState
        $scope.updatePuzzleState = function () {
			var time = new Date().toJSON().slice(0,16);
            //var puzzleState = {
            //    "solved" :$scope.puzzleState.solved,
            //    "attemptedSolution" + $scope.puzzleState.attemptedSolution + " " + time);
			$scope.puzzleState.clientTimeStamp = time;
			$scope.puzzleState.bonus = parseInt($scope.puzzleState.bonus);
			$http.put('events/' + $scope.activeEventId + '/teams/' + $scope.team._id + '/puzzleStates/' + $scope.puzzleId, $scope.puzzleState).success(function (response) {
			    $location.path('teams/' + $scope.teamId);
			}).error(function (response) {
			    $location.path('teams/' + $scope.teamId);
			    $scope.error = "ERROR: " + response.message;
			});
		};

	}
]);