/* global $,_,document,window,console,escape,Backbone,exports,WebSocket */
/*jslint vars:true, todo:true, sloppy:true */

// base people controller is the high level overview

var safe_apply = function($scope, fn) {
	if ($scope.$$phase) { return fn(); }
	$scope.$apply(fn);
};

function _webbox_controller_login(webbox) {
	var d = new $.Deferred();
	webbox.loaded.then(function(webbox) {
		webbox.store.checkLogin().then(
			function(response) {
				console.debug('response >> ', response);				
				if (response.is_authenticated) {
					return d.resolve(response.user);
				}
				d.reject();  
			});			
	});
	return d;
}
function PeopleController($scope, $routeParams, $location, webbox) {
	// check to see if already logged in

	$scope.new_person_input_fields = [
		{ id: 'firstname', label: "given name", placeholder: "given name" },
		{ id: 'middlename', label: "middle name", placeholder: "middle name" },		
		{ id: 'lastname', label: "family name", placeholder: "family name" },
		{ id: 'displayname', label: "display name", placeholder: "display name" },
		{ id: 'nhs', label: "NHS #", placeholder: "#XXX-XXX-XXXX" },
		{ id: 'ni', label: "NI #", placeholder: "#XXXXXXXXX" }
	];

	$scope.intervention_modules = [
		{ id: 'cdm', name: 'Child development' },
		{ id: 'pdb', name: 'Prediabetes' },
		{ id: 'mtcbt1', name: 'Mental Health CBT 1' },
		{ id: 'mtcbt2', name: 'Mental Health CBT 2' },		
		{ id: 'dt1', name: 'Diabetes Type 1' },
		{ id: 'dt2', name: 'Diabetes Type 2' },		
		{ id: 'gf', name: 'General Fitness' },
		{ id: 'icd', name: 'Implantable Cardiac Device (ICD)' }		
	];
	
	$scope.new_person_model = {};
	
	safe_apply($scope, function() { $scope.loading = 1; });	
	_webbox_controller_login(webbox).then(function(user) {
		// logged in!
		var u = $scope.u = webbox.u;
		store.toolbar.setVisible(true);		
		safe_apply($scope,function() {
			$scope.username = user;
			$scope.loading = 0;
		});
		webbox.store.on('logout', function() {
			safe_apply($scope, function() { $location.path('/login'); });
		});
	}).fail(function() {
		webbox.u.log('not logged in redirecting ');
		safe_apply($scope, function() { $location.path('/login'); });
	});
}

function LoginController($scope, $location, webbox) {
	var store;
	safe_apply($scope, function() { $scope.loading = 1; });	
	$scope.login = function(username,password) {
		if (store !== undefined) {
			store.login(username,password).then(function() {
				safe_apply($scope, function() { $location.path('/people'); });				
			}).fail(function(e) {
				safe_apply($scope, function() {
					// var msg = 'Sorry, could not ' + e.statusText;
					var msg = "Incorrect username or password - <br>Please try again.";
					u.log('setting error to be ', e.statusText);
					$scope.error = msg;
				});				
			});
			return;
		}
		throw new RuntimeError('webbox not initialising properly');
	};
	webbox.loaded.then(function(webbox) {
		console.log('webbox loaded then ');
		var u = $scope.u = webbox.u;
		window.webbox = webbox;
		store = window.store = webbox.store;		
		store.toolbar.setVisible(false);
		safe_apply($scope, function() { $scope.loading = 0; });
		store.logout();
		console.log('logout ');
	});	
}

function TestController($scope, $timeout, webbox) {
	var f = function() {
		$scope.time = (new Date()).toString();
		$timeout(f, 1000);
	};
	f();
}