(function(){'use strict';
angular
.module("Dave2App.Importer")
.controller("ImporterUploadCtrl" ,ImporterUploadCtrl);

ImporterUploadCtrl.$inject = [
  "$timeout",
  "$http",
  "$scope",
  "Upload",
  "FormSettingParseService",
  "ImporterSocket"
];

function ImporterUploadCtrl($timeout, $http, $scope,Upload, FormSettingParseService, ImporterSocket){
  var vm = this;

  vm.submitFile = submitFile;
  vm.cancelFile = cancelFile;
  vm.cancelImport = cancelImport;
  vm.decideImport = decideImport;

  vm.stepOne = true;
  vm.stepTwo = false;
  vm.stepTwoB = false;
  vm.stepThree = false;

  vm.formModel={};
  vm.fileUploadProgress = 0;
  vm.availableFields = {};
  vm.importerList = {};
  vm.importerListCurrentPage = 1;
  vm.search = {};
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



  $scope.$watch(function(){
    return vm.stepOne;
  }, function(newValue){
    if(newValue === true){
      $scope.$emit("dynamicBackground");
    } else if ( newValue === false){
      $scope.$emit("removeDynamicBackground");
    }
  });

  $scope.$on("stepTwo",function(){
    vm.stepOne = false;
    vm.stepTwo = true;
    vm.stepTwoB = false;
    vm.stepThree = false;
  });


  $scope.$on("uploadProgress", function(event, data){
    console.log(data);
    vm.fileUploadProgress = data;
    if(data >= 100){
      $timeout(function(){
        vm.stepOne = false;
        vm.stepTwo = false;
        vm.stepTwoB = false;
        vm.stepThree = true;
      }, 1000);
    }
  });

  activate();

  ///////////////////////////

  function submitFile(){
    console.log(vm.formModel);
    var uploadfile = vm.formModel["Select A File"][0];
    console.log(uploadfile);

    if(uploadfile !== {}){

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
        $scope.$emit("uploadProgress", progress);
      }).success(function(data, status, headers, config) {


        vm.stepThreeFormCollection = FormSettingParseService(data); // jshint ignore:line

        console.log(vm.stepThreeFormCollection);
      }).error(function(err){
        alert(err);
      });
    } else {
      alert("Please Select A File");
    }
    $scope.$emit("stepTwo");
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
  }

  function decideImport(){
    var finalFormToUpload = {};
    console.log(vm.stepThreeFormCollection);
    for(var key in vm.stepThreeFormCollection){
      finalFormToUpload[key] = {};
      for(var key2 in vm.stepThreeFormCollection[key]){
        switch(key2){
          case "fields":
          break;
          default:
          finalFormToUpload[key][key2] = vm.stepThreeFormCollection[key][key2];
          break;
        }
      }
    }
    console.log(finalFormToUpload);
    $http.post("/Importer/decideImport", finalFormToUpload).
    success(function(data, status, headers, config) {
      // this callback will be called asynchronously
      // when the response is available
      alert("Importer Has Been Created");
      vm.stepOne = true;
      vm.stepTwo = false;
      vm.stepTwoB = false;
      vm.stepThree = false;
    }).
    error(function(data, status, headers, config) {
      // called asynchronously if an error occurs
      // or server returns response with an error status.
      alert("Something Wents Wrong");
    });
  }

  function activate(){
    $http.get("/Importer/gettable")
    .success(function(data, status, header, config){
      vm.importerList = data;
    })
    .error(function(data, status, header, config){
      console.log("error: " + status);
    });

  }
}
})();
