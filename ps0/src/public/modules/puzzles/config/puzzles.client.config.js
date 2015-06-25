'use strict';

// Configuring the Articles module
angular.module('puzzles').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Puzzles', 'puzzles', 'dropdown', '/puzzles(/create)?');
		Menus.addSubMenuItem('topbar', 'puzzles', 'List Puzzles', 'puzzles');
		Menus.addSubMenuItem('topbar', 'puzzles', 'New Puzzle', 'puzzles/create');
	}
]);