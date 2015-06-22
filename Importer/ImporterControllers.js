(function(){'use strict';
angular
.module("Dave2.Importer")
.controller("ImporterUploadCtrl" ,ImporterUploadCtrl);

ImporterUploadCtrl.$inject = [
  "$timeout",
  "$http",
  "$scope",
  "$modal",
  "Upload",
  "FormSettingParseService",
  "ImporterSocket"
];


function ImporterUploadCtrl($timeout, $http, $scope,$modal, Upload, FormSettingParseService, ImporterSocket){
  var vm = this;

  //functions
  vm.backToImporterList = backToImporterList;
  vm.cancelFile = cancelFile;
  vm.cancelImport = cancelImport;
  vm.changeDataItemConfig = changeDataItemConfig;
  vm.chooseDataItem = chooseDataItem;
  vm.closeAlert = closeAlert;
  vm.decideImport = decideImport;
  vm.requestImporter = requestImporter;
  vm.submitFile = submitFile;

  //variables
  vm.alerts = {
    "stepOne":[],
    "stepTwoB" :[
      { type: 'warning', msg: 'Lost Connection (still can manipulate cached data)' }
    ]
  };
  vm.availableFields = {};

  vm.currentDataItem = "Fermenter Sample HPLC Ethanol";


  vm.formModel={};
  vm.fileUploadProgress = 0;
  vm.importerList = [];
  vm.importerListCurrentPage = 1;
  vm.importerToDisplay = {};
  vm.importerToDisplayContent = [];

  vm.importerDataItemToDisplay = {};
  vm.importerDataItemData = [];
  vm.stepOne = true;
  vm.stepTwo = false;
  vm.stepTwoB = false;
  vm.stepThree = false;

  vm.stepOneLoading = true;

  vm.stepThreeFormCollection = [];



  vm.sampleDataQuantity = 50;
  vm.sampleDataReduction = 50;


  vm.search = {};
  vm.search2 = '';

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
      type:"input",
      key:"Select A File",
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
        fileUploaderOnChangeMarkup:{
          attribute:"ngf-change"
        },
        fileUploaderModelMarkup:{
          attribute:"ng-model"
        }
      },
      templateOptions:{
        fileAccept:".csv",
        fileUploaderMarkup: "",
        fileUploaderOnChangeMarkup:"fileSelected($files, $event)",
        fileUploaderModelMarkup:"uploadfile"
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

  $scope.$watch(function(){
    return vm.sampleDataReduction;
  }, function(newValue){
    if(newValue <= 10){
      vm.sampleDataReductionString = "1 Hour";
    } else if ((newValue > 10) && (newValue <= 20)){
      vm.sampleDataReductionString = "2 Hour";
    } else if ((newValue > 20) && (newValue <= 30)){
      vm.sampleDataReductionString = "3 Hour";
    } else if ((newValue > 30) && (newValue <= 40)){
      vm.sampleDataReductionString = "4 Hour";
    } else if ((newValue > 40) && (newValue <= 50)){
      vm.sampleDataReductionString = "5 Hour";
    } else if ((newValue > 50) && (newValue <= 60)){
      vm.sampleDataReductionString = "6 Hour";
    } else if ((newValue > 60) && (newValue <= 70)){
      vm.sampleDataReductionString = "7 Hour";
    } else if ((newValue > 70) && (newValue <= 80)){
      vm.sampleDataReductionString = "8 Hour";
    } else if ((newValue > 80) && (newValue <= 90)){
      vm.sampleDataReductionString = "9 Hour";
    } else if ((newValue > 90) && (newValue <= 100)){
      vm.sampleDataReductionString = "10 Hour";
    }
  });

  ImporterSocket.on("importerListData", function(data){
    $timeout.cancel(importerListPromise);
    if(data.length !== 0){
      vm.importerList = vm.importerList.concat(data);
      vm.stepOneLoading = false;
    } else {
      // if(vm.importerList.length < 250){
      //   vm.alerts.stepOne = [{ type: 'warning', msg: 'Load Item Incomplete.' }];
      // }
      vm.alerts.stepOne.push({ type: 'success', msg: 'Load Item Success.' });
      console.log(vm.importerList);
    }

  });

  ImporterSocket.on("importerData", function(data){
    if(data.length !== 0){
      vm.currentDataItem = data[0];
      vm.stepOne = false;
      vm.stepTwo = false;
      vm.stepTwoB = true;
      vm.stepThree = false;
      vm.importerToDisplayContent = data;
    } else if (data.length === 0){
      vm.importerToDisplayContent.forEach(function(element, index, array){
        ImporterSocket.emit("requestImporterDataItemData", {fieldName : element.fieldName, location: vm.importerToDisplay.location});
      });
    }
  });

  ImporterSocket.on("importerDataItemData", function(dataItem){
    if(dataItem.data.length !== 0){
      if(!vm.importerDataItemToDisplay[dataItem.name]){
        vm.importerDataItemToDisplay[dataItem.name] = [];
      }
      vm.importerDataItemToDisplay[dataItem.name] = vm.importerDataItemToDisplay[dataItem.name].concat(dataItem.data);
    } else if (dataItem.data.length === 0){
      vm.importerDataItemData = vm.importerDataItemToDisplay[vm.currentDataItem.fieldName];
      console.log(vm.importerDataItemData);
    }
  });

  var temp = []; //temporary var for importerCreationResponse event
  ImporterSocket.on("importerCreationResponse", function(response){
    if(response.data.length !== 0){
      temp = temp.concat(response.data);
    } else {
      console.log(vm.stepThreeFormCollection);
      vm.stepThreeFormCollection = FormSettingParseService(temp); //jshint ignore:line
      vm.importerCreationMeta = {
        importerName : response.importerName,
        location : response.location,
        userName : response.userName
      };
      temp = [];
      vm.stepOne = false;
      vm.stepTwo = false;
      vm.stepTwoB = false;
      vm.stepThree = true;
    }


  });

  var importerListPromise = activate();

  ///////////////////////////

  function activate(){
    ImporterSocket.emit("requestImporterList");
    angular.element(".importerContainerLeftMenu").toggleClass('fadeInLeft');
    angular.element(".importerContainerRightPanel").toggleClass('fadeInRight');

    return $timeout(function(){
      vm.alerts.stepOne.push({ type: 'danger', msg: 'Load Item Fails. Please Check Your Internet Connect.' });
    },10000);
  }

  function backToImporterList(){
    vm.stepOne = true;
    vm.stepTwo = false;
    vm.stepTwoB = false;
    vm.stepThree = false;
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
    vm.alerts[position].splice(index, 1);
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
      data:finalFormToUpload }
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
  }

  function requestImporter(importer){
    console.log(importer);
    vm.importerToDisplay = importer;
    ImporterSocket.emit("requestImporter", importer);
  }

  function submitFile(){
    angular.element(".importerContainerLeftMenu").toggleClass('fadeInLeft');
    angular.element(".importerContainerLeftMenu").toggleClass('fadeOutLeft');

    vm.stepOne = false;
    vm.stepTwo = true;
    vm.stepTwoB = false;
    vm.stepThree = false;
    console.log(vm.formModel);
    var uploadfile = vm.formModel["Select A File"][0];
    console.log(uploadfile);

    if(uploadfile !== {}){
      var importerInfo = {
        'importerName' : vm.formModel.Name,
        'fileName': vm.formModel["Select A File"][0].name,
        'location': vm.formModel.Location,
        'description': vm.formModel.Description,
        'userName': 'troy'

      };
      //Upload file through http
      Upload.upload({
        url : "/Importer/uploadFile",
        file: uploadfile,
        fields:{
          'uploadInfo': {
            'name' : vm.formModel.Name,
            'filename': vm.formModel["Select A File"][0].name,
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
      alert("Please Select A File");
    }
  }
}
})();
