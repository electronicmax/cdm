
function PersonController($scope, $location, webbox, $routeParams){
	var box;
	$scope.range = function(l,h) {
		var a = [];
		if (_.isUndefined(h)) { h = l; l = 0; }
		for (var i = l; i < h; i++) { a.push(i); }
		return a;
	};
	$scope.go = function(path) {
		console.log('go event ', path);
		safe_apply($scope, function() {	$location.path(path); });
	};
	$scope.delete_from = function(obj, property, value) {
		var vs = obj.get(property);
		if (vs.indexOf(value) >= 0) {
			vs.splice(vs.indexOf(value), 1);
		}
		console.log('apres splice ', vs.length);		
		obj.set(property, vs); // _(obj.get(property)).without(value)
		obj.save();
	};
	// under construction -------------
	$scope.commit_measurement = function(measurement) {
		console.log('need to commit measurement ', measurement);
	};
	var make_measurements = function(scope) {
		safe_apply(scope,function() {
			scope.measures = [
				{name:'weight'},
				{name:'temperature'},
				{name:'height'}
			];
		});
	};
	// --------------------------------------

	var startup = function() {
		window.user = $scope.user;
		make_measurements($scope);
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
				var portraits = $scope.user.get('portrait') || [];
				portraits.push(model);
				safe_apply($scope, function() {
					$scope.user.set('portrait', portraits);
					$scope.user.save().then(d.resolve).fail(d.reject);					
				});				
			});
			return d.promise();
		};
		$("input").on('change', function() {
			var form = $(this).parent('form');
			console.log('changed --- ', $(this));
			if (this.files[0] && this.files[0].type) {
				// preview 
				// update_prev(this.files[0], $(this).parent().find('.preview')[0]);
				put_image(this.files[0]).then(function() {
					if (form && form[0]) { form[0].reset(); }
				});
			}
		});

		$scope.user.on('change:portrait', function() {
			safe_apply($scope, function() { console.log("no op!"); });					
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
					$scope.box = box;
					user = $scope.user = fetched_user;
					startup();
				});
			});
		});		
		webbox.store.toolbar.setVisible(true);
		webbox.store.on('logout', function() {	safe_apply($scope, function() { $location.path('/login'); });	});
	}).fail(function() { safe_apply($scope, function() { $location.path('/login'); }); });		
}
