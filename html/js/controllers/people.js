
function PeopleController($scope, $routeParams, $location, webbox) {
	// check to see if already logged in
	// new person stuff =================================================

	var cdm_box;
	var loading_d = new $.Deferred();
	var error = function(s) { console.error(s); };

	$scope.people = [];
	
	$scope.new_person_input_fields = [
		{ id: 'firstname', label: "given name", placeholder: "given name" , required : 'required'},
		{ id: 'middlename', label: "middle name", placeholder: "middle name"  },		
		{ id: 'lastname', label: "family name", placeholder: "family name", required : 'required' },
		{ id: 'displayname', label: "display name", placeholder: "display name" },
		{ id: 'nhs', label: "NHS #", placeholder: "#XXX-XXX-XXXX" },
		{ id: 'ni', label: "NI #", placeholder: "#XXXXXXXXX" },
		{ id: 'photo', label: "photo", placeholder: "http://..." }
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
	
	$scope.new_person_default_portraits = {
		Male: {
			adult:'imgs/people/male-adult.png',
			child:'imgs/people/male-child.png'
		},
		Female: {
			adult:'imgs/people/female-adult.png',
			child:'imgs/people/female-child.png'
		}
	};
	$scope.new_person_model = {};
	safe_apply($scope, function() { $scope.loading = 1; });	
	$scope.compute_age = function(bday) {
		var bday_long = new Date(bday).valueOf();
		if (bday_long && bday_long.valueOf() > 0) {
			var today = new Date().valueOf();
			var years = Math.floor((today - bday_long)/(1000*60*60*24*365.0));
			return years;
		}
		return '???';
	};	
	$scope.determine_portrait = function() {
		var new_person_model = $scope.new_person_model,
			age = $scope.compute_age(new_person_model.birthday),
			category = (age < 8) ? 'child' : 'adult',
			gender = new_person_model.gender && $scope.new_person_default_portraits[new_person_model.gender] ? new_person_model.gender : 'Female',
			photo = new_person_model.photo || $scope.new_person_default_portraits[gender][category];
		return photo;
	};
	$scope.create_cb = function() {
		// takes $scope.new_person_model and commits them to the
		create_new_person($scope.new_person_model);
		safe_apply($scope, function () { $scope.new_person_model = {}; });
	};
	var create_new_person = function(model) {
		var id = model.firstname + "_" + (model.middlename ? model.middlename : '') + "_" + model.lastname;
		cdm_box.get_obj(id).then(function(obj) {
			obj.set(_(model).chain().clone().extend({'type':'person'}).value());
			obj.save();
		}).fail(function(err) {
			error(err);
		});
	};
	var load_people_from_box = function(box) {
		// todo replace with query::
		if (box === undefined) { box = store.get_box('cdm');  }
		u.when(box.get_obj_ids().map(function(id)  { return box.get_obj(id); }))
			.then(function() {
				var objs = _.toArray(arguments).filter(function(x) {
					return x.get('type') && x.get('type').indexOf('person') >= 0;
				});
				safe_apply($scope, function() {	$scope.people = objs; });
			}).fail(function(err) {  error('error ', err);	});
	};	
	_webbox_controller_login(webbox).then(function(user) {
		// logged in!
		var u = $scope.u = webbox.u;

		safe_apply($scope,function() {
			$scope.username = user;
			$scope.loading = 0;
		});
		webbox.store.toolbar.setVisible(true);		
		webbox.store.on('logout', function() {	safe_apply($scope, function() { $location.path('/login'); });	});
		var box = webbox.store.get_or_create_box('cdm');
		load_people_from_box(box);
		box.on('obj-add', function() {
			console.log("OBJECT ADD --");
			load_people_from_box(box);
		});
		// fetch box
		box.fetch().then(function() {
			cdm_box = box; load_people_from_box(box); 
		}).fail(function() {
			box.save().then(function() {
				box.fetch().then(function() {
					cdm_box = box; load_people_from_box(box); 
				});
			});
		});
	}).fail(function() {
		webbox.u.log('not logged in redirecting ');
		safe_apply($scope, function() { $location.path('/login'); });
	});		
}

