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
  vm.removeFile = removeFile;
  vm.submitFile = submitFile;

  //variables
  vm.alerts = {
    "stepOne":[],
    "stepTwoB" :[]
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
      type:"input",
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
    if(vm.systemStatus === "Normal"){
      $timeout.cancel(vm.promiseToSolve);
      if(data.length !== 0){
        vm.importerList = vm.importerList.concat(data);
        vm.stepOneLoading = false;
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
      if(response.reply === "SUCCESS"){
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
    }
  });
  activate();

  ///////////////////////////

  function activate(){
    ImporterSocket.emit("requestImporterList");
    angular.element(".importerContainerLeftMenu").addClass('fadeInLeft');
    angular.element(".importerContainerRightPanel").addClass('fadeIn');

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
    angular.element('div.alert.animated#'+position+index).removeClass("fadeInDown");
    angular.element('div.alert.animated#'+position+index).addClass("fadeOutUp");
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
  }


  function removeFile(file){
    var index = vm.formModel.Browse.indexOf(file);
    if(index !== -1){
      vm.formModel.Browse.splice(index, 1);
      console.log(vm.formModel);
    }
    if(vm.formModel.Browse.length === 0){
      angular.element("#formly_1_input_Browse_3").val("");
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
            'filename': vm.formModel.Browse[0].name,
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
}
})();
