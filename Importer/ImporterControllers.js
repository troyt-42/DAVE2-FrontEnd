(function(){'use strict';
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
  "Upload",
  "FormSettingParseService",
  "ImporterSocket",
  'DirectiveService'
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
  'DirectiveService'
];

DaveImporterPageCtrl.$inject = [
  'ImporterSocket',
  '$scope',
  '$timeout',
  '$compile',
  '$modal',
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
    'ImporterSocket',
    'DirectiveService'
];

function ImporterUploadCtrl($timeout, $http, $scope,$modal,$compile,$interval, Upload, FormSettingParseService, ImporterSocket, DirectiveService){
  var vm = this;
  //functions

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
      key:"Minimum Slope",
      data:{
        inputType: "number",
        placeholder: 0
      }
    },
    {
      type:"input",
      key:"Reduction (/mm)",
      data:{
        inputType: "number",
        placeholder: 0
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
    "Minimum Slope" : 0,
    "Reduction (/mm)" : 1000,
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
    {
      type:"input3",
      key:"Browse",
      data:{
        inputType:"file"
      },
      ngModelAttrs:{
        fileAccept:{
          attribute:"accept"
        },
        fileUploaderMarkup:{
          attribute:"ngf-select"
        },
        fileUploaderMultipleMarkup:{
          attribute:"ngf-multiple"
        }
      },
      templateOptions:{
        fileAccept:".csv",
        fileUploaderMarkup: "",
        fileUploaderMultipleMarkup: true
      },
      expressionProperties:{
        "templateOptions.disabled":"!(model.Name || model.Location || model.Description)"
      }
    }
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


  ///////////////////////////




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
    var index = vm.createNewImporterFormModel.Browse.indexOf(file);
    if(index !== -1){
      vm.createNewImporterFormModel.Browse.splice(index, 1);
      console.log(vm.formModel);
    }
  }


  function submitFile(){
    var uploadfile = vm.createNewImporterFormModel.Browse;
    console.log(uploadfile);
    if(uploadfile !== {}){

      var importerInfo = {
        'importerName' : vm.createNewImporterFormModel.Name,
        'files':[],
        'location': vm.createNewImporterFormModel.Location,
        'description': vm.createNewImporterFormModel.Description,
        'userName': 'troy'

      };

      for(var i = 0; i < vm.createNewImporterFormModel.Browse.length; i++){
        importerInfo.files.push({fileName:vm.createNewImporterFormModel.Browse[i].name});
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
      alert("Please Browse");
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

function DaveImporterListPageCtrl(FormSettingParseService, ImporterSocket, $scope, $timeout, $compile, $rootScope, DirectiveService){
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
  vm.avaliableTableColumns =[];
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

  ImporterSocket.on("importerListData", function(data){
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

  $scope.$on('$destroy', function (event) {
      ImporterSocket.removeListener('importerListData');
  });
  vm.activate();
  ///////////////////////////////////
  function activate(){
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
    if(vm.avaliableTableColumns.length !== 0){
      vm.importerListTableColumns[column.index - 1].status = true;
      vm.avaliableTableColumns.splice(index, 1);
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
        console.log(vm.avaliableTableColumns);
        console.log(vm.importerListTableColumns);
        vm.addTableColumn(column, index);

      }
    }
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
    vm.avaliableTableColumns.push({index: index + 1, value: vm.importerListTableColumns[index].name, newIndex : index + 1});
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
    var bindScope = $scope.$parent.$new(true);
    DirectiveService.DestroyDirectiveService('dave-importer-list-page', $scope);
    DirectiveService.AddDirectiveService('.importerContainerRightPanel', '<dave-importer-search-mode-page class="angular-directive" ></dave-importer-search-mode-page>', bindScope, $compile);

  }
}

function DaveImporterPageCtrl(ImporterSocket, $scope, $timeout, $compile, $modal, DirectiveService){
  var vm = this;
  //functions
  vm.activate = activate;
  vm.backToImporterList = backToImporterList;
  vm.chooseDataItem = chooseDataItem;
  vm.updateImporter = updateImporter;
  //variables
  vm.alerts = [];
  vm.currentDataItem = '';
  $scope.expanded = false;
  vm.importerDataItemToDisplay = {};
  vm.importerDataItemData = [];
  vm.importerToDisplay = JSON.parse($scope.importerToRequest);
  vm.importerToDisplayContent = [];
  vm.requestImporterPromiseToSolve = null;
  vm.search = {
    'fieldName': ""
  };
  vm.systemStatus = 'Normal';
  vm.toggleLeftMenu = toggleLeftMenu;
  ImporterSocket.on("importerData", function(data){
    if(vm.systemStatus === "Normal"){
      $timeout.cancel(vm.requestImporterPromiseToSolve);
      if(vm.currentDataItem === ''){
        vm.currentDataItem = data.list_out[0];
      }
      vm.importerToDisplayContent = vm.importerToDisplayContent.concat(data.list_out);

      if(data.completeState === 1.0){
        vm.importerToDisplayContent.forEach(function(element, index, array){
          ImporterSocket.emit("requestImporterDataItemData", {fieldName : element.fieldName, location: vm.importerToDisplay.location});
        });
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

  ImporterSocket.on("importerDataItemData", function(dataItem){
    if(vm.systemStatus === "Normal"){
      if(!vm.importerDataItemToDisplay[dataItem.name]){
        vm.importerDataItemToDisplay[dataItem.name] = [];
      }
      vm.importerDataItemToDisplay[dataItem.name] = vm.importerDataItemToDisplay[dataItem.name].concat(dataItem.data);

      if((dataItem.completeState === 1.0) && (dataItem.name === vm.currentDataItem.fieldName)){
        vm.importerDataItemData = vm.importerDataItemToDisplay[vm.currentDataItem.fieldName];

      }

    }
  });
  $scope.$on('$destroy', function (event) {
      ImporterSocket.removeListener('importerData');
      ImporterSocket.removeListener('importerDataItemData');
  });
  vm.activate();
  ///////////////////////////////////
  function activate(){
    ImporterSocket.emit("requestImporter", vm.importerToDisplay);
    DirectiveService.CheckDirectiveExpandStatus('.importerContainerRightPanel');
    if((vm.systemStatus === 'Normal') && (vm.requestImporterPromiseToSolve === null)){
      vm.requestImporterPromiseToSolve = $timeout(function(){
        if(vm.alerts.indexOf({ type: 'danger', msg: 'Timeout' }) === -1){
          vm.alerts.push({ type: 'danger', msg: 'Timeout' });
        }
        vm.systemStatus = "Error";
      }, 1500);
    }
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

function DaveImporterSearchModePageCtrl($scope, $compile, ImporterSocket, DirectiveService, importerListColumnNamesConversion){
  var vm = this;

  //functions
  vm.toggleLeftMenu = toggleLeftMenu;
  //variables
  vm.searchableColumns = [
    {name: "importerName", status: true, index: 0},
    {name:  "location", status: true, index: 1},
    {name: "ownerName", status: true, index: 2}  ,
    {name: "type", status: true, index: 3}  ,
    {name: "description", status:true, index: 4}
  ];

  //////////////////////////
  function toggleLeftMenu(){
    $scope.$emit('toggleLeftMenu');
  }
}
})();
