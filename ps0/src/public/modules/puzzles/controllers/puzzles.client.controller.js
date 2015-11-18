'use strict';

// Puzzles controller
angular.module('puzzles').controller('PuzzlesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Puzzles',
	function($scope, $stateParams, $location, Authentication, Puzzles) {
		$scope.authentication = Authentication;

		// Create new Puzzle
		$scope.create = function() {
			// Create new Puzzle object
			var puzzle = new Puzzles ({
			    name: this.name,
			    description: this.description,
                active: this.active
			});

			// Redirect after save
			puzzle.$save(function(response) {
				$location.path('puzzles/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
			    $scope.error = "ERROR: " + errorResponse.data.message;
			});
		};

		// Remove existing Puzzle
		$scope.remove = function(puzzle) {
			if ( puzzle ) { 
				puzzle.$remove();

				for (var i in $scope.puzzles) {
					if ($scope.puzzles [i] === puzzle) {
						$scope.puzzles.splice(i, 1);
					}
				}
			} else {
				$scope.puzzle.$remove(function() {
					$location.path('puzzles');
				});
			}
		};

		// Update existing Puzzle
		$scope.update = function() {
			var puzzle = $scope.puzzle;
			var id = puzzle._id;
			puzzle.$update(function () {
			    // $location.path('puzzles/' + puzzle._id); <-- Doesn't work
				$location.path('puzzles/' + id);
			}, function(errorResponse) {
			    $scope.error = "ERROR: " + errorResponse.title;
			});
		};

		// Find a list of Puzzles
		$scope.find = function() {
			$scope.puzzles = Puzzles.query();
		};

		// Find existing Puzzle
		$scope.findOne = function() {
			$scope.puzzle = Puzzles.get({ 
				puzzleId: $stateParams.puzzleId
			});
		};
	}
]);