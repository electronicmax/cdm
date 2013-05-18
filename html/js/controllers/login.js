
function LoginController($scope, $location, webbox) {
	console.log('logincontroller?');
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
	console.log('webbox loaded?');	
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
