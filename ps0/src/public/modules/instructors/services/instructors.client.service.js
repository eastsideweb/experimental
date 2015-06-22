'use strict';

//Instructors service used to communicate Instructors REST endpoints
angular.module('instructors').factory('Instructors', ['$resource',
	function($resource) {
		return $resource('instructors/:instructorId', { instructorId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);