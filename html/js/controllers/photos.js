
function PhotosController($scope, $location, webbox, $routeParams){

	var create_carousel = function() {

		// debug 
		window.user = $scope.user;

        /**
         * requestAnimationFrame and cancel polyfill
         */
        (function() {
            var lastTime = 0;
            var vendors = ['ms', 'moz', 'webkit', 'o'];
            for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
                window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
                window.cancelAnimationFrame =
                        window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
            }

            if (!window.requestAnimationFrame)
                window.requestAnimationFrame = function(callback, element) {
                    var currTime = new Date().getTime();
                    var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                    var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                            timeToCall);
                    lastTime = currTime + timeToCall;
                    return id;
                };

            if (!window.cancelAnimationFrame)
                window.cancelAnimationFrame = function(id) {
                    clearTimeout(id);
                };
        }());


        /**
        * super simple carousel
        * animation between panes happens with css transitions
        */
        function Carousel(element, main_container)
        {
            var self = this;
            element = $(element);
            main_container = $(main_container);

            var container = $(">ul", element);
            var panes = $(">ul>li", element);

            var pane_width = 0;
            var pane_count = panes.length;
            console.debug("pane_count", pane_count);

            var current_pane = 0;



            /**
             * initial
             */
            this.init = function() {
                setPaneDimensions();

                $(window).on("load resize orientationchange", function() {
                    setPaneDimensions();
                    //updateOffset();
                })
            };


            /**
             * set the pane dimensions and scale the container
             */
            function setPaneDimensions() {
                pane_width = element.width();
                panes.each(function() {
                    $(this).width(pane_width);
                });
                container.width(pane_width*pane_count);
            };


            /**
             * show pane by index
             * @param   {Number}    index
             */
            this.showPane = function( index ) {
                // between the bounds
                index = Math.max(0, Math.min(index, pane_count-1));
                current_pane = index;

                var offset = -((100/pane_count)*current_pane);
                setContainerOffset(offset, true);
            };

            this.showLast = function(){
                this.showPane(this.pane_count-1)
            }

            function setContainerOffset(percent, animate) {
                container.removeClass("animate");

                if(animate) {
                    container.addClass("animate");
                }

                if(Modernizr.csstransforms3d) {
                    container.css("transform", "translate3d("+ percent +"%,0,0) scale3d(1,1,1)");
                }
                else if(Modernizr.csstransforms) {
                    container.css("transform", "translate("+ percent +"%,0)");
                }
                else {
                    var px = ((pane_width*pane_count) / 100) * percent;
                    container.css("left", px+"px");
                }
            }

            this.next = function() { return this.showPane(current_pane+1, true); };
            this.prev = function() { return this.showPane(current_pane-1, true); };



            function handleHammer(ev) {
                console.log(ev);
                // disable browser scrolling
                ev.gesture.preventDefault();

                switch(ev.type) {
                    case 'dragright':
                    case 'dragleft':
                        // stick to the finger
                        var pane_offset = -(100/pane_count)*current_pane;
                        var drag_offset = ((100/pane_width)*ev.gesture.deltaX) / pane_count;

                        // slow down at the first and last pane
                        if((current_pane == 0 && ev.gesture.direction == Hammer.DIRECTION_RIGHT) ||
                            (current_pane == pane_count-1 && ev.gesture.direction == Hammer.DIRECTION_LEFT)) {
                            drag_offset *= .4;
                        }

                        setContainerOffset(drag_offset + pane_offset);
                        break;

                    case 'swipeleft':
                        self.next();
                        ev.gesture.stopDetect();
                        break;

                    case 'swiperight':
                        self.prev();
                        ev.gesture.stopDetect();
                        break;

                    case 'release':
                        // more then 50% moved, navigate
                        if(Math.abs(ev.gesture.deltaX) > pane_width/2) {
                            if(ev.gesture.direction == 'right') {
                                self.prev();
                            } else {
                                self.next();
                            }
                        }
                        else {
                            self.showPane(current_pane, true);
                        }
                        break;
                }
            }

            element.hammer({ drag_lock_to_axis: true })
                .on("release dragleft dragright swipeleft swiperight", handleHammer);


            
            var next_button = main_container.children(".carousel-right");
            var prev_button = main_container.children(".carousel-left");
  
            console.debug("next_button", next_button); 
            console.debug("prev_button", prev_button); 
            next_button.click(function(evt){
                console.debug("next click");
                self.next();
            });
            prev_button.click(function(evt){
                console.debug("prev click");
                self.prev();
            });
			$(document).on('keydown', function(evt) {
				if (main_container.is(":visible")) {
					if (evt.keyCode == 37) { self.prev(); }
					if (evt.keyCode == 39) { self.next(); }
					if (evt.keyCode == 27) {
						// escape to close
						$scope.$apply(function() {
							$location.path($location.path().split('/').slice(0,-2).join('/'));
						});
					}					
				}
			});

        }


        function update_carousel($scope, jump_to_last){
			safe_apply($scope, function() {
				console.log("I GOT A CHANGE ON USER -- ");
				var carousel = new Carousel("#carousel", "#main-carousel");
				carousel.init();

                if (!("jumped_to_photo" in $scope) && "photoIndex" in $routeParams){
                    // if there's a url parameter to jump to, and we've never done it, then jump now
                    console.debug("JUMP NOW");

                    carousel.showPane($routeParams.photoIndex);
                    $scope['jumped_to_photo'] = true;
                } else if (jump_to_last){
                    carousel.showLast();
                }
			});
        }

        $scope.$watch('user.attributes.portrait', function(){
            // this gets called immediately on load, once the data is in
            update_carousel($scope, false);
        });

		$scope.user.on('change:portrait', function() {
            // when portraits are updated in the box, update the carousel
            update_carousel($scope, true);
        });

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
					create_carousel();
				});
			});
		});		
		webbox.store.toolbar.setVisible(true);
		webbox.store.on('logout', function() {	safe_apply($scope, function() { $location.path('/login'); });	});
	}).fail(function() { safe_apply($scope, function() { $location.path('/login'); }); });		
	
	
}
