////////////////////////////////
// App : Adjustment 
// Owner  : Ishara Gunathilaka
// Last changed date : 2017/07/06
// Version : 6.1.0.1
// Modified By : Ishara
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
        mesentitlementProvider.setStateCheck("adjustment");

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
                   security: ['$q','mesentitlement', function($q,mesentitlement){
                        var entitledStatesReturn = mesentitlement.stateDepResolver('adjustment');

                        if(entitledStatesReturn !== true){
                              return $q.reject("unauthorized");
                        };
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
