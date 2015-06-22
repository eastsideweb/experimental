'use strict';

//Setting up route
angular.module('instructors').config(['$stateProvider',
	function($stateProvider) {
		// Instructors state routing
		$stateProvider.
		state('listInstructors', {
			url: '/instructors',
			templateUrl: 'modules/instructors/views/list-instructors.client.view.html'
		}).
		state('createInstructor', {
			url: '/instructors/create',
			templateUrl: 'modules/instructors/views/create-instructor.client.view.html'
		}).
		state('viewInstructor', {
			url: '/instructors/:instructorId',
			templateUrl: 'modules/instructors/views/view-instructor.client.view.html'
		}).
		state('editInstructor', {
			url: '/instructors/:instructorId/edit',
			templateUrl: 'modules/instructors/views/edit-instructor.client.view.html'
		});
	}
]);