/*global $,_,document,window,console,escape,Backbone,exports,WebSocket */
/*jslint vars:true todo:true sloppy:true */

// base cdm app -- including base routes

var app = angular
	.module('cdm', ['ui'])
	.config(function($routeProvider) {
		$routeProvider
			.when('/people', { templateUrl: 'partials/people.html', controller:'PeopleController'})
			.when('/people/:personId', { templateUrl: 'partials/person.html', controller:'PersonController'})
			.when('/people/:personId/add/property', { templateUrl: 'partials/add_property.html', controller:'AddProperty'})
			.when('/people/:personId/add/measurement', { templateUrl: 'partials/add_measurement.html', controller:'AddMeasurement'})
			.when('/people/:personId/:viewID', { templateUrl: 'partials/view.html', controller:'ViewController'})
			.when('/login', { templateUrl: 'partials/login.html', controller:'LoginController'})
			.otherwise({redirectTo:'/people'});
	})
	.factory('webbox',function() {
		var exports = {};
		var d = exports.loaded = new $.Deferred();
		WebBox.load().then(function() {
			exports.u = window.u = WebBox.utils;
			exports.store = window.store = new WebBox.Store();
			d.resolve(exports);
		});
		return exports;
	});


