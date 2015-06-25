'use strict';

//Puzzles service used to communicate Puzzles REST endpoints
angular.module('puzzles').factory('Puzzles', ['$resource',
	function($resource) {
		return $resource('puzzles/:puzzleId', { puzzleId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);