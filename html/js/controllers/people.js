/*global $,_,document,window,console,escape,Backbone,exports,WebSocket */
/*jslint vars:true, todo:true, sloppy:true */

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
	$scope.has_portrait = function() {
		return $('.portrait-form input[type=file]')[0].files.length > 0;
	};
	$scope.send_portrait = function() {
		var files = $('.portrait-form input[type=file]')[0].files;
		if (files.length === 0) { var d = u.deferred(); d.resolve(); return d; }
		var model = $scope.new_person_model, id = "portrait-" + model.firstname + "_" + (model.middlename || '') + "_" + model.lastname;
		contenttype = $('.portrait-form input[type=file]')[0].files[0].type;
		return cdm_box.put_file(id, files[0], contenttype);
    };
	$scope.clear_portrait_form = function() { $('.portrait-form')[0].reset(); };	
	$scope.create_cb = function() {
		// takes $scope.new_person_model and commits them to the
		create_new_person($scope.new_person_model);
		safe_apply($scope, function () { $scope.new_person_model = {}; });
	};
	var create_new_person = function(model) {
		var id = model.firstname + "_" + (model.middlename || '') + "_" + model.lastname;
		cdm_box.get_obj(id).then(function(obj) {
			$scope.send_portrait().then(function(portrait_file) {
				console.log('got file back >> ', portrait_file);
				obj.set(_(model).chain().clone().extend(
					{
						type:'person',
						portrait: portrait_file 
					}
				).value());
				obj.save().then(function() {u.debug("save complete! ");	}).fail(function(err) {	u.error(err);});
				$scope.clear_portrait_form();
			});
			safe_apply($scope, function() { $scope.people.push(obj); });
		}).fail(function(err) {	error(err);	});
	};
	var load_people_from_box = function(box) {
		// todo replace with query::
		if (box === undefined) { box = store.get_box('cdm');  }
		u.when(box.get_obj_ids().map(function(id)  { return box.get_obj(id); }))
			.then(function(objs) {
				objs = objs.filter(function(x) {
					return x.get('type') && x.get('type').indexOf('person') >= 0;
				});
				safe_apply($scope, function() {
					console.log("SETTING PEOPLE TO BE ", objs.length, objs);
					$scope.people = objs;
				});
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
	
	$('.portrait-form :file').change(function() {
		var file = this.files[0];
		console.log('got >> ', file.name, file.size, file.type);
	});

}

