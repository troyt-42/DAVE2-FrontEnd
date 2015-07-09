(function(){'use strict';
angular
.module("Dave2.Importer")
.controller("ImporterUploadCtrl" ,ImporterUploadCtrl)
.controller("UpdateImporterModalCtrl", UpdateImporterModalCtrl);

ImporterUploadCtrl.$inject = [
  "$timeout",
  "$http",
  "$scope",
  "$modal",
  "Upload",
  "FormSettingParseService",
  "ImporterSocket"
];

UpdateImporterModalCtrl.$inject = [
  "$scope",
  "$modalInstance",
  "currentImporter",
  "Upload",
  "ImporterSocket"
];

function ImporterUploadCtrl($timeout, $http, $scope,$modal, Upload, FormSettingParseService, ImporterSocket){
  var vm = this;

  //functions
  vm.activate = activate;
  vm.addTableColumn = addTableColumn;
  vm.addTableColumnKeyPress = addTableColumnKeyPress;
  vm.backToImporterList = backToImporterList;
  vm.cancelFile = cancelFile;
  vm.cancelImport = cancelImport;
  vm.changeDataItemConfig = changeDataItemConfig;
  vm.chooseDataItem = chooseDataItem;
  vm.closeAlert = closeAlert;
  vm.dataItemListClass = dataItemListClass;
  vm.decideImport = decideImport;
  vm.decreaseColumnIndex = decreaseColumnIndex;
  vm.increaseColumnIndex = increaseColumnIndex;
  vm.requestImporter = requestImporter;
  vm.removeFile = removeFile;
  vm.removeColumn = removeColumn;
  vm.submitFile = submitFile;
  vm.toggleLayOutMenu = toggleLayOutMenu;
  vm.toggleLeftMenu = toggleLeftMenu;
  vm.toggleSearchMode = toggleSearchMode;
  vm.updateImporter = updateImporter;
  //variables
  vm.alerts = {
    "stepOne":[],
    "stepTwoB" :[]
  };
  vm.avaliableTableColumns =[];
  vm.currentDataItem = "Fermenter Sample HPLC Ethanol";


  vm.formModel={};
  vm.fileUploadProgress = 0;
  vm.importerList = [];
  vm.importerListCurrentPage = 1;
  vm.stepOneSearchMode = false;
  vm.stepOneSearchModeInput = {};
  vm.importerToDisplay = {};
  vm.importerToDisplayContent = [];

  vm.importerDataItemToDisplay = {};
  vm.importerDataItemData = [];
  vm.importerListTableColumns = [
    {name: "importerName", status: true, index: 0},
    {name:  "location", status: true, index: 1},
    {name: "ownerName", status: true, index: 2}  ,
    {name: "type", status: true, index: 3}  ,
    {name: "description", status:true, index: 4}
  ];

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


  vm.search = {};
  vm.search2 = {fieldName: ''};

  vm.systemStatus = "Normal";
  vm.optionStatus = {
    firstOpen : true,
    secondOpen: false,
    thirdOpen: false,
    fourthOpen: false
  };

  vm.formFields = [
    {
      type:"input",
      key:"Name"
    },
    {
      type:"input",
      key:"Location"
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

  $scope.$watch(function(){
    return vm.stepOne;
  }, function(newValue){
    if(newValue === true){
      $scope.$emit("dynamicBackground");
    } else if ( newValue === false){
      $scope.$emit("removeDynamicBackground");
    }
  });

  ImporterSocket.on("importerListData", function(data){
    if(vm.systemStatus === "Normal"){
      $timeout.cancel(vm.promiseToSolve);
      console.log('called');
      if(data.length !== 0){
        vm.importerList = vm.importerList.concat(data);
        vm.stepOneLoading = false;
        angular.element(".js-layout").addClass("hidden");
      } else {
        // if(vm.importerList.length < 250){
        //   vm.alerts.stepOne = [{ type: 'warning', msg: 'Load Item Incomplete.' }];
        // }
        console.log(vm.importerList);
      }
    }
  });

  ImporterSocket.on("importerData", function(data){
    if(vm.systemStatus === "Normal"){
      $timeout.cancel(vm.requestImporterPromiseToSolve);
      if(data.length !== 0){
        vm.currentDataItem = data[0];
        console.log(data[0]);
        vm.stepOne = false;
        vm.stepTwo = false;
        vm.stepTwoB = true;
        vm.stepThree = false;
        vm.importerToDisplayContent = data;
      } else if (data.length === 0){
        console.log(vm.importerToDisplayContent);
        vm.importerToDisplayContent.forEach(function(element, index, array){
          ImporterSocket.emit("requestImporterDataItemData", {fieldName : element.fieldName, location: vm.importerToDisplay.location});
        });
        if(vm.importerToDisplayContent.length === 0){
          var alertExsited = false;
          for(var i = 0; i < vm.alerts.stepOne.length; i ++){
            if(vm.alerts.stepOne[i].msg === 'Received Empty Importer'){
              alertExsited = true;
            }
          }
          if(!alertExsited){
            vm.alerts.stepOne.push({ type: 'warning', msg: 'Received Empty Importer' });
          }
        }
      }
    }
  });

  ImporterSocket.on("importerDataItemData", function(dataItem){
    if(vm.systemStatus === "Normal"){
      if(dataItem.data.length !== 0){
        if(!vm.importerDataItemToDisplay[dataItem.name]){
          vm.importerDataItemToDisplay[dataItem.name] = [];
        }
        vm.importerDataItemToDisplay[dataItem.name] = vm.importerDataItemToDisplay[dataItem.name].concat(dataItem.data);
      } else if (dataItem.data.length === 0){
        if((vm.importerDataItemToDisplay[vm.currentDataItem.fieldName].length) && (vm.importerDataItemData.length === 0)){
          vm.importerDataItemData = vm.importerDataItemToDisplay[vm.currentDataItem.fieldName];
          console.log(vm.importerDataItemData);
        }
      }
    }
  });

  var temp = []; //temporary var for importerCreationResponse event
  ImporterSocket.on("importerCreationResponse", function(response){
    if(vm.systemStatus === "Normal"){
      vm.fileUploadProgress = 0;
      if(response.data.length !== 0){
        temp = temp.concat(response.data);
      } else {
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
        vm.stepOne = false;
        vm.stepTwo = false;
        vm.stepTwoB = false;
        vm.stepThree = true;
      }
    }

  });

  ImporterSocket.on("importerCreationFinalResponse", function(response){
    if(vm.systemStatus === "Normal"){
      console.log(response);
      if(response.reply === "SUCCESS"){
        vm.fileUploadProgress = response.payload.status * 100;
        if(response.list_out !== 0){
          vm.importerToDisplay = {
            importerName: response.importerName,
            location: response.location,
            ownerName: response.ownerName
          };
          vm.currentDataItem = response.list_out[0];
          vm.stepOne = false;
          vm.stepTwo = false;
          vm.stepTwoB = true;
          vm.stepThree = false;
          vm.importerToDisplayContent = response.list_out;
          vm.importerToDisplayContent.forEach(function(element, index, array){
            ImporterSocket.emit("requestImporterDataItemData", {fieldName : element.fieldName, location: vm.importerToDisplay.location});
          });
        } else {
          if(vm.importerToDisplayContent.length === 0){
            var alertExsited = false;
            for(var i = 0; i < vm.alerts.stepThree.length; i ++){
              if(vm.alerts.stepThree[i].msg === 'Created Empty Importer'){
                alertExsited = true;
              }
            }
            if(!alertExsited){
              vm.alerts.stepThree.push({ type: 'warning', msg: 'Created Empty Importer' });
            }
          }
        }
      }
      if(response.reply === "PROGRESSING"){
        vm.fileUploadProgress = response.payload.status * 100;
      }
    }
  });
  vm.activate();

  ///////////////////////////

  function activate(){
    ImporterSocket.emit("requestImporterList");
    angular.element(".importerContainerRightPanel").addClass('fadeIn');
    vm.importerList = [];
    vm.promiseToSolve =  $timeout(function(){

      var alertExsited = false;
      for(var i = 0; i < vm.alerts.stepOne.length; i ++){
        if(vm.alerts.stepOne[i].msg === 'Loading Importer List Failed. Please Check Your Internet Connection.'){
          alertExsited = true;
        }
      }
      if(!alertExsited){
        vm.alerts.stepOne.push({ type: 'danger', msg: 'Loading Importer List Failed. Please Check Your Internet Connection.' });
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
  function backToImporterList(){
    vm.stepOne = true;
    vm.stepTwo = false;
    vm.stepTwoB = false;
    vm.stepThree = false;
    vm.currentDataItem = '';
    vm.importerToDisplay = {};
    vm.importerToDisplayContent = [];
    vm.importerDataItemToDisplay = {};
    vm.importerDataItemData = [];
    vm.activate();

  }

  function cancelFile(){
    vm.formModel= {};
  }

  function cancelImport(){
    vm.stepOne = true;
    vm.stepTwo = false;
    vm.stepTwoB = false;
    vm.stepThree = false;
    vm.fileUploadProgress = 0;
    vm.waitingMessage = 'File Uploading';
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

  function chooseDataItem(dataItem){
    vm.currentDataItem = dataItem;
    vm.importerDataItemData = vm.importerDataItemToDisplay[vm.currentDataItem.fieldName];
  }

  function closeAlert(index, position){
    angular.element('div.alert.animated#'+position+index).removeClass("fadeInDown");
    angular.element('div.alert.animated#'+position+index).addClass("fadeOutUp");
    vm.alerts[position].splice(index, 1);
  }

  function dataItemListClass(dataItem){
    return (dataItem.fieldName === vm.currentDataItem.fieldName) ? 'active': '';
  }

  function decideImport(){
    var finalFormToUpload = [];
    console.log(vm.stepThreeFormCollection);
    for(var key in vm.stepThreeFormCollection){
      var temp = {
        availableOptions:{}
      };
      for(var key2 in vm.stepThreeFormCollection[key]){
        switch(key2){
          case "fields":
          break;
          case "checked":
          temp.checked = vm.stepThreeFormCollection[key][key2];
          break;
          default:
          temp.availableOptions[key2] = { name: key2, value:(vm.stepThreeFormCollection[key][key2])} ;
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
    vm.stepOne = false;
    vm.stepTwo = true;
    vm.stepTwoB = false;
    vm.stepThree = false;
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
    console.log(finalFormToUpload);
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

  function removeFile(file){
    var index = vm.formModel.Browse.indexOf(file);
    if(index !== -1){
      vm.formModel.Browse.splice(index, 1);
      console.log(vm.formModel);
    }
  }
  function requestImporter(importer){
    console.log(importer);
    vm.importerToDisplay = importer;
    ImporterSocket.emit("requestImporter", importer);
    if((vm.systemStatus === 'Normal') && (vm.requestImporterPromiseToSolve === null)){
      vm.requestImporterPromiseToSolve = $timeout(function(){
        if(vm.alerts.stepOne.indexOf({ type: 'danger', msg: 'Timeout' }) === -1){
          vm.alerts.stepOne.push({ type: 'danger', msg: 'Timeout' });
        }
        vm.systemStatus = "Error";
      }, 1500);
    }
  }

  function submitFile(){
    vm.stepOne = false;
    vm.stepTwo = true;
    vm.stepTwoB = false;
    vm.stepThree = false;
    var uploadfile = vm.formModel.Browse;
    console.log(uploadfile);

    if(uploadfile !== {}){

      var importerInfo = {
        'importerName' : vm.formModel.Name,
        'files':[],
        'location': vm.formModel.Location,
        'description': vm.formModel.Description,
        'userName': 'troy'

      };

      for(var i = 0; i < vm.formModel.Browse.length; i++){
        importerInfo.files.push({fileName:vm.formModel.Browse[i].name});
      }
      //Upload file through http
      Upload.upload({
        url : "/Importer/uploadFile",
        file: uploadfile,
        fields:{
          'uploadInfo': {
            'name' : vm.formModel.Name,
            'location': vm.formModel.Location,
            'description': vm.formModel.Description
          }
        }
      }).progress(function(evt) {
        var progress = parseInt(100.0 * evt.loaded / evt.total);
        console.log(progress);
        vm.fileUploadProgress = progress;
        if(progress >= 100){
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

  function toggleLayOutMenu(){
    angular.element(".js-layout").toggleClass("hidden");
  }
  function toggleLeftMenu(){
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
  }

  function toggleSearchMode(){
    vm.stepOneSearchMode = vm.stepOneSearchMode ? false : true;
    angular.element("#js-pagination").toggleClass("rotateInUpLeft");
    angular.element("#js-pagination").toggleClass("rotateOutDownLeft");
    console.log(angular.element("#js-search-sign").html());
    if(angular.element("#js-search-sign").html() === " Search Mode"){
      angular.element("#js-search-sign").html(" Importer List");
    } else if(angular.element("#js-search-sign").html() === " Importer List"){
      angular.element("#js-search-sign").html(" Search Mode");
    }
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

})();
