'use strict';

//Setting up route
angular.module('puzzles').config(['$stateProvider',
	function($stateProvider) {
		// Puzzles state routing
		$stateProvider.
		state('listPuzzles', {
			url: '/puzzles',
			templateUrl: 'modules/puzzles/views/list-puzzles.client.view.html'
		}).
		state('createPuzzle', {
			url: '/puzzles/create',
			templateUrl: 'modules/puzzles/views/create-puzzle.client.view.html'
		}).
		state('viewPuzzle', {
			url: '/puzzles/:puzzleId',
			templateUrl: 'modules/puzzles/views/view-puzzle.client.view.html'
		}).
		state('editPuzzle', {
			url: '/puzzles/:puzzleId/edit',
			templateUrl: 'modules/puzzles/views/edit-puzzle.client.view.html'
		});
	}
]);