(function ()
{
    'use strict';

    angular
        .module('app.adjustment')
        .controller('AdjustmentController',  AdjustmentController);

    /** @ngInject */
    function AdjustmentController($http, $scope,$state, $document, $timeout, $mdDialog, $mdMedia, $mdSidenav, $charge,$filter,notifications, iso4217, transactionTemplateGenerator)
    {
        var vm = this;


        vm.appInnerState = "default";

        vm.checked = [];
        vm.colors = ['blue-bg', 'blue-grey-bg', 'orange-bg', 'pink-bg', 'purple-bg'];
        // vm.selectedAccount = 'creapond';
        vm.selectedAdjustment = {};
        vm.toggleSidenav = toggleSidenav;

        vm.responsiveReadPane = undefined;
        vm.activeAdjustmentPaneIndex = 0;
        vm.dynamicHeight = false;

        vm.scrollPos = 0;
        vm.scrollEl = angular.element('#content');

        vm.adjustments = [];
        //adjustment data getter !
        vm.selectedAdjustment = [];
        vm.selectedMailShowDetails = false;

        vm.adjustmentLocalList = [];
        vm.addButtonDisplayText = "CREATE NEW";

        // Methods
        vm.checkAll = checkAll;
        vm.closeReadPane = closeReadPane;
        vm.addAdjustmentDialog = toggleinnerView;
        vm.isChecked = isChecked;
        vm.selectAdjustment = selectAdjustment;
        vm.toggleStarred = toggleStarred;
        vm.toggleCheck = toggleCheck;
        $scope.showInpageReadpane = false;

        // Kasun_Wijeratne_2017_JUL
        $scope.isReadLoaded = true;
        $scope.isTemplateLoaded = false;
        var emailTemplateMarkup = "";
        vm.closeInfoPane = closeInfoPane;
        vm.adjustmentViewExtraction = adjustmentViewExtraction;
        vm.generateInvoices = generateInvoices;
        function closeInfoPane() {
            $scope.showInpageReadpane = false;
        }

        function adjustmentViewExtraction(callback) {
            //Company attributes
            emailTemplateMarkup = emailTemplateMarkup.replace(/%companyLogo%/, $scope.compinfo.companyLogo);
            emailTemplateMarkup = emailTemplateMarkup.replace(/%companyName%/, $scope.compinfo.companyName);
            emailTemplateMarkup = emailTemplateMarkup.replace(/%companyPhone%/, $scope.compinfo.companyPhone);
            emailTemplateMarkup = emailTemplateMarkup.replace(/%companyEmail%/, $scope.compinfo.companyEmail);
            emailTemplateMarkup = emailTemplateMarkup.replace(/%companyAddress%/, $scope.compinfo.companyAddress);

            //Customer attributes
            emailTemplateMarkup = emailTemplateMarkup.replace(/%personName%/, vm.selectedAdjustment.customer);
            emailTemplateMarkup = emailTemplateMarkup.replace(/%otherName%/, "");
            emailTemplateMarkup = emailTemplateMarkup.replace(/%bill_addr%/, $scope.customerAddress);
            emailTemplateMarkup = emailTemplateMarkup.replace(/%phone%/, $scope.customerPhone);
            emailTemplateMarkup = emailTemplateMarkup.replace(/%email_addr%/, $scope.customerEmail);

            //Adjustment info
            emailTemplateMarkup = emailTemplateMarkup.replace(/%invoiceNo%/, vm.selectedAdjustment.guadjustmentid);
            emailTemplateMarkup = emailTemplateMarkup.replace(/Due date/, 'Adjustment type');
            emailTemplateMarkup = emailTemplateMarkup.replace(/%dueDate%/, vm.selectedAdjustment.adjustmenttype);
            emailTemplateMarkup = emailTemplateMarkup.replace(/Billing period:/, "");
            emailTemplateMarkup = emailTemplateMarkup.replace(/%invoiceDate% -/, "");
            emailTemplateMarkup = emailTemplateMarkup.replace(/%dueDate%/, "");
            emailTemplateMarkup = emailTemplateMarkup.replace(/%invoiceDate%/, $filter('date')(new Date(vm.selectedAdjustment.createdDate), 'dd-mm-yyyy'));
            emailTemplateMarkup = emailTemplateMarkup.replace(/%listItems%/, generateInvoices());
            emailTemplateMarkup = emailTemplateMarkup.replace(/%subTotal%/, '-');
            emailTemplateMarkup = emailTemplateMarkup.replace(/%additionalcharge%/, '-');
            emailTemplateMarkup = emailTemplateMarkup.replace(/%discAmt%/, '-');
            emailTemplateMarkup = emailTemplateMarkup.replace(/%tax%/, '-');
            emailTemplateMarkup = emailTemplateMarkup.replace(/%discount%/, '-');
            emailTemplateMarkup = emailTemplateMarkup.replace(/TOTAL/, 'ADJUSTMENT AMOUNT');
            emailTemplateMarkup = emailTemplateMarkup.replace(/%invoiceAmount%/, iso4217.getCurrencyByCode(vm.selectedAdjustment.currency).symbol+vm.selectedAdjustment.amount);
            emailTemplateMarkup = emailTemplateMarkup.replace(/TOTAL/, 'ADJUSTMENT AMOUNT');


            callback(emailTemplateMarkup);
        }

        //Generate invoice list
        var invoicesMarkup = "";
        function generateInvoices() {
            var tempMarkup = '<div class="list-item" style="border-bottom: solid 1px #eee;padding: 10px;overflow: hidden;"><div style="float: left;color: #aaa;width: 20%">'
                +$scope.SelectedInvoice.invoiceno+
                ' </div> <div style="float: left;color: #aaa;width: 20%;text-align: right">'
                +iso4217.getCurrencyByCode(vm.selectedAdjustment.currency).symbol+$scope.SelectedInvoice.unitPrice+
                ' </div><div style="width: 2%;float: left;height: 10px;"></div> <div style="float: left;color: #aaa;width: 18%">'
                +$scope.SelectedInvoice.gty+
                ' </div>';

            if($scope.SelectedInvoice.invoiceType.toLowerCase() != 'manual'){
                var subMarkup1 = '<div style="float: left;color: #aaa;width: 20%">'+iso4217.getCurrencyByCode(vm.selectedAdjustment.currency).symbol+$scope.SelectedInvoice.discount+'</div>';
            }else{
                var subMarkup1 = '<div style="float: left;color: #aaa;width: 40%">'+iso4217.getCurrencyByCode(vm.selectedAdjustment.currency).symbol+$scope.SelectedInvoice.totalPrice+'</div>';
            }

            invoicesMarkup += tempMarkup + subMarkup1 + '</div>';

            return invoicesMarkup;
        }
        //Generate invoice list

        //Set email template
        $charge.settingsapp().getDuobaseFieldsByTableNameAndFieldName("CTS_EmailTemplates", "TemplateUrl").success(function (data) {
            if(data[0][0].RecordFieldData == null || data[0][0].RecordFieldData == ''){
                $scope.currentTemplateView='emailTemplate1';
            }else{
                $scope.currentTemplateView=data[0][0].RecordFieldData.split('/')[data[0][0].RecordFieldData.split('/').length-1].split('.')[0];
            }
            // $scope.emailTemplateMarkupURL = data[0][0].RecordFieldData;
        }).error(function (data) {
            $scope.currentTemplateView='emailTemplate1';
        });
        $scope.printDiv = function () {
            var printContent = document.getElementById('print-content');
            var popupWin = window.open('', '_blank', 'width=1000,height=700');
            popupWin.document.open();
            popupWin.document.write('<html><head><link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet" type="text/css"><link href="app/main/360/dialogs/compose/print-view.css" rel="stylesheet" type="text/css"></head><body style="margin: 30px;">' + printContent.innerHTML + '<script src="https://code.jquery.com/jquery-3.1.1.min.js"></script><script>$(document).ready(function (){window.print()});</script></body></html>');
            popupWin.document.close();
        };

        $scope.adminData=null;
        $scope.getAdminUser= function () {
            $charge.commondetails().getAdminInfo().success(function(data){
                $scope.adminData=data;
            }).error(function (data) {
            })
        }

        $scope.emailTemplateInit = function(ev,base64Conversion){
            vm.adjustmentForEmail = {
                person_name: vm.selectedAdjustment.customer,
                email_addr: $scope.customerEmail,
                guInvID: vm.selectedAdjustment.guadjustmentid,
                invoiceNo: vm.selectedAdjustment.invoiceid

            };
            $mdDialog.show({
                controller: 'AddInvoiceController',
                templateUrl: 'app/main/invoice/dialogs/compose/mailTemplate.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose:true,
                locals : {
                    selectedInvoice: vm.adjustmentForEmail,
                    base64Content:base64Conversion,
                    adminData:$scope.adminData
                }
            });
            //

        };

        $scope.emailInvoice= function (ev,divName) {
            var printContents = document.getElementById(divName).innerHTML;
            var base64Conversion=window.btoa(unescape(encodeURIComponent(printContents)));
            $scope.emailTemplateInit(ev,base64Conversion);
        };

        $scope.getAdminUser();
        // Kasun_Wijeratne_2017_JUL

        // $scope.searchMoreInit = false;

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

        function getDomainName() {
            var _st = gst("currentDomain");
            var __st = gst("domain");
            return (_st != null) ? _st : __st; //"248570d655d8419b91f6c3e0da331707 51de1ea9effedd696741d5911f77a64f";
        }

        function getDomainExtension() {
            var _st = gst("extension_mode");
            if(_st=="ssandbox"||_st=="sandbox"){
                _st="test";
            }
            return (_st != null) ? _st : "test"; //"248570d655d8419b91f6c3e0da331707 51de1ea9effedd696741d5911f77a64f";
        }


        $scope.invoiceSubTotal =0;
        $scope.invoiceAmount = 0;
        //////////

        $scope.searchByType = '0';
        // $scope.vm.adjustmentAdd = {};


        vm.hiddenCC = true;
        vm.hiddenBCC = true;

        $scope.adjTypes = 	[
            {aType:"Credit",aId:"1"},
            {aType:"Debit",aId:"2"}
        ]


        $scope.currentDate = moment(new Date().toISOString()).format('LL');

        $scope.isloadDone = false;



        $scope.content = [];

        $scope.prefferedCurrencies=[];
        $charge.settingsapp().getDuobaseFieldDetailsByTableNameAndFieldName("CTS_GeneralAttributes","FrequentCurrencies").success(function(dataa) {
            $scope.isSpinnerShown=true;


            var temparr = dataa[0]['RecordFieldData'].trimLeft().split(" ");
            for (var i = 0; i < temparr.length; i++) {
                $scope.prefferedCurrencies.push(temparr[i]);
            }
            $scope.isSpinnerShown=false;
        }).error(function(data) {
            //console.log(data);
            $scope.isSpinnerShown=false;
        })

        $charge.settingsapp().getDuobaseFieldDetailsByTableNameAndFieldName("CTS_GeneralAttributes","BaseCurrency").success(function(data) {

            $scope.isSpinnerShown=true;
            $scope.baseCurrency=data[0]['RecordFieldData'];
            $scope.prefferedCurrencies.push($scope.baseCurrency);
            $scope.content.preferredCurrency=$scope.baseCurrency;
            $scope.isSpinnerShown=false;
        }).error(function(data) {
            //console.log(data);
            $scope.isSpinnerShown=false;
        })

        $charge.settingsapp().getDuobaseFieldDetailsByTableNameAndFieldName("CTS_GeneralAttributes","DecimalPointLength").success(function(data) {
            $scope.decimalPoint=parseInt(data[0].RecordFieldData);
            //
            //
        }).error(function(data) {
            //console.log(data);
        });

        $charge.settingsapp().getDuobaseValuesByTableName("CTS_FooterAttributes").success(function(data) {
            $scope.FooterData=data;
            $scope.content.greeting=data[0].RecordFieldData;
            $scope.content.disclaimer=data[1].RecordFieldData!=""?atob(data[1].RecordFieldData):"";
        }).error(function(data) {
        });


        $scope.prefixInvoice = "INV";
        $charge.settingsapp().getDuobaseFieldDetailsByTableNameAndFieldName("CTS_InvoiceAttributes","InvoicePrefix").success(function(data) {
            var invoicePrefix=data[0];
            $scope.prefixInvoice=invoicePrefix!=""?invoicePrefix.RecordFieldData:"INV";
            //
        }).error(function(data) {
            //console.log(data);
        });

        $scope.lenPrefix = "4";
        $charge.settingsapp().getDuobaseFieldDetailsByTableNameAndFieldName("CTS_InvoiceAttributes","PrefixLength").success(function(data) {
            var prefixLength=data[0];
            $scope.lenPrefix=prefixLength!=0? parseInt(prefixLength.RecordFieldData):0;
        }).error(function(data) {
            //console.log(data);
        });


        // Load initial customers
        $scope.initialCustomers = [];

        $scope.loadInitialCustomers = function(){

            var dbName="";
            dbName=getDomainName().split('.')[0]+"_"+getDomainExtension();
            //filter="api-version=2016-09-01&?search=*&$orderby=createdDate desc&$skip="+skip+"&$top="+take+"&$filter=(domain eq '"+dbName+"')";
            var data={
                "search": "*",
                "filter": "(domain eq '"+dbName+"')",
                "orderby" : "createddate desc",
                "top":10,
                "skip":0
            }


            $charge.azuresearch().getAllProfilesPost(data).success(function (data) {
                for (var i = 0; i < data.value.length; i++) {
                    if(data.value[i].status==0)
                    {
                        data.value[i].status=false;
                    }
                    else
                    {
                        data.value[i].status=true;
                    }
                    data.value[i].createddate = new Date(data.value[i].createddate);
                    //tempList.push(data.value[i]);
                }
                //vm.profiles = tempList;
                //skipProfileSearch += takeProfileSearch;
                //$scope.loadPaging(keyword, skipProfileSearch, takeProfileSearch);
                for (var i = 0; i < data.value.length; i++) {

                    var profileId = data.value[i]["profileId"];
                    var pro_name = "";
                    if (data.value[i]["profile_type"] == "Business") {
                        pro_name = data.value[i]["business_name"]; // data[i]["business_contact_name"]+" "+

                    } else {
                        pro_name = data.value[i]["first_name"] + " " + data.value[i]["last_name"];
                    }

                    $scope.isCustSearchDisable = false;
                    $scope.initialCustomers.push({customerId: profileId, customerName: pro_name});

                }

            }).error(function (data) {
                //vm.profiles = [];
                $scope.isCustSearchDisable = false;

                $scope.initialCustomers = [];
            });

            //$charge.profile().filterStatus(1,0,10,'desc').success(function (data) {
            //  //console.log(data);
            //  for (var i = 0; i < data.length; i++) {
            //
            //    var profileId = data[i]["profileId"];
            //    var pro_name = "";
            //    if (data[i]["profile_type"] == "Business") {
            //      pro_name = data[i]["business_name"]; // data[i]["business_contact_name"]+" "+
            //
            //    } else {
            //      pro_name = data[i]["first_name"] + " " + data[i]["last_name"];
            //    }
            //
            //    $scope.isCustSearchDisable = false;
            //    $scope.initialCustomers.push({customerId: profileId, customerName: pro_name});
            //
            //  }
            //
            //
            //}).error(function (data) {
            //  console.log(data);
            //
            //  $scope.isCustSearchDisable = false;
            //
            //  $scope.initialCustomers = [];
            //
            //});

        }

        $scope.loadInitialCustomers();


        $scope.s = 0;
        var t = 100; // customer load skip and take
        //$scope.rows=[];

        $scope.customers = [];
        //var pdz = [];
        $scope.getCustomer = function(keyWord) {
            ////console.log($scope.customers.length);
            var dbName="";
            dbName=getDomainName().split('.')[0]+"_"+getDomainExtension();
            //filter="api-version=2016-09-01&?search=*&$orderby=createdDate desc&$skip="+skip+"&$top="+take+"&$filter=(domain eq '"+dbName+"')";
            var data={
                "search": keyWord+"*",
                "searchFields": "first_name,last_name,email_addr,phone",
                "filter": "(domain eq '"+dbName+"')",
                "orderby" : "createddate desc",
                "top":t,
                "skip":$scope.s
            }


            $charge.azuresearch().getAllProfilesPost(data).success(function (data) {
                for (var i = 0; i < data.value.length; i++) {
                    if(data.value[i].status==0)
                    {
                        data.value[i].status=false;
                    }
                    else
                    {
                        data.value[i].status=true;
                    }
                    data.value[i].createddate = new Date(data.value[i].createddate);
                    //tempList.push(data.value[i]);
                }
                //vm.profiles = tempList;
                //skipProfileSearch += takeProfileSearch;
                //$scope.loadPaging(keyword, skipProfileSearch, takeProfileSearch);
                for (var i = 0; i < data.value.length; i++) {
                    //

                    var profileId = data.value[i]["profileId"];
                    var pro_name = "";
                    if(data.value[i]["profile_type"] == "Business")
                    {
                        pro_name = data.value[i]["business_name"]; // data[i]["business_contact_name"]+" "+

                    }else{
                        pro_name = data.value[i]["first_name"]+" "+data.value[i]["last_name"];
                    }

                    $scope.customers.push({customerId: profileId, customerName: pro_name});

                }

                $scope.s += t;



                return $scope.customers;

            }).error(function (data) {
                //vm.profiles = [];
                $scope.isloadDone = true;
            });

            //$charge.profile().filterByKey(keyWord,$scope.s, t).success(function (data) {
            //
            //  //console.log(data);
            //  for (var i = 0; i < data.length; i++) {
            //    //
            //
            //    var profileId = data[i]["profileId"];
            //    var pro_name = "";
            //    if(data[i]["profile_type"] == "Business")
            //    {
            //      pro_name = data[i]["business_name"]; // data[i]["business_contact_name"]+" "+
            //
            //    }else{
            //      pro_name = data[i]["first_name"]+" "+data[i]["last_name"];
            //    }
            //
            //    $scope.customers.push({customerId: profileId, customerName: pro_name});
            //
            //  }
            //
            //  $scope.s += t;
            //
            //
            //
            //  return $scope.customers;
            //
            //
            //}).error(function (data) {
            //  console.log(data);
            //
            //  //var customer = {};
            //  //customer.customerlst = angular.copy($scope.customers);
            //  //
            //  //$scope.rows.push(customer);
            //
            //
            //  $scope.isloadDone = true;
            //
            //})
        }


        $scope.AllCurrencies =[];

        $scope.getAllAdjustment = function($take)
        {
            vm.listLoaded = false;
            $scope.isSpinnerShown = true;


            $charge.adjustment().all($scope.skip,$take,"desc").success(function(data) {

                // console.log(data);
                for(var i=0;i<data.length;i++)
                {
                    var cus = "";
                    if(data[i].customerName)
                        cus = data[i].customerName;
                    else
                        cus = "customer unknown";

                    if(data[i]['invoiceid'])
                        data[i]['invoiceid'] =  $scope.prefixInvoice+' '+$filter('numberFixedLen')(data[i]['invoiceid'],$scope.lenPrefix)

                    var aType = $filter('filter')($scope.adjTypes, { aId: data[i]["adjustmenttype"] })[0];
                    if(aType)
                        $scope.data.push({guadjustmentid : data[i]["guadjustmentid"],createdDate: data[i]["createddate"],customerId: data[i]["customerId"],customer: cus,adjustmenttypeId:  data[i]["adjustmenttype"],adjustmenttype:  aType.aType,amount:  (data[i]["amount"] * data[i]["rate"]) ,note:  data[i]["note"],invoiceid:  data[i]["invoiceid"],rate:  data[i]["rate"],currency:  data[i]["currency"],select: false });
                    else
                        $scope.data.push({guadjustmentid : data[i]["guadjustmentid"],createdDate: data[i]["createddate"],customerId: data[i]["customerId"],customer: cus,adjustmenttypeId:  data[i]["adjustmenttype"],adjustmenttype:  "Type unknown",amount:   (data[i]["amount"] * data[i]["rate"]) ,note:  data[i]["note"],invoiceid:  data[i]["invoiceid"],rate:  data[i]["rate"],currency:  data[i]["currency"],select: false });
                    // break;
                }

                $scope.skip += $take;

                $scope.isSpinnerShown = false;

                vm.adjustmentLocalList = $scope.data;

                vm.adjustments = $scope.data;

                vm.listLoaded = true;

                if($scope.skip == $scope.data.length)
                {
                    $scope.showMoreButton = true;
                }

                //adjustment data getter !
                //vm.selectedAdjustment = $scope.data[0];

                // $scope.isLoading = false;
            }).error(function(data) {
                $scope.isSpinnerShown = false;
                //console.log(data);
                $scope.skip = 0;
                $scope.take = 0;
                $take = 0;

                $scope.showMoreButton = false;

                vm.listLoaded = true;
            })

        }

        $scope.getAdjustmentByType = function(type)
        {
            vm.listLoaded = false;

            $scope.isSpinnerShown = true;


            $charge.adjustment().getAdjustmentByAdjustmentType($scope.skip,$scope.take,"desc",type).success(function(data) {
                //$scope.data=[];
                //console.log(data);
                for(var i=0;i<data.length;i++)
                {
                    var cus = "";

                    if(data[i].customerName)
                        cus = data[i].customerName;
                    else
                        cus = "customer unknown";


                    if(data[i]['invoiceid'])
                        data[i]['invoiceid'] =  $scope.prefixInvoice+' '+$filter('numberFixedLen')(data[i]['invoiceid'],$scope.lenPrefix)


                    var aType = $filter('filter')($scope.adjTypes, { aId: data[i]["adjustmenttype"] })[0];
                    if(aType)
                        $scope.data.push({guadjustmentid : data[i]["guadjustmentid"],createdDate: data[i]["createddate"],customerId: data[i]["customerId"],customer: cus,adjustmenttypeId:  data[i]["adjustmenttype"],adjustmenttype:  aType.aType,amount:  (data[i]["amount"] * data[i]["rate"]) ,note:  data[i]["note"],invoiceid:  data[i]["invoiceid"],rate:  data[i]["rate"],currency:  data[i]["currency"],select: false });
                    else
                        $scope.data.push({guadjustmentid : data[i]["guadjustmentid"],createdDate: data[i]["createddate"],customerId: data[i]["customerId"],customer: cus,adjustmenttypeId:  data[i]["adjustmenttype"],adjustmenttype:  "Type unknown",amount:   (data[i]["amount"] * data[i]["rate"]) ,note:  data[i]["note"],invoiceid:  data[i]["invoiceid"],rate:  data[i]["rate"],currency:  data[i]["currency"],select: false });
                    // break;
                }

                $scope.skip += $scope.take;
                $scope.s = 0;
                $scope.isSpinnerShown = false;

                vm.adjustmentLocalList = $scope.data;

                vm.adjustments = $scope.data;
                vm.listLoaded = true;
                //adjustment data getter !
                vm.selectedAdjustment = $scope.data[0];

                if($scope.skip == $scope.data.length)
                {
                    $scope.showMoreButton = true;

                }

                // $scope.isLoading = false;
            }).error(function(data) {
                $scope.isSpinnerShown = false;
                //console.log(data);
                $scope.s = 0;
                vm.listLoaded = true;
                $scope.skip = 0;
                $scope.showMoreButton = false;
            })
        }


        $scope.loadAdjustments = function(type){

            // adjustment load skip and take
            $scope.take = 100;
            $scope.skip = 0;
            $scope.data=[];
            vm.adjustments = [];

            $scope.searchByType = type;

            $scope.showMoreButton = false;

            if(type === '0' ){  // load normally

                $scope.getAllAdjustment(100);

            }
            else if(type === '1' || type === '2' ){  // load debitted or creditted adjustments

                $scope.getAdjustmentByType(type)

            }

        }


        $scope.loadAdjustments('0');



        $scope.loadMoreAdjustment = function(){

            //$scope.skip += 100;

            if($scope.searchByType === '0'){
                $scope.getAllAdjustment(100);
            }
            else if($scope.searchByType === '1' || $scope.searchByType === '2'){
                $scope.getAdjustmentByType(type)
            }

        }




        var self = this;
        self.selectedItem  = null;
        self.searchText    = [];
        var serachedKeyword = '', finalKeyword = '';
        $scope.isCustSearchDisable = false;

        //

        $scope.querySearch =function(query) {

            finalKeyword = query;

            if(query.length > 2) {

                $scope.SelectedInvoice = null;
                $scope.invoiceAmount = 0;

                if(serachedKeyword != query ) {

                    $scope.s = 0;
                    var t = 100;
                    $scope.customers = [];
                    serachedKeyword = query;

                    $scope.isCustSearchDisable = true;

                    var dbName="";
                    dbName=getDomainName().split('.')[0]+"_"+getDomainExtension();
                    //filter="api-version=2016-09-01&?search=*&$orderby=createdDate desc&$skip="+skip+"&$top="+take+"&$filter=(domain eq '"+dbName+"')";
                    var data={
                        "search": query+"*",
                        "searchFields": "first_name,last_name,email_addr,phone",
                        "filter": "(domain eq '"+dbName+"')",
                        "orderby" : "createddate desc",
                        "top":t,
                        "skip":$scope.s
                    }


                    $charge.azuresearch().getAllProfilesPost(data).success(function (data) {
                        for (var i = 0; i < data.value.length; i++) {
                            if(data.value[i].status==0)
                            {
                                data.value[i].status=false;
                            }
                            else
                            {
                                data.value[i].status=true;
                            }
                            data.value[i].createddate = new Date(data.value[i].createddate);
                            //tempList.push(data.value[i]);
                        }
                        //vm.profiles = tempList;
                        //skipProfileSearch += takeProfileSearch;
                        //$scope.loadPaging(keyword, skipProfileSearch, takeProfileSearch);
                        if(data.value.length == 0){
                            $scope.isQuerySearchEmpty = true;
                        }
                        for (var i = 0; i < data.value.length; i++) {

                            var profileId = data.value[i]["profileId"];
                            var pro_name = "";
                            if (data.value[i]["profile_type"] == "Business") {
                                pro_name = data.value[i]["business_name"]; // data[i]["business_contact_name"]+" "+

                            } else {
                                pro_name = data.value[i]["first_name"] + " " + data.value[i]["last_name"];
                            }

                            $scope.isCustSearchDisable = false;

                            if ($filter('filter')($scope.customers, {customerId: data.value[i]["profileId"]})[0]) {

                            } else {
                                $scope.customers.push({customerId: profileId, customerName: pro_name});
                            }
                        }

                        $scope.s += t;

                        if($scope.s === data.value.length){
                            $scope.querySearch(finalKeyword);
                        }

                    }).error(function (data) {
                        //vm.profiles = [];
                        $scope.isCustSearchDisable = false;
                        return $scope.customers;
                    });

                    //$azureSearchHandle.getClient().SearchRequest("profile",$scope.s,t,'desc',"").onComplete(function(Response)
                    //{
                    //  if(vm.loadingProfiles)
                    //  {
                    //    for (var i = 0; i < Response.length; i++) {
                    //      if(Response[i].status==0)
                    //      {
                    //        Response[i].status=false;
                    //      }
                    //      else
                    //      {
                    //        Response[i].status=true;
                    //      }
                    //      Response[i].createddate = new Date(Response[i].createddate);
                    //      //tempList.push(data.value[i]);
                    //    }
                    //    //vm.profiles = tempList;
                    //    //skipProfileSearch += takeProfileSearch;
                    //    //$scope.loadPaging(keyword, skipProfileSearch, takeProfileSearch);
                    //    if(Response.length == 0){
                    //      $scope.isQuerySearchEmpty = true;
                    //    }
                    //    for (var i = 0; i < Response.length; i++) {
                    //
                    //      var profileId = Response[i]["profileId"];
                    //      var pro_name = "";
                    //      if (Response[i]["profile_type"] == "Business") {
                    //        pro_name = Response[i]["business_name"]; // data[i]["business_contact_name"]+" "+
                    //
                    //      } else {
                    //        pro_name = Response[i]["first_name"] + " " + Response[i]["last_name"];
                    //      }
                    //
                    //      $scope.isCustSearchDisable = false;
                    //
                    //      if ($filter('filter')($scope.customers, {customerId: Response[i]["profileId"]})[0]) {
                    //
                    //      } else {
                    //        $scope.customers.push({customerId: profileId, customerName: pro_name});
                    //      }
                    //    }
                    //
                    //    $scope.s += t;
                    //
                    //    if($scope.s === Response.length){
                    //      $scope.querySearch(finalKeyword);
                    //    }
                    //
                    //    vm.loadingProfiles = false;
                    //  }
                    //
                    //}).onError(function(data)
                    //{
                    //  //console.log(data);
                    //  $scope.isCustSearchDisable = false;
                    //  return $scope.customers;
                    //});

                    //$charge.profile().filterByCatKey( $scope.s, t,'customer',query).success(function (data) {
                    //  //console.log(data);
                    // // $scope.customers = [];
                    //  if(data.length == 0){
                    //    $scope.isQuerySearchEmpty = true;
                    //  }
                    //  for (var i = 0; i < data.length; i++) {
                    //
                    //    var profileId = data[i]["profileId"];
                    //    var pro_name = "";
                    //    if (data[i]["profile_type"] == "Business") {
                    //      pro_name = data[i]["business_name"]; // data[i]["business_contact_name"]+" "+
                    //
                    //    } else {
                    //      pro_name = data[i]["first_name"] + " " + data[i]["last_name"];
                    //    }
                    //
                    //    $scope.isCustSearchDisable = false;
                    //
                    //    if ($filter('filter')($scope.customers, {customerId: data[i]["profileId"]})[0]) {
                    //
                    //    } else {
                    //      $scope.customers.push({customerId: profileId, customerName: pro_name});
                    //    }
                    //  }
                    //
                    //  $scope.s += t;
                    //
                    //  if($scope.s === data.length){
                    //    $scope.querySearch(finalKeyword);
                    //  }
                    //
                    //}).error(function (data) {
                    //  console.log(data);
                    //
                    //  $scope.isCustSearchDisable = false;
                    //  return $scope.customers;
                    //
                    //});

                }

                return $scope.customers;

            }else{

                if($scope.initialCustomers){
                    $scope.customers = [];
                    for(var p = 0; p < $scope.initialCustomers.length;p++)
                    {
                        if($scope.initialCustomers[p].customerName.toLowerCase().indexOf(query.toLowerCase()) !== -1)
                        {
                            if ($filter('filter')($scope.customers, {customerId: $scope.initialCustomers[p]["profileId"]})[0]) {

                            } else {
                                $scope.customers.push($scope.initialCustomers[p]);
                            }
                        }
                    }
                }
                return $scope.customers;

            }

        }

        $scope.loadInvoices = function(){
            $scope.invoices=[];

            if(!$scope.content.customer ){
                return;
            } else if($scope.content.customer.length < 1 ){
                return;
            }

            $charge.invoice().getByAccountID($scope.content.customer.customerId).success(function(data) {

                //console.log(data);
                for(var i=0;i<data.length;i++)
                {
                    var currencyAmount = data[i]["invoiceAmount"];
                    //
                    //var c = $scope.baseCurrency+'_'+data[i]["currency"];
                    //for(var iz=0;iz<$scope.AllCurrencies.length;iz++)
                    //{
                    if(data[i]["rate"])
                    {
                        currencyAmount = (data[i]["invoiceAmount"] * data[i]["rate"]);

                        //console.log(data[i]["amount"] +"  -  "+(data[i]["amount"] * currencies[iz][c].val));
                    }

                    //}

                    $scope.invoices.push({invoiceid : data[i]["invoiceNo"],invoiceno: $scope.prefixInvoice+' '+$filter('numberFixedLen')(data[i]['invoiceNo'],$scope.lenPrefix)
                        ,currencyAmount: currencyAmount,invoiceAmount: data[i]["invoiceAmount"],invoiceDate: data[i]["invoiceDate"],invoiceStatus: data[i]["invoiceStatus"]
                        ,currency: data[i]["currency"],invoiceType: data[i]["invoiceType"],paidAmount: data[i]["paidAmount"],subTotal: data[i]["subTotal"]});


                }

                // $scope.isLoading = false;
            }).error(function(data) {
                //console.log(data);
            })
        }


        $scope.skipk = 0;
        $scope.takek = 100;

        $scope.searchAdjustmentByKeyWord = function(){

            if(vm.search.length > 2 && vm.adjustments.length >= $scope.take) {
                // adjustment load


                $charge.adjustment().getAdjustmentsForKeyword($scope.skipk,$scope.takek,vm.search).success(function(data) {
                    $scope.data=[];

                    //console.log(data);
                    for(var i=0;i<data.length;i++)
                    {
                        var cus = "";
                        var cName = $filter('filter')($scope.customers, { customerId: data[i]["customerId"] })[0];
                        cus = cName.customerName;

                        var aType = $filter('filter')($scope.adjTypes, { aId: data[i]["adjustmenttype"] })[0];


                        $scope.data.push({guadjustmentid : data[i]["guadjustmentid"],createdDate: data[i]["createddate"],customerId: data[i]["customerId"],customer: cus,adjustmenttypeId:  data[i]["adjustmenttype"],adjustmenttype:  aType.aType,amount: (data[i]["amount"] * data[i]["rate"]) ,note:  data[i]["note"],invoiceid:  data[i]["invoiceid"],rate:  data[i]["rate"],currency:  data[i]["currency"],select: false });
                        // break;
                    }

                    $scope.skipk += 100;
                    //$scope.isSpinnerShown = false;

                    $scope.searchAdjustmentByKeyWord();

                    // $scope.isLoading = false;
                }).error(function(data) {
                    $scope.isSpinnerShown = false;
                    //console.log($scope.data);
                    closeReadPane();
                    vm.adjustments = $scope.data;
                    vm.listLoaded = true;

                    $scope.skipk = 0;
                    $scope.takek = 100;
                })

            }else{
                vm.adjustments = vm.adjustmentLocalList;
                vm.listLoaded = true;
            }

        }


        // add controller

        //---add new profile---
        $scope.addNewUser = function(ev)
        {
            //console.log("yes");
            //$scope.content.user = "";
            $mdDialog.show({
                controller: 'AddNewAdjUserController',
                templateUrl: 'app/main/adjustment/composeNewUser-dialog.html',
                controllerAs       : 'vm',
                locals             : {
                    selectedMail: undefined,
                    category: "Customer"
                },
                parent: angular.element($document.body),
                targetEvent: ev,
                clickOutsideToClose:true
            })
                .then(function(user) {
                    if(user != undefined)
                    {
                        $scope.initialCustomers.push({customerId: user.profileId, customerName: user.first_name+' '+user.last_name});
                        $scope.customers.push({customerId: user.profileId, customerName: user.first_name+' '+user.last_name});
                        $scope.content.customer={customerId: user.profileId, customerName: user.first_name+' '+user.last_name};
                        //ctrl.searchText[pro.line]=user.first_name+' '+user.last_name;
                    }
                })

        }



        $scope.content = [];
        $scope.content.invoiceid = "0";
        $scope.content.note = "";
        // $scope.rows.customer = [];


        $scope.isSaveClicked = false;

        $scope.submit = function( isValid) {

            $scope.isSaveClicked = true;

            if(!isValid) {
                angular.element(document.querySelector('#adjustmentForm')).find('.ng-invalid:visible:first').focus();
                $scope.isSaveClicked = false;
            }
            //else if($scope.content.customer == null || $scope.content.customer.length == 0){
            //  $scope.isSaveClicked = false;
            //  //notifications.toast("Please fill customer field", "error");
            //}else if(!$scope.content.adjustmenttype ){
            //  $scope.isSaveClicked = false;
            //  //notifications.toast("Please fill adjustment type", "error");
            //}else if( !$scope.content.amount){
            //  $scope.isSaveClicked = false;
            //  //notifications.toast("Please fill amount", "error");
            //}
            //else if(!$scope.content.customer.customerId){
            //  $scope.isSaveClicked = false;
            //  //notifications.toast("Please fill all fields", "error");
            //}
            //else if($scope.SelectedInvoice != null && $scope.SelectedInvoice.currency != $scope.content.preferredCurrency){
            //  $scope.isSaveClicked = false;
            //  //notifications.toast("Invoice currency doesn't match with selected currency", "error");
            //}

            else {


                // main table details and promo product details
                $scope.content = {
                    "adjustmenttype": $scope.content.adjustmenttype,
                    "amount": ($scope.content.amount / rate),
                    "customerid": $scope.content.customer.customerId,
                    "customerName": $scope.content.customer.customerName,
                    "note": $scope.content.note,
                    "invoiceid": $scope.content.invoiceid,
                    "rate": rate,
                    "currency": $scope.content.preferredCurrency
                }

                // Header deatil saves here.
                $charge.adjustment().store($scope.content).success(function (data) {

                    //alert(data.error);
                    if (data.error == "00000") {
                        //
                        notifications.toast("Record Saved, Adjustment Added", "success");
                        //location.href = "#/main";
                        $scope.isSaveClicked = false;
                        $mdDialog.hide();
                        $scope.s = $scope.skip = 0;
                        $scope.loadAdjustments('0');

                        // vm.appInnerState = "default";
                        // vm.addButtonDisplayText = "CREATE NEW";
                        vm.activeAdjustmentPaneIndex = 0;
                        $scope.clearForm();
                    }else{

                        notifications.toast("Error adding record, " + data, "error");

                    }
                }).error(function (data) {
                    //console.log(data);
                    notifications.toast("Error adding record, " + data['error'], "error");
                    $scope.isSaveClicked = false;
                })

            }

        }


        $scope.backToMain = function(ev)
        {

            vm.appInnerState = "default";
            //  $state.go($state.current, {}, {reload: true});
        }


        $scope.calculateInvoiceAdjustment = function(adjustmenttype){

            $scope.invoiceSubTotal =0;
            $scope.adjustingAmount=0;
            // $scope.invoiceAmount = 0;

            if(adjustmenttype)
                if(adjustmenttype === "1"){
                    $scope.adjustingAmount = parseInt($scope.adjustAmount);
                }else{
                    $scope.adjustingAmount = parseInt(-$scope.adjustAmount);
                }


            $scope.invoiceSubTotal = $scope.adjustingAmount + $scope.invoiceAmount;

        }
        //$scope.clearForm = function(ev)
        //{
        //
        //  $scope.content =[];
        //  //$state.go($state.current, {}, {reload: true});
        //}

        $scope.clearForm = function(ev)
        {
            vm.adjustmentAdd.$setPristine();
            vm.adjustmentAdd.$setUntouched();
            $scope.content ={};
            $scope.content.customer= [];
            $scope.content.preferredCurrency = $scope.baseCurrency;
            $scope.adjustAmount = "0";
            $scope.exchangeRate = "0";
            $scope.SelectedInvoice = null;
            $scope.invoices = null;
            $scope.invoiceAmount = 0;
            $scope.invoiceSubTotal =0;
            $scope.adjustingAmount=0;
            $scope.isSaveClicked = false;
            //$state.go($state.current, {}, {reload: true});
        }


        $scope.SelectedInvoice = null;
        $scope.isInvoiceLoaded = true;
        $scope.selectInveice = function(invoiceId) {
            $scope.isInvoiceLoaded = false;

            $scope.invoiceAmount =0;

            var invoice = $filter('filter')($scope.invoices, {invoiceid: invoiceId})[0];

            if (invoice) {
                $scope.SelectedInvoice = invoice;
                $scope.invoiceAmount = invoice.invoiceAmount;

                $scope.content.preferredCurrency = invoice.currency;
                $scope.calcRate();
            }
            else
                $scope.SelectedInvoice= null;


            $scope.calculateInvoiceAdjustment(1);

        }


        var rate=1;

        $scope.exchangeRate = rate;
        $scope.adjustAmount = 0;

        $scope.changeAmount = function(ev){
            $scope.adjustAmount = $scope.content.amount / rate;
            $scope.calculateInvoiceAdjustment($scope.content.adjustmenttype );
        }


        $scope.calcRate = function (ev) {
            $scope.isSpinnerShown=true;
            //if($scope.content.preferredCurrency!=$scope.baseCurrency) {

            //var param=$scope.baseCurrency+'_'+$scope.content.preferredCurrency;
            //$charge.currency().calcCurrency(param).success(function (data) {
            //
            //
            //  var results=data.results;
            //  var result = results[param];
            //  rate = parseFloat(result.val);
            //  $scope.exchangeRate = rate;
            //  $scope.isSpinnerShown = false;
            //  if ($scope.content.amount.length != 0) {
            //    $scope.adjustAmount = $scope.content.amount / rate;
            //  }
            //}).error(function (data) {
            //  rate = 1;
            //  $scope.isSpinnerShown = false;
            //})


            var amount = 1;
            var from=$scope.baseCurrency;
            var to = $scope.content.preferredCurrency;
            $charge.currency().calcCurrency(amount,from,to).success(function (data) {

                var result=data;

                rate = parseFloat(result);
                $scope.exchangeRate = rate;

                if ($scope.content.amount) {
                    $scope.adjustAmount = $scope.content.amount / rate;
                }

                $scope.isInvoiceLoaded = true;


            }).error(function (data) {
                rate = 1;
                //console.log('error');
                $scope.isInvoiceLoaded = true;
            })



        }




        // Watch screen size to activate responsive read pane
        $scope.$watch(function ()
        {
            return $mdMedia('gt-md');
        }, function (current)
        {
            vm.responsiveReadPane = !current;
        });

        // Watch screen size to activate dynamic height on tabs
        $scope.$watch(function ()
        {
            return $mdMedia('xs');
        }, function (current)
        {
            vm.dynamicHeight = current;
        });

        /**
         * Select adjustment
         *
         * @param adjustment
         */
        function selectAdjustment(adjustment)
        {
            $scope.SelectedInvoice = null;
            vm.selectedAdjustment = adjustment;
            $scope.isReadLoaded = false;
            $scope.showInpageReadpane = true;

            if(adjustment.invoiceid && adjustment.invoiceid != 0){

                var invoiceId = adjustment.invoiceid.split(' ');
                var invoiceNumber = parseInt(invoiceId[1]);


                //$charge.invoice().getByID(invoiceNumber).success(function(data) {
                //	$scope.SelectedInvoice=[];
                //
                //	//console.log(data);
                //	for(var i=0;i<data.length;i++)
                //	{
                //		var currencyAmount = data[i]["invoiceAmount"];
                //
                //		var c = $scope.baseCurrency+'_'+data[i]["currency"];
                //		for(var iz=0;iz<$scope.AllCurrencies.length;iz++)
                //		{
                //			if($scope.AllCurrencies[iz][c])
                //			{
                //				currencyAmount = (data[i]["invoiceAmount"] * $scope.AllCurrencies[iz][c].val);
                //				//console.log(data[i]["amount"] +"  -  "+(data[i]["amount"] * currencies[iz][c].val));
                //			}
                //
                //		}
                //
                //		$scope.SelectedInvoice=({invoiceid : data[i]["invoiceNo"],invoiceno: $scope.prefixInvoice+' '+data[i]["invoiceNo"]
                //			,currencyAmount: currencyAmount,invoiceAmount: data[i]["invoiceAmount"],invoiceDate: data[i]["invoiceDate"],invoiceStatus: data[i]["invoiceStatus"]
                //			,currency: data[i]["currency"],invoiceType: data[i]["invoiceType"],paidAmount: data[i]["paidAmount"],subTotal: data[i]["subTotal"]});
                //
                //
                //
                //	}
                //
                //	// var elem = document.getElementById('print-content');
                //	// if(elem != undefined && !$scope.isTemplateLoaded && $scope.SelectedInvoice.length != 0){
                //	// 	$http({
                //	// 		method: 'GET',
                //	// 		url: $scope.emailTemplateMarkupURL
                //	// 	}).then(function (response) {
                //	// 		emailTemplateMarkup = response.data;
                //	// 		vm.adjustmentViewExtraction(function (processedMkup) {
                //	// 			elem.innerHTML = processedMkup;
                //	// 		});
                //	// 		$scope.isReadLoaded = true;
                //	// 		$scope.isTemplateLoaded = true;
                //	// 	}, function () {
                //	// 	});
                //	// }else{
                //	// 	vm.adjustmentViewExtraction(function (processedMkup) {
                //	// 		elem.innerHTML = processedMkup;
                //	// 	});
                //	// 	$scope.isReadLoaded = true;
                //	// 	$scope.isTemplateLoaded = true;
                //	// };
                //
                //	$scope.isReadLoaded = true;
                //}).error(function(data) {
                //	$scope.isReadLoaded = true;
                //	//console.log(data);
                //})

                $charge.invoicing().retrieveInvoiceById(invoiceNumber).success(function(data) {
                    $scope.SelectedInvoice=[];

                    //console.log(data);
                    for(var i=0;i<data.data.result.length;i++)
                    {
                        var currencyAmount = data.data.result[i]["invoiceAmount"];

                        var c = $scope.baseCurrency+'_'+data.data.result[i]["currency"];
                        for(var iz=0;iz<$scope.AllCurrencies.length;iz++)
                        {
                            if($scope.AllCurrencies[iz][c])
                            {
                                currencyAmount = (data.data.result[i]["invoiceAmount"] * $scope.AllCurrencies[iz][c].val);
                                //console.log(data[i]["amount"] +"  -  "+(data[i]["amount"] * currencies[iz][c].val));
                            }

                        }

                        $scope.SelectedInvoice=({invoiceid : data.data.result[i]["invoiceNo"],invoiceno: $scope.prefixInvoice+' '+data.data.result[i]["invoiceNo"]
                            ,currencyAmount: currencyAmount,invoiceAmount: data.data.result[i]["invoiceAmount"],invoiceDate: data.data.result[i]["invoiceDate"],invoiceStatus: data.data.result[i]["invoiceStatus"]
                            ,currency: data.data.result[i]["currency"],invoiceType: data.data.result[i]["invoiceType"],paidAmount: data.data.result[i]["paidAmount"],subTotal: data.data.result[i]["subTotal"]});



                    }

                    LoadProfileDetails(adjustment);
                }).error(function(data) {
                    $scope.isReadLoaded = true;
                    //console.log(data);
                })

            }else{
                $scope.SelectedInvoice = {
                    invoiceid : "",
                    invoiceType : "",
                    currency : "",
                    currencyAmount : "",
                    paidAmount : ""
                };
                LoadProfileDetails(adjustment);
            }

            $timeout(function ()
            {
                // If responsive read pane is
                // active, navigate to it
                //if ( angular.isDefined(vm.responsiveReadPane) && vm.responsiveReadPane )
                // {
                //   vm.activeAdjustmentPaneIndex = 1;
                // }
                // Store the current scrollPos
                vm.scrollPos = vm.scrollEl.scrollTop();

                // Scroll to the top
                vm.scrollEl.scrollTop(0);
            });
        }

        function LoadProfileDetails (adjustment) {
            $charge.profile().getByID(adjustment.customerId).success(function(data) {

                for(var i=0;i<data.length;i++)
                {
                    $scope.customerAddress = data[i].bill_addr;
                    $scope.customerPhone = data[i].phone;
                    $scope.customerEmail = data[i].email_addr;
                }
                $scope.customerAddress = $scope.customerPhone =  $scope.customerEmail = '';
                var docinfo = {
                    type : 'adjustment',
                    company : {
                        companyName : $scope.compinfo.companyName,
                        companyPhone : $scope.compinfo.companyPhone,
                        companyEmail : $scope.compinfo.companyEmail,
                        companyAddress : $scope.compinfo.companyAddress,
                        companyLogo : $scope.compinfo.companyLogo
                    },
                    client : {
                        clientName : vm.selectedAdjustment.customer,
                        clientPhone : $scope.customerPhone,
                        clientAddress : $scope.customerAddress,
                        clientEmail : $scope.customerEmail
                    },
                    transaction : {
                        guadjustmentid : vm.selectedAdjustment.guadjustmentid,
                        adjustmenttype : vm.selectedAdjustment.adjustmenttype,
                        createdDate : vm.selectedAdjustment.createdDate,
                        invoiceDate : $scope.SelectedInvoice.invoiceDate,
                        invoiceType : $scope.SelectedInvoice.invoiceType,
                        invoiceid : vm.selectedAdjustment.invoiceid,
                        currency : $scope.SelectedInvoice.currency,
                        currencyAmount : $scope.SelectedInvoice.currencyAmount,
                        paidAmount : $scope.SelectedInvoice.paidAmount,
                        invoiceStatus : $scope.SelectedInvoice.invoiceStatus,
                        amount : vm.selectedAdjustment.amount,
                        invoiceDetails : [{
                            name : vm.selectedAdjustment.invoiceid,
                            unitPrice : $scope.SelectedInvoice.invoiceType,
                            gty : $scope.SelectedInvoice.currency,
                            promotion : $scope.SelectedInvoice.currencyAmount,
                            totalPrice : $scope.SelectedInvoice.paidAmount
                        }]
                    }
                };

                var t = transactionTemplateGenerator(docinfo);
                var preview = $('#print-content');
                preview.children().remove();
                preview.append(t);
                $scope.isReadLoaded = true;

            }).error(function(data) {
                //console.log(data);
                $scope.isReadLoaded = true;
            })
        }

        $scope.compinfo={};
        $charge.settingsapp().getDuobaseValuesByTableName("CTS_CompanyAttributes").success(function(data) {
            $scope.CompanyProfile=data;
            $scope.compinfo.companyName=data[0].RecordFieldData;
            $scope.compinfo.companyAddress=data[1].RecordFieldData;
            $scope.compinfo.companyPhone=data[2].RecordFieldData;
            $scope.compinfo.companyEmail=data[3].RecordFieldData;
            $scope.compinfo.companyLogo=data[4].RecordFieldData;
            $scope.decimalPointDet=data[6];
        }).error(function(data) {
        })

        /**
         * Close read pane
         */
        function closeReadPane()
        {
            // if ( angular.isDefined(vm.responsiveReadPane) && vm.responsiveReadPane )
            {
                vm.activeAdjustmentPaneIndex = 0;

                $timeout(function ()
                {
                    vm.scrollEl.scrollTop(vm.scrollPos);
                }, 650);
            }
        }

        /**
         * Toggle starred
         *
         * @param mail
         * @param event
         */
        function toggleStarred(mail, event)
        {
            event.stopPropagation();
            mail.starred = !mail.starred;
        }


        function toggleinnerView(state){
            $timeout(function () {
                $scope.showInpageReadpane = false;
            });

            if(state === "open"){
                // vm.appInnerState = "add";
                $scope.SelectedInvoice = null;
                $scope.invoiceAmount = 0;
                // vm.addButtonDisplayText = "VIEW ADJUSTMENTS";
                // vm.pageTitle="View Adjustment";
                vm.activeAdjustmentPaneIndex = 1;
            }else if(state === "close"){
                if(vm.adjustmentAdd.$dirty ){
                    var confirm = $mdDialog.confirm()
                        .title('Are you sure?')
                        .textContent('Fields have changed and you might have unsaved data. Are you sure you want to leave this page?')
                        .ariaLabel('Are you sure?')
                        .targetEvent()
                        .ok('Leave')
                        .cancel('Stay');

                    $mdDialog.show(confirm).then(function() {
                        vm.adjustmentAdd.$pristine = false;
                        vm.adjustmentAdd.$dirty = false;
                        $scope.clearForm();
                        // vm.appInnerState = "default";
                        // vm.addButtonDisplayText = "CREATE NEW";
                        // vm.pageTitle = "Create New";
                        vm.activeAdjustmentPaneIndex = 0;
                    }, function() {
                    });
                }else {
                    // vm.appInnerState = "default";
                    // vm.addButtonDisplayText = "CREATE NEW";
                    // vm.pageTitle = "Create New";
                    vm.activeAdjustmentPaneIndex = 0;
                }
            }
        }

        /**
         * Toggle checked status of the mail
         *
         * @param mail
         * @param event
         */
        function toggleCheck(mail, event)
        {
            if ( event )
            {
                event.stopPropagation();
            }

            var idx = vm.checked.indexOf(mail);

            if ( idx > -1 )
            {
                vm.checked.splice(idx, 1);
            }
            else
            {
                vm.checked.push(mail);
            }
        }

        /**
         * Return checked status of the mail
         *
         * @param mail
         * @returns {boolean}
         */
        function isChecked(mail)
        {
            return vm.checked.indexOf(mail) > -1;
        }

        /**
         * Check all
         */
        function checkAll()
        {
            if ( vm.allChecked )
            {
                vm.checked = [];
                vm.allChecked = false;
            }
            else
            {
                angular.forEach(vm.adjustments, function (mail)
                {
                    if ( !isChecked(mail) )
                    {
                        toggleCheck(mail);
                    }
                });

                vm.allChecked = true;
            }
        }

        /**
         * Open compose dialog
         *
         * @param ev
         */
        function addAdjustmentDialog(ev)
        {
            $mdDialog.show({
                controller         : 'AddAdjustmentController',
                controllerAs       : 'vm',
                locals             : {
                    selectedMail: undefined
                },
                templateUrl        : 'app/main/adjustment/dialogs/compose/compose-dialog.html',
                parent             : angular.element($document.body),
                targetEvent        : ev,
                clickOutsideToClose: true
            });
        }

        /**
         * Toggle sidenav
         *
         * @param sidenavId
         */
        function toggleSidenav(sidenavId)
        {
            $mdSidenav(sidenavId).toggle();
        }

        $scope.sortBy = function(propertyName,status,property) {

            vm.adjustments=$filter('orderBy')(vm.adjustments, propertyName, $scope.reverse)
            $scope.reverse =!$scope.reverse;
            if(status!=null) {
                if(property=='ID')
                {
                    $scope.showId = status;
                    $scope.showDate = false;
                    $scope.showType=false;
                    $scope.showAmt = false;
                }
                if(property=='Date')
                {
                    $scope.showDate = status;
                    $scope.showId = false;
                    $scope.showType=false;
                    $scope.showAmt = false;
                }
                if(property=='Type')
                {
                    $scope.showType = status;
                    $scope.showDate = false;
                    $scope.showId=false;
                    $scope.showAmt = false;
                }
                if(property=='Amt')
                {
                    $scope.showAmt = status;
                    $scope.showDate = false;
                    $scope.showType=false;
                    $scope.showId = false;
                }
            }
        };

    }
})();
