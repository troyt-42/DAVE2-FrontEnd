(function(){
  'use strict';
  angular
  .module("Dave2.Importer")
  .controller("ImporterUploadCtrl" ,ImporterUploadCtrl)
  .controller("UpdateImporterModalCtrl", UpdateImporterModalCtrl)
  .controller("DaveImporterListPageCtrl", DaveImporterListPageCtrl)
  .controller("DaveImporterPageCtrl", DaveImporterPageCtrl)
  .controller("DaveImporterConfigurationPageCtrl", DaveImporterConfigurationPageCtrl)
  .controller("DaveImporterSearchModePageCtrl", DaveImporterSearchModePageCtrl);

  ImporterUploadCtrl.$inject = [
    "$timeout",
    "$http",
    "$scope",
    "$modal",
    "$compile",
    "$interval",
    "$cookies",
    "Upload",
    "FormSettingParseService",
    "ImporterSocket",
    'DirectiveService',
    'generalStateWRS'
  ];

  UpdateImporterModalCtrl.$inject = [
    "$scope",
    "$modalInstance",
    "currentImporter",
    "Upload",
    "ImporterSocket"
  ];

  DaveImporterListPageCtrl.$inject = [
    'FormSettingParseService',
    'ImporterSocket',
    '$scope',
    '$timeout',
    '$compile',
    '$rootScope',
    "$cookies",
    'DirectiveService'
  ];

  DaveImporterPageCtrl.$inject = [
    'ImporterSocket',
    '$scope',
    '$timeout',
    '$compile',
    '$modal',
    '$location',
    '$cookies',
    'DirectiveService'
  ];

  DaveImporterConfigurationPageCtrl.$inject = [
    '$scope',
    '$compile',
    'ImporterSocket',
    'DirectiveService'
  ];

  DaveImporterSearchModePageCtrl.$inject = [
    '$scope',
    '$compile',
    '$cookies',
    'ImporterSocket',
    'DirectiveService',
    'generalStateWRS'
  ];

  function ImporterUploadCtrl($timeout, $http, $scope,$modal,$compile,$interval, $cookies, Upload, FormSettingParseService, ImporterSocket, DirectiveService, generalStateWRS){
    var vm = this;
    //functions
    vm.activate = activate;
    vm.cancelFile = cancelFile;
    vm.cancelRandomImporter = cancelRandomImporter;
    vm.createRandomImporter = createRandomImporter;
    vm.changeDataItemConfig = changeDataItemConfig;

    vm.removeFile = removeFile;
    vm.submitFile = submitFile;

    //variables
    vm.alerts = {
      "stepOne":[],
      "stepTwoB" :[]
    };


    vm.createNewImporterFormModel = {};
    vm.leftMenuExpanded = false;
    vm.fileToUpload = [];
    vm.fileUploadProgress = 0;
    vm.randomImporterFormFields = [
      {
        type:"input",
        key:"Maximum Value",
        data:{
          inputType: "number",
          placeholder: 0
        }
      },
      {
        type:"input",
        key:"Minimum Value",
        data:{
          inputType: "number",
          placeholder: 0
        }
      },
      {
        type:"input",
        key:"Maximum Slope",
        data:{
          inputType: "number",
          placeholder: 0
        }
      },
      {
        type:"input",
        key:"Interval (/ms)",
        data:{
          inputType: "number",
          placeholder: 0
        }
      },
      {
        type:"input",
        key:"Time Float (/ms)",
        data:{
          inputType: "number",
          placeholder: 0
        },
        validators:{
          halfOfInterval : function($viewValue, $modalValue, scope){
            if(($modalValue > vm.randomImporterFormModel["Interval (/ms)"] * 0.5) || ($modalValue < 0)){
              return false;
            } else {
              return true;
            }
          }

        }
      },
      {
        type:"input",
        key:"Target Importer Name",
        data:{
          placeholder: "example"
        }
      },
      {
        type:"input",
        key:"Location",
        data:{
          placeholder: "example"
        }
      }
    ];
    vm.randomImporterFormModel = {
      "Maximum Value" : 0,
      "Minimum Value" : 0,
      "Maximum Slope" : 0,
      "Interval (/ms)" : 1000,
      "Time Float (/ms)": 0,
      "Target Data Item Name": "test",
      "Location": "brampton"
    };
    vm.progressing = false;
    vm.progressingStat = [0, 1];
    vm.stepOneSearchMode = false;
    vm.stepOneSearchModeInput = {};
    vm.importerCreationPromise = '';
    vm.importerToDisplayContent = [];


    vm.promiseToSolve = null;
    vm.requestImporterPromiseToSolve = null;
    vm.stepOne = true;
    vm.stepTwo = false;
    vm.stepTwoB = false;
    vm.stepThree = false;

    vm.stepOneLoading = true;

    vm.stepThreeFormCollection = [];



    vm.sampleDataQuantity = 50;
    vm.sampleDataReduction = 50;

    vm.search2 = {fieldName: ''};

    vm.systemStatus = "Normal";
    vm.optionStatus = {
      firstOpen : false,
      secondOpen: true,
      thirdOpen: false,
      fourthOpen: false
    };

    vm.createNewImporterFormFields = [
      {
        type:"input",
        key:"Name",
        data:{
          placeholder: "example"
        }
      },
      {
        type:"input",
        key:"Location",
        data:{
          placeholder: "example"
        }
      },
      {
        type:"textarea",
        key:"Description"
      },

    ];

    vm.waitingMessage = 'File Uploading';

    $scope.$on('progressing', function(event, progressingStat){
      vm.progressing = true;
      vm.progressingStat = progressingStat;
      vm.importerCreationPromise = $interval(function(){
        vm.fileUploadProgress += 4;
      }, 1000, 25);
      console.log('progressing');
      console.log(progressingStat);
    });

    $scope.$on('toggleLeftMenu', function(){
      angular.element(".importerContainerLeftMenu").toggleClass('noExpanded');
      angular.element(".importerContainerRightPanel").toggleClass('expanded');
      angular.element("#js-expand-arrow").toggleClass('glyphicon-arrow-left  animated flipInY');
      angular.element("#js-expand-arrow").toggleClass('glyphicon-arrow-right  animated flipInY');
      if(angular.element("#js-expand-sign").html() === " Expand"){
        angular.element("#js-expand-sign").html(" Collapse");
      }
      else if(angular.element("#js-expand-sign").html() === " Collapse"){
        angular.element("#js-expand-sign").html(" Expand");
      }
    });
    $scope.$watch(function(){
      return vm.stepOne;
    }, function(newValue){
      if(newValue === true){
        $scope.$emit("dynamicBackground");
      } else if ( newValue === false){
        $scope.$emit("removeDynamicBackground");
      }
    });

    var temp = []; //temporary var for importerCreationResponse event
    ImporterSocket.on("importerCreationResponse", function(response){
      if(vm.systemStatus === "Normal"){
        temp = temp.concat(response.data);
        if(response.completeState === 1.0){
          console.log(vm.stepThreeFormCollection);
          vm.stepThreeFormCollection = FormSettingParseService(temp); //jshint ignore:line
          vm.importerCreationMeta = {
            importerName : response.importerName,
            location : response.location,
            userName : response.userName,
            files : response.files,
            description: response.description
          };
          temp = [];
          vm.progressing = false;
          console.log(angular.element('dave-importer-configuration-page'));
          if(!angular.element('dave-importer-configuration-page').length){
            var bindScope = $scope.$new(true);
            bindScope.formCollection = vm.stepThreeFormCollection;
            bindScope.importerCreationMeta = vm.importerCreationMeta;
            DirectiveService.AddDirectiveService('.importerContainerRightPanel', '<dave-importer-configuration-page  class="angular-directive" form-collection="{{formCollection}}" importer-creation-meta="{{importerCreationMeta}}"></dave-importer-configuration-page>', bindScope, $compile);
          }
          vm.fileUploadProgress = 0;
        }
      }

    });

    ImporterSocket.on("importerCreationFinalResponse", function(response){
      if(vm.systemStatus === "Normal"){
        console.log(response);
        if(response.reply === "COMPLETE"){
          vm.importerToRequest = {
            importerName: response.payload.importerName,
            location: response.payload.location,
            ownerName: response.payload.ownerName,
            description: response.payload.description
          };
          var bindScope = $scope.$new(true);
          bindScope.importerToRequest = {};
          angular.copy(vm.importerToRequest, bindScope.importerToRequest);
          $timeout(function(){
            DirectiveService.AddDirectiveService('.importerContainerRightPanel', '<dave-importer-page class="angular-directive" importer-to-request="{{importerToRequest}}"></dave-importer-page>', bindScope, $compile);
            vm.progressing = false;
          }, 1500);


        }
        if(response.reply === "PROGRESSING"){
          vm.progressingStat[1] = response.payload.numFiles;
          vm.fileUploadProgress = response.payload.status * 100;
          if(response.payload.status === 1.0){
            vm.progressingStat[0] = response.payload.numFinishProcessedFile;
          }
        }
        if(response.reply === "submitting"){
          if(response.completeState === 1){
            $interval.cancel(vm.importerCreationPromise);
            vm.fileUploadProgress = 100;
          }
        }
      }
    });

    vm.activate();
    ///////////////////////////
    function activate(){
      generalStateWRS.writeState('hasMenu', true);
    }



    function cancelFile(){
      vm.formModel= {};
    }
    function cancelRandomImporter(){

    }
    function createRandomImporter(){
      console.log(vm.randomImporterFormModel);
      ImporterSocket.emit("createRandomImporter", vm.randomImporterFormModel);
    }
    function changeDataItemConfig(dataItem){
      var loginInterface = $modal.open({
        templateUrl:"Importer/changeDataItemModal.html",
        controller:["$scope","$modalInstance", function($scope, $modalInstance){
          $scope.dataItem = dataItem;
          $scope.type = "text";
          $scope.ok = function(){
            $modalInstance.close({name:$scope.dataItem.name, value:$scope.dataItem.value});
          };

          $scope.cancel = function(){
            $modalInstance.dismiss('cancel');
          };
        }]
      });

      loginInterface.result.then(function(data){
        console.log(data);
      });
    }



    function removeFile(file){
      var index = vm.fileToUpload.indexOf(file);
      if(index !== -1){
        vm.fileToUpload.splice(index, 1);
        console.log(vm.formModel);
      }
    }


    function submitFile(){
      var uploadfile = vm.fileToUpload;
      console.log(uploadfile);
      if(uploadfile !== {}){

        var importerInfo = {
          'importerName' : vm.createNewImporterFormModel.Name,
          'files':[],
          'location': vm.createNewImporterFormModel.Location,
          'description': vm.createNewImporterFormModel.Description,
          'userName': 'troy'

        };

        for(var i = 0; i < vm.fileToUpload.length; i++){
          importerInfo.files.push({fileName:vm.fileToUpload[i].name});
        }

        DirectiveService.DestroyDirectiveService('.angular-directive', angular.element('.angular-directive').isolateScope());
        vm.progressing = true;
        //Upload file through http
        Upload.upload({
          url : "/Importer/uploadFile",
          file: uploadfile,
          fields:{
            'uploadInfo': {
              'name' : vm.createNewImporterFormModel.Name,
              'location': vm.createNewImporterFormModel.Location,
              'description': vm.createNewImporterFormModel.Description
            }
          }
        }).progress(function(evt) {
          var progress = parseInt(100.0 * evt.loaded / evt.total);
          console.log(progress);
          vm.fileUploadProgress = progress;
          if(progress >= 100){
            vm.progressingStat[0] = 1;
            vm.waitingMessage = 'Waiting response from server';
            console.log(vm.waitingMessage);
          }
        }).success(function(data, status, headers, config) {
          //Upload importerInfo through socket
          ImporterSocket.emit("createNewImporter",importerInfo );

          console.log("uploadSuccess");
        }).error(function(err){
          alert(err);
        });
      } else {
        alert("Please Select a File");
      }
    }


  }

  function UpdateImporterModalCtrl($scope, $modalInstance, currentImporter, Upload, ImporterSocket){
    var vm = this;
    //functions
    vm.update = update;
    vm.cancel = cancel;
    vm.removeFile = removeFile;
    //variables
    vm.currentImporter = currentImporter;
    vm.files = null;
    vm.fileUploadProgress = 0;
    vm.waitingMessage = '';
    vm.uploading = false;
    /////////////////////////////
    function update(){
      //Start uploading
      vm.uploading = true;
      //Upload file through http
      Upload.upload({
        url : "/Importer/uploadFile",
        file: vm.files,
        fields:{
          'uploadInfo': {
            'name' : vm.currentImporter.importerName,
            'location': vm.currentImporter.location,
            'description': vm.currentImporter.description
          }
        }
      }).progress(function(evt) {
        var progress = parseInt(100.0 * evt.loaded / evt.total);
        vm.fileUploadProgress = progress;
        if(progress >= 100){
          vm.waitingMessage = 'Waiting response from server';
        }
      }).success(function(data, status, headers, config) {
        //Upload importerInfo through socket
        var importerInfo = {
          'importerName' : vm.currentImporter.importerName,
          'location': vm.currentImporter.location,
          'files':[]
        };

        for(var i = 0; i < vm.files.length; i++){
          importerInfo.files.push({fileName:vm.files[i].name});
        }
        ImporterSocket.emit("updateImporter", importerInfo);
        console.log("uploadSuccess");
      }).error(function(err){
        alert(err);
      });


    }

    function cancel(){
      $modalInstance.dismiss('cancel');
    }

    function removeFile(file){
      var index = vm.files.indexOf(file);
      if(index !== -1){
        vm.files.splice(index, 1);
      }
    }
  }

  function DaveImporterListPageCtrl(FormSettingParseService, ImporterSocket, $scope, $timeout, $compile, $rootScope, $cookies, DirectiveService){
    var vm = this; //jshint ignore: line
    //functions
    vm.activate = activate;
    vm.addTableColumn = addTableColumn;
    vm.addTableColumnKeyPress = addTableColumnKeyPress;
    vm.closeAlert = closeAlert;
    vm.decreaseColumnIndex = decreaseColumnIndex;
    vm.increaseColumnIndex = increaseColumnIndex;
    vm.removeColumn = removeColumn;
    vm.requestImporter = requestImporter;
    vm.toggleLayOutMenu = toggleLayOutMenu;
    vm.toggleLeftMenu = toggleLeftMenu;
    vm.toggleSearchMode= toggleSearchMode;
    //variables
    vm.alerts = [];
    vm.avaliableImporterTableColumns =[];
    vm.importerListCurrentPage = 1;
    vm.importerList = [];
    vm.importerListTableColumns = [
      {name: "importerName", status: true, index: 0},
      {name:  "location", status: true, index: 1},
      {name: "ownerName", status: true, index: 2}  ,
      {name: "type", status: true, index: 3}  ,
      {name: "description", status:true, index: 4}
    ];
    vm.importerToRequest = '';
    vm.loading = true;
    vm.promiseToSolve = '';
    vm.search = {};
    vm.systemStatus = 'Normal';

    $scope.$on("socket:importerListData", function(event, data){
      console.log(event.name);
      if(vm.systemStatus === "Normal"){
        $timeout.cancel(vm.promiseToSolve);
        if(data.completeState !== 1.0){
          vm.importerList = vm.importerList.concat(data.list_out);
          // angular.element(".js-layout").addClass("hidden");
        } else {
          vm.importerList = vm.importerList.concat(data.list_out);
          vm.loading = false;
        }
      }
    });
    $scope.$watch(function(){
      return vm.search;
    }, function(){
      console.log(vm.search);
    }, true);

    vm.activate();
    ///////////////////////////////////
    function activate(){
      if($cookies.getObject('importerListTableColumns') === undefined){
        $cookies.putObject('importerListTableColumns', vm.importerListTableColumns);
      }
      vm.importerListTableColumns = $cookies.getObject('importerListTableColumns');
      vm.avaliableImporterTableColumns = $cookies.getObject('avaliableImporterTableColumns') || [];
      ImporterSocket.emit("requestImporterList");
      DirectiveService.CheckDirectiveExpandStatus('.importerContainerRightPanel');
      vm.promiseToSolve =  $timeout(function(){

        var alertExsited = false;
        for(var i = 0; i < vm.alerts.length; i ++){
          if(vm.alerts[i].msg === 'Loading Importer List Failed. Please Check Your Internet Connection.'){
            alertExsited = true;
          }
        }
        if(!alertExsited){
          vm.alerts.push({ type: 'danger', msg: 'Loading Importer List Failed. Please Check Your Internet Connection.' });
        }
        vm.systemStatus = "Error";
      },5000);
    }

    function addTableColumn(column, index){
      if(vm.avaliableImporterTableColumns.length !== 0){
        vm.importerListTableColumns[column.index - 1].status = true;
        vm.avaliableImporterTableColumns.splice(index, 1);
        $cookies.putObject('importerListTableColumns', vm.importerListTableColumns);
        $cookies.putObject('avaliableImporterTableColumns', vm.avaliableImporterTableColumns);
      } else {

      }
    }

    function addTableColumnKeyPress(event, column, index){
      console.log(column);
      if(event.keyCode === 13){
        if(column.index === column.newIndex){
          vm.addTableColumn(column, index);
        } else {
          if(column.newIndex > vm.importerListTableColumns.length){
            column.newIndex = vm.importerListTableColumns.length;
          }
          if(column.newIndex < 1){
            column.newIndex = 1;
          }
          vm.importerListTableColumns[column.index - 1].index = column.newIndex - 1;
          vm.importerListTableColumns[column.newIndex - 1].index = column.index - 1;
          var temp  = vm.importerListTableColumns[column.index - 1];
          vm.importerListTableColumns[column.index - 1] = vm.importerListTableColumns[column.newIndex - 1];
          vm.importerListTableColumns[column.newIndex - 1] = temp;
          column.index = column.newIndex;
          console.log(column);
          console.log(vm.avaliableImporterTableColumns);
          console.log(vm.importerListTableColumns);
          vm.addTableColumn(column, index);

        }
      }
      $cookies.putObject('importerListTableColumns', vm.importerListTableColumns);
      $cookies.putObject('avaliableImporterTableColumns', vm.avaliableImporterTableColumns);
    }

    function closeAlert(index){
      angular.element('div.alert.animated#importerList'+index).removeClass("fadeInDown");
      angular.element('div.alert.animated#importerList'+index).addClass("fadeOutUp");
      vm.alerts.splice(index, 1);
    }

    function decreaseColumnIndex(index){
      for(var i = index - 1; i >= 0; i--){
        if(vm.importerListTableColumns[i].status){
          var temp = vm.importerListTableColumns[index];
          temp.index = i;
          vm.importerListTableColumns[i].index = index;
          vm.importerListTableColumns[index] = vm.importerListTableColumns[i];
          vm.importerListTableColumns[i] = temp;
          break;
        }
      }

    }
    function increaseColumnIndex(index){
      for(var i = index + 1; i < vm.importerListTableColumns.length; i++){
        if(vm.importerListTableColumns[i].status){
          var temp = vm.importerListTableColumns[index];
          temp.index = i;
          vm.importerListTableColumns[i].index = index;
          vm.importerListTableColumns[index] = vm.importerListTableColumns[i];
          vm.importerListTableColumns[i] = temp;
          break;
        }
      }
    }

    function removeColumn(index){
      vm.importerListTableColumns[index].status = false;
      vm.avaliableImporterTableColumns.push({index: index + 1, value: vm.importerListTableColumns[index].name, newIndex : index + 1});
      console.log(vm.avaliableImporterTableColumns);
      $cookies.putObject('importerListTableColumns', vm.importerListTableColumns);
      $cookies.putObject('avaliableImporterTableColumns', vm.avaliableImporterTableColumns);
    }

    function requestImporter(importer){
      vm.importerToRequest = importer;

      var bindScope = $scope.$parent.$new(true);
      bindScope.importerToRequest = {};
      angular.copy(vm.importerToRequest, bindScope.importerToRequest);

      DirectiveService.DestroyDirectiveService('dave-importer-list-page', $scope);
      DirectiveService.AddDirectiveService('.importerContainerRightPanel', '<dave-importer-page class="angular-directive" importer-to-request="{{importerToRequest}}"></dave-importer-page>', bindScope, $compile);
    }

    function toggleLayOutMenu(){
      angular.element('.js-layout').toggleClass('hidden');
    }

    function toggleLeftMenu(){
      $scope.$emit("toggleLeftMenu");
    }

    function toggleSearchMode(){
      DirectiveService.EnterSearchMode('dave-importer-list-page', '<dave-importer-list-page></dave-importer-list-page>', '.importerContainerRightPanel', $scope, $compile);
    }
  }

  function DaveImporterPageCtrl(ImporterSocket, $scope, $timeout, $compile, $modal, $location, $cookies, DirectiveService){
    var vm = this;
    //functions
    vm.activate = activate;
    vm.backToImporterList = backToImporterList;
    vm.chooseDataItem = chooseDataItem;
    vm.closeAlert = closeAlert;
    vm.updateImporter = updateImporter;
    vm.viewMoreData = viewMoreData;
    //variables
    vm.alerts = [];
    vm.currentDataItem = '';
    $scope.expanded = false;
    vm.importerDataItemToDisplay = {};
    vm.importerDataItemData = [];
    vm.importerToDisplay = $scope.importerToRequest ? JSON.parse($scope.importerToRequest) : {};
    vm.importerToDisplayContent = [];
    vm.loading = false;
    vm.requestDataItemPromiseToSolve = null;
    vm.search = {
      'fieldName': ""
    };
    vm.systemStatus = 'Normal';
    vm.toggleLeftMenu = toggleLeftMenu;
    vm.toggleSearchMode= toggleSearchMode;

    $scope.$on("socket:importerData", function(event, data){
      console.log(event.name);
      if(vm.systemStatus === "Normal"){
        if(vm.currentDataItem === ''){
          vm.currentDataItem = data.list_out[0];
        }
        vm.importerToDisplayContent = vm.importerToDisplayContent.concat(data.list_out);

        if(data.completeState === 1.0){
          vm.loading = true;
          vm.importerToDisplayContent.forEach(function(element, index, array){
            ImporterSocket.emit("requestImporterDataItemData", {fieldName : element.fieldName, location: vm.importerToDisplay.location});
          });
          if(vm.requestDataItemPromiseToSolve === null){
            vm.requestDataItemPromiseToSolve = $timeout(function(){
              if(vm.alerts.indexOf({ type: 'danger', msg: 'Data Item Timeout' }) === -1){
                vm.alerts.push({ type: 'danger', msg: 'Data Item Timeout' });
              }
              vm.systemStatus = "Error";
            }, 3000);
          }
          if(vm.importerToDisplayContent.length === 0){
            var alertExsited = false;
            for(var i = 0; i < vm.alerts.length; i ++){
              if(vm.alerts[i].msg === 'Received Empty Importer'){
                alertExsited = true;
              }
            }
            if(!alertExsited){
              vm.alerts.push({ type: 'warning', msg: 'Received Empty Importer' });
            }
          }
        }

      }
    });

    $scope.$on("socket:importerDataItemData", function(event, dataItem){
      console.log(event.name);
      if(vm.systemStatus === "Normal"){
        $timeout.cancel(vm.requestDataItemPromiseToSolve);
        vm.loading = false;
        if(!vm.importerDataItemToDisplay[dataItem.name]){
          vm.importerDataItemToDisplay[dataItem.name] = [];
        }
        vm.importerDataItemToDisplay[dataItem.name] = vm.importerDataItemToDisplay[dataItem.name].concat(dataItem.data);

        if((dataItem.completeState === 1.0) && (dataItem.name === vm.currentDataItem.fieldName)){
          console.log(vm.importerDataItemToDisplay[vm.currentDataItem.fieldName].length);
          if(vm.importerDataItemToDisplay[vm.currentDataItem.fieldName].length === 0){
            vm.loading = true;
            if(vm.alerts.indexOf({ type: 'warning', msg: 'Received Empty Data Item' }) === -1){
              console.log("called");
              vm.alerts.push({ type: 'warning', msg: 'Received Empty Data Item' });
            }
            vm.systemStatus = "Error";
          } else {
            vm.importerDataItemData = vm.importerDataItemToDisplay[vm.currentDataItem.fieldName];
          }


        }

      }
    });

    vm.activate();
    ///////////////////////////////////
    function activate(){
      console.log($cookies.getObject('requestedImporter'));
      if($cookies.getObject('requestedImporter') === undefined){
        $cookies.putObject('requestedImporter', vm.importerToDisplay);
        console.log(vm.importerToDisplay);
      }
      vm.importerToDisplay = $cookies.getObject('requestedImporter');
      $cookies.remove('requestedImporter');
      ImporterSocket.emit("requestImporter", vm.importerToDisplay);
      DirectiveService.CheckDirectiveExpandStatus('.importerContainerRightPanel');
      vm.loading = true;
    }


    function backToImporterList(){
      var bindScope = $scope.$parent.$new(true);
      DirectiveService.DestroyDirectiveService('dave-importer-page', $scope);
      DirectiveService.AddDirectiveService('.importerContainerRightPanel','<dave-importer-list-page  class="angular-directive"></dave-importer-list-page>',bindScope, $compile);
    }
    function chooseDataItem(dataItem){
      vm.currentDataItem = dataItem;
      vm.importerDataItemData = vm.importerDataItemToDisplay[vm.currentDataItem.fieldName];
    }
    function closeAlert(index){
      angular.element('div.alert.animated#importer'+index).removeClass("fadeInDown");
      angular.element('div.alert.animated#importer'+index).addClass("fadeOutUp");
      vm.alerts.splice(index, 1);
    }
    function toggleLeftMenu(){
      $scope.$emit('toggleLeftMenu');
    }
    function updateImporter(){
      var updateImporterInterface = $modal.open({
        templateUrl:"Importer/ImporterModalViews/updateImporter.html",
        controller: "UpdateImporterModalCtrl as updateImporterModalCtrl",
        resolve :{
          currentImporter : function(){
            return vm.importerToDisplay;
          }
        }
      });

      updateImporterInterface.result.then(function(data){
        console.log(data);
      });
    }

    function viewMoreData(){
      console.log($location.url());
      $location.url('/DataItemDisplay');
      DirectiveService.DestroyDirectiveService('dave-importer-page', $scope);
    }

    function toggleSearchMode(){
      $cookies.putObject('requestedImporter', vm.importerToDisplay);
      DirectiveService.EnterSearchMode('dave-importer-page', '<dave-importer-page></dave-importer-page>', '.importerContainerRightPanel', $scope, $compile);
    }
  }

  function DaveImporterConfigurationPageCtrl($scope, $compile, ImporterSocket, DirectiveService){
    var vm = this;

    //functions
    vm.cancelImport = cancelImport;
    vm.decideImport = decideImport;
    //variables
    console.log($scope.formCollection);
    vm.formCollection = JSON.parse($scope.formCollection);
    vm.importerCreationMeta = JSON.parse($scope.importerCreationMeta);

    ///////////////////////////////

    function cancelImport(){
      var bindScope = $scope.$parent.$new(true);
      DirectiveService.DestroyDirectiveService('dave-importer-configuration-page', angular.element('dave-importer-configuration-page').isolateScope());
      DirectiveService.AddDirectiveService('.importerContainerRightPanel','<dave-importer-list-page  class="angular-directive"></dave-importer-list-page>',bindScope, $compile);
    }


    function decideImport(){
      var finalFormToUpload = [];
      for(var key in vm.formCollection){
        var temp = {
          availableOptions:{}
        };
        for(var key2 in vm.formCollection[key]){
          switch(key2){
            case "fields":
            break;
            case "checked":
            temp.checked = vm.formCollection[key][key2];
            break;
            default:
            temp.availableOptions[key2] = { name: key2, value:(vm.formCollection[key][key2])} ;
            break;
          }
        }
        temp.fieldName = key;
        finalFormToUpload.push(temp);
      }
      console.log(finalFormToUpload);
      ImporterSocket.emit('decideImporterCreation',{
        location : vm.importerCreationMeta.location,
        importerName: vm.importerCreationMeta.importerName,
        userName:vm.importerCreationMeta.userName,
        files:vm.importerCreationMeta.files,
        data:finalFormToUpload,
        description:vm.importerCreationMeta.description }
      );
      var progressingStatTemp =  [0, 1];
      $scope.$emit('progressing', progressingStatTemp);

      DirectiveService.DestroyDirectiveService('dave-importer-configuration-page',  angular.element('dave-importer-configuration-page').isolateScope());

      // $http.post("/Importer/decideImport", finalFormToUpload).
      // success(function(data, status, headers, config) {
      //   // this callback will be called asynchronously
      //   // when the response is available
      //   vm.stepOne = false;
      //   vm.stepTwo = false;
      //   vm.stepTwoB = true;
      //   vm.stepThree = false;
      //   vm.fileUploadProgress = 0;
      // }).
      // error(function(data, status, headers, config) {
      //   // called asynchronously if an error occurs
      //   // or server returns response with an error status.
      //   alert("Something Wents Wrong");
      // });

    }
  }

  function DaveImporterSearchModePageCtrl($scope, $compile,$cookies, ImporterSocket, DirectiveService, generalStateWRS){
    var vm = this;
    console.log($scope.options);
    //functions
    vm.activate = activate;
    vm.back = back;
    vm.hasMenu = '';
    console.log(vm.hasMenu);
    vm.toggleLeftMenu = toggleLeftMenu;
    //variables
    vm.backDirective = $scope.backDirective;
    vm.targetContainer = $scope.targetContainer;
    console.log($scope.targetContainer);
    console.log(vm.targetContainer);
    vm.activate();
    //////////////////////////
    function activate(){
      DirectiveService.CheckDirectiveExpandStatus('.importerContainerRightPanel');
      vm.searchableColumns = $cookies.getObject('importerListTableColumns');
      vm.hasMenu = generalStateWRS.readState('hasMenu');
    }

    function back(){
      var bindScope = $scope.$parent.$new(true);
      DirectiveService.DestroyDirectiveService('dave-importer-search-mode-page', $scope);
      DirectiveService.AddDirectiveService(vm.targetContainer, vm.backDirective, bindScope, $compile);
    }

    function toggleLeftMenu(){
      $scope.$emit('toggleLeftMenu');
    }


  }
})();
