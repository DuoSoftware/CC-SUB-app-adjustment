(function ()
{
    'use strict';

    angular
        .module('app.adjustment')
        .controller('AddAdjustmentController', AddAdjustmentController);

    /** @ngInject */
    function AddAdjustmentController($scope,$mdDialog, selectedMail,$charge,notifications,$state)
//    {
//        var vm = this;
//
//
//        vm.hiddenCC = true;
//        vm.hiddenBCC = true;
//
//
//
//      $scope.adjTypes = 	[
//        {aType:"Credit",aId:"1"},
//        {aType:"Debit",aId:"2"}
//      ]
//
//
//
//// adjustment load skip and take
//      $scope.take = 100;
//      $scope.skip = 0;
//
//      $scope.currentDate = moment(new Date().toISOString()).format('LL');
//
//      $scope.isloadDone = false;
//
//      var s = 0,t = 100; // customer load skip and take
//      $scope.rows=[];
//
//      $scope.customers = [];
//      //var pdz = [];
//      $scope.getCustomer = function() {
//        ////console.log($scope.customers.length);
//        $charge.profile().all(s, t, "asc").success(function (data) {
//          debugger;
//          //console.log(data);
//          for (var i = 0; i < data.length; i++) {
//            // debugger;
//
//            var profileId = data[i]["profileId"];
//            var pro_name = "";
//            if(data[i]["profile_type"] == "Business")
//            {
//              pro_name = data[i]["business_name"]; // data[i]["business_contact_name"]+" "+
//
//            }else{
//              pro_name = data[i]["first_name"]+" "+data[i]["last_name"];
//            }
//
//            $scope.customers.push({customerId: profileId, customerName: pro_name});
//
//          }
//
//          s += t;
//          $scope.getCustomer();
//
//
//
//        }).error(function (data) {
//          console.log(data);
//
//          var customer = {};
//          customer.customerlst = angular.copy($scope.customers);
//
//          $scope.rows.push(customer);
//
//
//          $scope.isloadDone = true;
//
//        })
//      }
//
//      $scope.getCustomer();
//      debugger;
//
//
//      var self = this;
//      self.selectedItem  = null;
//      self.searchText    = [];
//
//
//      //debugger;
//      $scope.querySearch =function(query) {
//        debugger;
//        //Custom Filter
//        var results=[];
//        var len = $scope.rows[0].customerlst.length
//        for (var i = 0; i<len; ++i){
//
//          if($scope.rows[0].customerlst[i].
//              customerName.toLowerCase().startsWith(query.toLowerCase()))
//          {
//            results.push($scope.rows[0].customerlst[i]);
//          }
//        }
//        //debugger;
//        return results;
//      }
//
//      $scope.loadInvoices = function(){
//        $scope.invoices=[];
//        $charge.invoice().getByAccountID($scope.rows.customer.customerId).success(function(data) {
//
//          debugger;
//          //console.log(data);
//          for(var i=0;i<data.length;i++)
//          {
//            $scope.invoices.push({invoiceid : data[i]["invoiceNo"],invoiceno: "Inv"+data[i]["invoiceNo"] });
//            // break;
//          }
//
//          // $scope.isLoading = false;
//        }).error(function(data) {
//          console.log(data);
//        })
//      }
//
//
//
//
//      $scope.content = [];
//      $scope.content.invoiceid = "0";
//      $scope.content.note = "";
//      $scope.rows.customer = [];
//
//
//      $scope.submit = function() {
//        if ($scope.adjustmentAdd.$valid == true) {
//
//          debugger;
//          // main table details and promo product details
//          $scope.content = {
//            "adjustmenttype": $scope.content.adjustmenttype,
//            "amount": $scope.content.amount,
//            "customerid": $scope.rows.customer.customerId,
//            "note": $scope.content.note,
//            "invoiceid":$scope.content.invoiceid,
//            "rate":rate,
//            "currency":$scope.content.preferredCurrency
//          }
//
//          // Header deatil saves here.
//          $charge.adjustment().store($scope.content).success(function (data) {
//            debugger;
//            //alert(data.error);
//            if (data.error == "00000") {
//              //debugger;
//              notifications.toast("Record Saved, Adjustment Added","success");
//              //location.href = "#/main";
//              $mdDialog.hide();
//              $state.go($state.current, {}, {reload: true});
//            }
//          }).error(function (data) {
//            console.log(data);
//            notifications.toast("Error adding record, "+data['error'], "error");
//          })
//
//        }else{
//
//          notifications.toast('Please fill all details ',"error");
//        }
//      }
//
//
//      $scope.backToMain = function(ev)
//      {
//
//        location.href = "#/main";
//      }
//
//      $scope.clearForm = function(ev)
//      {
//        debugger;
//        $scope.content =[];
//        $scope.rows.customer= [];
//        //$state.go($state.current, {}, {reload: true});
//      }
//
//
//
//      $scope.prefferedCurrencies=[];
//      $charge.commondata().getDuobaseFieldDetailsByTableNameAndFieldName("CTS_GeneralAttributes","FrequentCurrencies").success(function(dataa) {
//        $scope.isSpinnerShown=true;
//
//        debugger;
//        var temparr = dataa[0]['RecordFieldData'].trimLeft().split(" ");
//        for (var i = 0; i < temparr.length; i++) {
//          $scope.prefferedCurrencies.push(temparr[i]);
//        }
//        $scope.isSpinnerShown=false;
//      }).error(function(data) {
//        console.log(data);
//        $scope.isSpinnerShown=false;
//      })
//
//      $charge.commondata().getDuobaseFieldDetailsByTableNameAndFieldName("CTS_GeneralAttributes","BaseCurrency").success(function(data) {
//
//        $scope.isSpinnerShown=true;
//        $scope.baseCurrency=data[0]['RecordFieldData'];
//        $scope.prefferedCurrencies.push($scope.baseCurrency);
//        $scope.content.preferredCurrency=$scope.baseCurrency;
//        $scope.isSpinnerShown=false;
//      }).error(function(data) {
//        console.log(data);
//        $scope.isSpinnerShown=false;
//      })
//
//
//      var rate=1;
//
//      $scope.exchangeRate = rate;
//      $scope.adjustAmount = 0;
//
//      $scope.changeAmount = function(ev){
//        $scope.adjustAmount = $scope.content.amount * rate;
//      }
//
//
//      $scope.calcRate = function (ev) {
//        $scope.isSpinnerShown=true;
//        //if($scope.content.preferredCurrency!=$scope.baseCurrency) {
//
//        var param=$scope.baseCurrency+'_'+$scope.content.preferredCurrency;
//        $charge.currency().calcCurrency(param).success(function (data) {
//
//          debugger;
//          var results=data.results;
//          var result = results[param];
//          rate = parseFloat(result.val);
//          $scope.exchangeRate = rate;
//          $scope.isSpinnerShown = false;
//          if ($scope.content.amount.length != 0) {
//            $scope.adjustAmount = $scope.content.amount * rate;
//          }
//        }).error(function (data) {
//          rate = 1;
//          $scope.isSpinnerShown = false;
//        })
//        //}
//        //else
//        //{
//        //    $scope.content.amount = content.amount / rate;
//        //    $scope.isSpinnerShown = false;
//        //}
//      }
//
//        // If replying
//        if ( angular.isDefined(selectedMail) )
//        {
//            vm.form.to = selectedMail.from.email;
//            vm.form.subject = 'RE: ' + selectedMail.subject;
//            vm.form.message = '<blockquote>' + selectedMail.message + '</blockquote>';
//        }
//
//        // Methods
//        vm.closeDialog = closeDialog;
//
//        //////////
//
//        function closeDialog()
//        {
//            $mdDialog.hide();
//        }
//    }
  {}
})();
