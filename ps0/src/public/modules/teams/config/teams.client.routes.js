'use strict';

//Setting up route
angular.module('teams').config(['$stateProvider',
	function($stateProvider) {
		// Teams state routing
	    $stateProvider.
		state('listTeams', {
		    url: '/teams',
		    templateUrl: 'modules/teams/views/list-teams.client.view.html'
		}).
		state('createTeam', {
		    url: '/teams/create',
		    templateUrl: 'modules/teams/views/create-team.client.view.html'
		}).
	    state('leaderboard', {
	        url: '/teams/leaderboard',
	        templateUrl: 'modules/teams/views/leaderboard.client.view.html',
	        controller: 'LeaderboardController',
	        onExit: function () {
	            if (window.leadeboardTimeout) {
	                clearInterval(window.leadeboardTimeout);
	                window.leadeboardTimeout = null; 
                }
	        }
	    }).
		state('viewTeam', {
		    url: '/teams/:teamId',
		    templateUrl: 'modules/teams/views/view-team.client.view.html'
		}).
		state('editTeam', {
		    url: '/teams/:teamId/edit',
		    templateUrl: 'modules/teams/views/edit-team.client.view.html',
		    controller: 'TeamsController'
		}).state('editTeamSublist', {
		    url: '/teams/:teamId/:subtype/edit',
		    templateUrl: 'modules/teams/views/edit-team-sublist.client.view.html',
		    controller: 'TeamsController'
		}).state('editPuzzleState', {
		    url: '/teams/:teamId/puzzle/:puzzleId/edit',
		    templateUrl: 'modules/teams/views/edit-team-puzzlestate.client.view.html',
		    controller: 'PuzzleStateController'
		});
	}
]);