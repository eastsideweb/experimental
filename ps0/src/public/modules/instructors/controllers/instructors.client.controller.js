'use strict';

// Instructors controller
angular.module('instructors').controller('InstructorsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Instructors',
	function($scope, $stateParams, $location, Authentication, Instructors) {
		$scope.authentication = Authentication;

		// Create new Instructor
		$scope.create = function() {
			// Create new Instructor object
			var instructor = new Instructors ({
			    name: this.name,
			    description: this.description,
                active: this.active
			});

			// Redirect after save
			instructor.$save(function(response) {
				$location.path('instructors/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
			    $scope.error = "ERROR: " + errorResponse.data.message;
			});
		};

		// Remove existing Instructor
		$scope.remove = function(instructor) {
			if ( instructor ) { 
				instructor.$remove();

				for (var i in $scope.instructors) {
					if ($scope.instructors [i] === instructor) {
						$scope.instructors.splice(i, 1);
					}
				}
			} else {
				$scope.instructor.$remove(function() {
					$location.path('instructors');
				});
			}
		};

		// Update existing Instructor
		$scope.update = function() {
			var instructor = $scope.instructor;
			var id = instructor._id;
			instructor.$update(function () {
			    // $location.path('instructors/' + instructor._id); <-- Doesn't work
				$location.path('instructors/' + id);
			}, function(errorResponse) {
			    $scope.error = "ERROR: " + errorResponse.title;
			});
		};

		// Find a list of Instructors
		$scope.find = function() {
			$scope.instructors = Instructors.query();
		};

		// Find existing Instructor
		$scope.findOne = function() {
			$scope.instructor = Instructors.get({ 
				instructorId: $stateParams.instructorId
			});
		};
	}
]);