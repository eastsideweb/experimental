'use strict';

// Events controller
angular.module('events').controller('EventsController', ['$scope', '$stateParams', '$location', '$http', 'Authentication', 'Events','Players', 'Puzzles','Instructors','Teams',
	function ($scope, $stateParams, $location, $http, Authentication, Events, Players, Puzzles, Instructors, Teams) {
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
				$scope.error = "ERROR: " + errorResponse.data.message;
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
			    $scope.error = "ERROR: " + errorResponse.title;
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

	    /**** Start  sublist support ***/
        $scope.initSublist = function () {

            $scope.event = Events.get({
                eventId: $stateParams.eventId
            },
            function () {
                $scope.sublist = {};
                $scope.sublist.subtype = $stateParams.subtype;
                switch ($stateParams.subtype) {
                    case 'players':
                        $scope.sublist.service = Players;
                        $scope.sublist.currentItemList = $scope.event.playerIds;
                        break;
                    case 'puzzles':
                        $scope.sublist.service = Puzzles;
                        $scope.sublist.currentItemList = $scope.event.puzzleIds;
                        break;
                    case 'instructors':
                        $scope.sublist.service = Instructors;
                        $scope.sublist.currentItemList = $scope.event.instructorIds;
                        break;
                    case 'teams':
                        $scope.sublist.service = Teams;
                        $scope.sublist.currentItemList = $scope.event.teamIds;
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
            $scope.allActiveItemList.forEach(function (item, index) {
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

            addRemoveItemsToEvent($scope.event._id, $scope.sublist.subtype, addedItems, removedItems);
        }

        var addRemoveItemsToEvent = function (eventId, itemType, listAddedItems, listRemovedItems) {
            if (listRemovedItems.length !== 0) {
                // Send a delete request 
                $http.delete('events/' + eventId + '/' + itemType,
                    {
                        data: listRemovedItems,
                        headers: { 'Content-Type': 'application/json' }
                    }).success(function (response) {
                        // Now send add request if there are any items to be added
                        if (listAddedItems.length !== 0) {
                            $http.put('events/' + eventId + '/' + $scope.sublist.subtype, listAddedItems).success(function (response) {
                                $location.path('events/' + eventId);
                            }).error(function (response) {
                                $scope.error = "ERROR: " + response.message;
                            });
                        }
                        else {
                            $location.path('events/' + eventId);
                        }
                    }).error(function (response) {
                        $scope.error = "ERROR: " + response.message;
                    });
            }
            else if (listAddedItems.length !== 0) {
                $http.put('events/' + eventId + '/' + $scope.sublist.subtype, listAddedItems).success(function (response) {
                    $location.path('events/' + eventId);
                }).error(function (response) {
                    $scope.error = "ERROR: " + response.message;
                });
            }
            else {
                //There was no change in the items - navigate back
                $location.path('events/' + eventId);
            }
        }
	    /**** End  sublist support ***/
	}
]);