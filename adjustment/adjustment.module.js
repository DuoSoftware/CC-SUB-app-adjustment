////////////////////////////////
// App : Adjustment
// Owner  : Ishara Gunathilaka
// Last changed date : 2017/08/24
// Version : 6.1.0.5
// Modified By : Kasun
/////////////////////////////////


(function ()
{
    'use strict';

    angular
        .module('app.adjustment', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider, msNavigationServiceProvider, mesentitlementProvider)
    {
        function gst(name) {
            var nameEQ = name + "=";
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
            }
            //debugger;
            return null;
        }
        /** Check for Super admin */
        var isSuperAdmin = gst('isSuperAdmin');
        /** Check for Super admin - END */

        $stateProvider
            .state('app.adjustment', {
                url    : '/adjustment',
                views  : {
                    'adjustment@app': {
                        templateUrl: 'app/main/adjustment/adjustment.html',
                        controller : 'AdjustmentController as vm'
                    }
                },
				resolve: {
					security: ['$q','mesentitlement','$timeout','$rootScope','$state','$location', function($q,mesentitlement,$timeout,$rootScope,$state, $location){
						return $q(function(resolve, reject) {

							$timeout(function() {
								if ($rootScope.isBaseSet2 && $rootScope.isSuperAdmin != 'true') {
									resolve(function () {
										var entitledStatesReturn = mesentitlement.stateDepResolver('adjustment');

										mesentitlementProvider.setStateCheck("adjustment");

										if(entitledStatesReturn !== true){
											return $q.reject("unauthorized");
										}
									});
								} else {
									return $location.path('/guide');
								}
							});
						});
					}]
				},
                bodyClass: 'adjustment'
            });

            if(isSuperAdmin != 'true'){
                msNavigationServiceProvider.saveItem('adjustment', {
                    title    : 'adjustment',
                    state    : 'app.adjustment',
                    weight   : 5
                });  
            }
       
    }
})();
