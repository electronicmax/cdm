
function PersonController($scope, $location, webbox, $routeParams){
	$scope.go = function(path) {
		console.log('go event ', path);
		safe_apply($scope, function() {	$location.path(path); });
	};
	_webbox_controller_login(webbox).then(function(user) {
		// logged in!
		var u = $scope.u = webbox.u;
		var box = webbox.store.get_or_create_box('cdm');
		var user;
		// fetch the relevant user
		box.fetch().then(function() {
			box.get_obj($routeParams.personId).then(function(fetched_user) {
				safe_apply($scope, function() {
					u.log('fetched user ', fetched_user.id);
					user = $scope.user = fetched_user;
				});
			});
		});		
		webbox.store.toolbar.setVisible(true);
		webbox.store.on('logout', function() {	safe_apply($scope, function() { $location.path('/login'); });	});
	}).fail(function() { safe_apply($scope, function() { $location.path('/login'); }); });		
}
