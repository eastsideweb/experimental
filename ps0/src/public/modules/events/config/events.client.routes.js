'use strict';

//Setting up route
angular.module('events').config(['$stateProvider',
	function($stateProvider) {
		// Events state routing
		$stateProvider.
		state('listEvents', {
			url: '/events',
			templateUrl: 'modules/events/views/list-events.client.view.html'
		}).
		state('createEvent', {
			url: '/events/create',
			templateUrl: 'modules/events/views/create-event.client.view.html'
		}).
	    state('analytics', {
	        url: '/events/analytics',
	        templateUrl: 'modules/events/views/analytics.client.view.html',
	        controller: 'AnalyticsController',
	        onExit: function () {
	            if (window.analyticsTimeout) {
	                clearInterval(window.analyticsTimeout);
	                window.analyticsTimeout = null;
	            }
	        }
	    }).
		state('viewEvent', {
			url: '/events/:eventId',
			templateUrl: 'modules/events/views/view-event.client.view.html'
		}).
		state('editEvent', {
			url: '/events/:eventId/edit',
			templateUrl: 'modules/events/views/edit-event.client.view.html'
		}).state('editEventSublist', {
		    url: '/events/:eventId/:subtype/edit',
		    templateUrl: 'modules/events/views/edit-event-sublist.client.view.html',
		    controller: 'EventsController'
		});
	}
]);