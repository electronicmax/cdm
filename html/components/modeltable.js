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
				  var split = $attrs.parsechar || ',';
				  var boxname = $attrs.box, box;
				  var resolve_fields = ['name', 'label', 'first_name'];

				  if (boxname) {
					  box = webbox.store.get_box(boxname);
					  box.fetch().then(function() {
						  $scope.loaded = true;
						  update_ui_model();
					  }).fail(function(err) {
						  $scope.error = err;
					  });
				  }
				  
				  console.log("U is ", u, ' - boxname : ', boxname);
				  
				  var _serialise = function(v) {
					  if (v instanceof WebBox.Obj || v instanceof WebBox.File) {
						  return v.name || v.id;
					  }
					  return v.toString();
				  };
				  var modeltoview = function(m) {
					  // makes a ui model
					  if (m === undefined) { return {}; }				  
					  return u.dict(_(m).map(function(vs,k) {
						  return [k, vs.map(serialise).filter(u.defined).join(parsechar)];
					  }));
				  };
				  var parse = function(v) {
					  // this tries to figure out what the user meant, including resolving
					  // references to entities
					  var d = u.deferred();
					  if (!_.isNaN( parseFloat(v) )) { d.resolve(parseFloat(v)); }
					  if (!_.isNaN( parseInt(v, 10) )) { d.resolve(parseInt(v, 10)); }
					  if (box) {
						  if ( box.get_obj_ids().indexOf(v) >= 0 ) {
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
						  u.when(v.split(parsechar).map(parse)).then(function() {
							  obj[k] = _.toArray(arguments);
							  d.resolve();
						  });
						  return d.promise();
					  })).then(function() {  pdfd.resolve(obj); }).fail(pdfd.reject);
					  return pdfd.promise();
				  };
				  var update_ui_model = function() {  $scope.ui_model = modeltoview($scope.model);	 };				  
				  $scope.$watch('model', update_ui_model);
				  $scope.commit_model = function() {
					  if ($scope.model !== undefined) {
						  parseview($scope.ui_model).then(function(vals) {
							  u.debug('yay --------------- ', vals);
							  $scope.model.set(vals);
							  $scope.model.save();
						  });
					  }
				  };
			  });
		  }
	  };
  });
