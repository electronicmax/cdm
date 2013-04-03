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

function TestController($scope, $timeout, webbox) {
	var f = function() {
		$scope.time = (new Date()).toString();
		$timeout(f, 1000);
	};
	f();
}

