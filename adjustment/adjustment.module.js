////////////////////////////////
// App : Adjustment
// Owner  : Ishara Gunathilaka
// Last changed date : 2018/06/06
// Version : 6.1.0.8
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
								//if (true) {
								if ($rootScope.isBaseSet2) {
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

        msNavigationServiceProvider.saveItem('adjustment', {
            title    : 'adjustment',
            state    : 'app.adjustment',
            weight   : 5
        });
    }
})();
