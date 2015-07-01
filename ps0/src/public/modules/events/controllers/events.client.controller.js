'use strict';

// Events controller
angular.module('events').controller('EventsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Events','Players', 'Puzzles','Instructors','Teams',
	function($scope, $stateParams, $location, Authentication, Events, Players, Puzzles, Instructors, Teams) {
		$scope.authentication = Authentication;

		// Create new Event
		$scope.create = function() {
			// Create new Event object
			var event = new Events ({
			    name: this.name,
			    description: this.description,
                active: this.active,
                status: this.status,
                playerIds: this.playerIds,
                puzzleIds: this.puzzleIds,
                instructorIds: this.instructorIds,
                teamIds: this.teamIds
			});

			// Redirect after save
			event.$save(function(response) {
				$location.path('events/' + response._id);

				// Clear form fields
                $scope.name = '';
                $scope.description = '';
                $scope.playerIds = [];
                $scope.puzzleIds = [];
                $scope.teamIds = [];
                $scope.instructorIds = [];
                       
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Event
		$scope.remove = function(event) {
			if ( event ) { 
				event.$remove();

				for (var i in $scope.events) {
					if ($scope.events [i] === event) {
						$scope.events.splice(i, 1);
					}
				}
			} else {
				$scope.event.$remove(function() {
					$location.path('events');
				});
			}
		};

		// Update existing Event
		$scope.update = function() {
			var event = $scope.event;
			var id = event._id;
			event.$update(function () {
			    // $location.path('events/' + event._id); <-- Doesn't work
				$location.path('events/' + id);
			}, function(errorResponse) {
				$scope.error = errorResponse.title;
			});
		};

		// Find a list of Events
		$scope.find = function() {
			$scope.events = Events.query();
		};

		// Find existing Event
        $scope.findOne = function () {
            $scope.event = Events.get({
                eventId: $stateParams.eventId
            },
            function () {
                // get the names of the players
                if ($scope.event.playerIds.length !== 0) {
                   var playerIds = concatIds($scope.event.playerIds);
                    $scope.players = Players.query({
                        "properties": "name",
                        "_id": playerIds
                    });
                }
                else {
                    $scope.players = [];
                }
                // get the names of the puzzles
                if ($scope.event.puzzleIds.length !== 0) {
                    var puzzleIds = concatIds($scope.event.puzzleIds);
                    $scope.puzzles = Puzzles.query({
                        "properties": "name",
                        "_id": puzzleIds
                    });
                }
                else {
                    $scope.puzzles = [];
                }
                // get the names of the teams
                if ($scope.event.teamIds.length !== 0) {
                    var teamIds = concatIds($scope.event.teamIds);
                    $scope.teams = Teams.query({
                        "properties": "name",
                        "_id": teamIds
                    });
                }
                else {
                    $scope.teams = [];
                }
                // get the names of the instructors
                if ($scope.event.instructorIds.length !== 0) {
                    var instructorIds = concatIds($scope.event.instructorIds);
                    $scope.instructors = Instructors.query({
                        "properties": "name",
                        "_id": instructorIds
                    });
                }
                else {
                    $scope.instructors = [];
                }
            });
        };
        $scope.togglePlayerMenu = function () {
            $scope.showPlayerMenu = !$scope.showPlayerMenu;
        };
        $scope.togglePuzzleMenu = function () {
            $scope.showPuzzleMenu = !$scope.showPuzzleMenu;
        };
        $scope.toggleTeamMenu = function () {
            $scope.showTeamMenu = !$scope.showTeamMenu;
        };
        $scope.toggleInstructorMenu = function () {
            $scope.showInstructorMenu = !$scope.showInstructorMenu;
        };
        function concatIds(objectIds){
            var tempIds = "";
            objectIds.forEach(function (item, index) {
                tempIds = tempIds.concat(item);
                if (index !== objectIds.length - 1) {
                    tempIds = tempIds.concat(',');
                }
            });
            return tempIds;
        }
	}
]);