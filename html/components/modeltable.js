/*global $,_,document,window,console,escape,Backbone,exports,WebSocket */
/*jslint vars:true todo:true sloppy:true */

app.directive('modeltable', function() {
	  return {
		  restrict: 'E',
		  scope:{ model:"=m" }, // these means the attribute 'm' has the name of the scope variable to use
		  templateUrl:'components/modeltable.html',
		  controller:function($scope, $attrs, webbox) {
			  webbox.loaded.then(function() {
				  var u = webbox.u; // backbone model
				  var parsechar = $attrs.parsechar || ',';
				  var boxname = $attrs.box, box;
				  var resolve_fields = ['name', 'label', 'first_name'];

				  
				  var modeltoview = function(m) {
					  // makes a ui model
					  if (m === undefined) { return {}; }				  
					  return u.dict(_(m.attributes).map(function(vs,k) {
						  if (['@id'].indexOf(k) >= 0) { return; }
						  return [k, { value: vs.map(_serialise).filter(u.defined).join(parsechar) } ];
					  }).filter(u.defined));
				  };				  
				  var update_uimodel = function() {
					  webbox.safe_apply($scope,	function() {
						  $scope.uimodel = modeltoview($scope.model);
					  });
				  };
				  if (boxname) {
					  box = webbox.store.get_or_create_box(boxname);
					  box.fetch().then(function() {
						  $scope.loaded = true;
						  update_uimodel();
						  $scope.$watch('model', update_uimodel);
					  }).fail(function(err) { $scope.error = err; });
				  }				  
				  // model -> view
				  var _serialise = function(v) {
					  if (v instanceof WebBox.Obj || v instanceof WebBox.File) {  return v.name || v.id;	  }
					  return v.toString();
				  };
				  // view -> model
				  var parse = function(v) {
					  // this tries to figure out what the user meant, including resolving
					  // references to entities
					  var d = u.deferred();
					  if (!_.isNaN( parseFloat(v) )) { d.resolve(parseFloat(v)); }
					  if (!_.isNaN( parseInt(v, 10) )) { d.resolve(parseInt(v, 10)); }
					  if (box) {
						  if ( box.get_obj_ids().indexOf(v) >= 0 ) {
							  console.log('getting object ', v);
							  box.get_obj(v).then(d.resolve).fail(d.reject);
						  } else {
							  // todo: get by names too
							  var matches = box._objcache().filter(function(obj) {
								  var fields = resolve_fields.map(function(f) { return obj.get(f); }).filter(u.defined).filter(function(x) { return x.length > 0; });
								  return fields.indexOf(v) >= 0; 
							  });
							  if (matches.length > 0) {  d.resolve(matches[0]); } else {
								  d.resolve(v);
							  }
						  }
					  }
					  return d.promise();
				  };
				  var parseview = function(viewobj) {
					  // we need to take the textual representations out again
					  var obj = {}, pdfd = u.deferred();
					  u.when(_(viewobj).map(function(v,k) {
						  var d = u.deferred();
						  u.when(v.value.split(parsechar).map(parse)).then(function() {
							  obj[k] = _.toArray(arguments);
							  d.resolve();
						  });
						  return d.promise();
					  })).then(function() { pdfd.resolve(obj); }).fail(pdfd.reject);
					  return pdfd.promise();
				  };
				  $scope.new_row = function() {
					  console.log('new _ row ');
					  var idx = _($scope.uimodel).keys().length + 1;
					  var new_key = 'property '+idx;
					  $scope.uimodel[new_key] = { value: '' };
				  };
				  $scope.commit_model = function() {
					  if ($scope.model !== undefined) {
						  parseview($scope.uimodel).then(function(vals) {
							  $scope.model.set(vals);
							  $scope.model.save();
						  });
					  }
				  };
				  // $scope.$watch('uimodel', commit_model, true);
			  });
		  }
	  };
  });
