'use strict';

// Configuring the Articles module
angular.module('instructors').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Instructors', 'instructors', 'dropdown', '/instructors(/create)?');
		Menus.addSubMenuItem('topbar', 'instructors', 'List Instructors', 'instructors');
		Menus.addSubMenuItem('topbar', 'instructors', 'New Instructor', 'instructors/create');
	}
]);