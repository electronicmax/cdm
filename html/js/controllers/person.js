
function PersonController($scope, $location, webbox, $routeParams){
	var box;
	$scope.go = function(path) {
		console.log('go event ', path);
		safe_apply($scope, function() {	$location.path(path); });
	};
	var startup = function() {
		window.user = $scope.user;
		var update_prev = function(file, img) {
			if (typeof FileReader !== "undefined" && (/image/i).test(file.type)) {
				var reader = new FileReader();
				reader.onload = (function (theImg) {
					return function (evt) {	img.src = evt.target.result;	};
				}(img));
				reader.readAsDataURL(file);
			} else {
				console.log(" no filereader ");
			}
		};
		var put_image = function(file) {
			var d = webbox.u.deferred();
			window.ff = file;
			var id = file.name;
			box.put_file(id, file).then(function(model) {
				console.log('doe putting ', id);
				var portraits = $scope.user.get('portraits') || [];
				portraits.push(model);
				safe_apply($scope, function() {
					$scope.user.set('portraits', portraits);
					$scope.user.save().then(d.resolve).fail(d.reject);					
				});				
			});
			return d.promise();
		};
		$("input").on('change', function() {
			var form = $(this).parent('form');
			console.log('changed --- ', $(this));
			if (this.files[0] && this.files[0].type) {
				update_prev(this.files[0], $(this).parent().find('.preview')[0]);
				put_image(this.files[0]).then(function() {
					if (form && form[0]) { form[0].reset(); }
				});
			}
		});			
	};
	_webbox_controller_login(webbox).then(function(user) {
		// logged in!
		var u = $scope.u = webbox.u;
		box = webbox.store.get_or_create_box('cdm');		
		// fetch the relevant user
		box.fetch().then(function() {
			box.get_obj($routeParams.personId).then(function(fetched_user) {
				safe_apply($scope, function() {
					u.log('fetched user ', fetched_user.id);
					user = $scope.user = fetched_user;
					startup();
				});
			});
		});		
		webbox.store.toolbar.setVisible(true);
		webbox.store.on('logout', function() {	safe_apply($scope, function() { $location.path('/login'); });	});
	}).fail(function() { safe_apply($scope, function() { $location.path('/login'); }); });		
}
