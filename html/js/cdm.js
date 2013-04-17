/*global $,_,document,window,console,escape,Backbone,exports,WebSocket */
/*jslint vars:true todo:true sloppy:true */

// base cdm app -- including base routes

var app = angular
	.module('cdm', ['ui', 'webbox-widgets'])
	.config(function($routeProvider) {
		$routeProvider
			.when('/people', { templateUrl: 'partials/people.html', controller:'PeopleController'})
			.when('/people/:personId', { templateUrl: 'partials/person.html', controller:'PersonController'})
			.when('/people/:personId/add/property', { templateUrl: 'partials/add_property.html', controller:'AddProperty'})
			.when('/people/:personId/add/measurement', { templateUrl: 'partials/add_measurement.html', controller:'AddMeasurement'})
			.when('/people/:personId/:viewID', { templateUrl: 'partials/view.html', controller:'ViewController'})
			.when('/test', { templateUrl: 'partials/test.html', controller:'TestController'})		
			.when('/login', { templateUrl: 'partials/login.html', controller:'LoginController'})
			.otherwise({redirectTo:'/people'});
	})
	.factory('webbox',function() {
		var exports = {};
		var d = exports.loaded = new $.Deferred();
		exports.safe_apply = function($scope, fn) {
			if ($scope.$$phase !== undefined) {
				return fn();
			}
			$scope.$apply(fn);
		};		
		WebBox.load().then(function() {
			exports.u = window.u = WebBox.utils;
			exports.WebBox = WebBox; // for logging in etc
			exports.store = window.store = new WebBox.Store();
			window.store.fetch().then(function() {
				d.resolve(exports);
			}).fail(function() {
				// TODO
				u.error('Error fetching boxes');
			});
		});
		return exports;
	});


