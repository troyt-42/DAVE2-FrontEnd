var ImporterControllers = angular.module("ImporterApp");

ImporterControllers.controller("ImporterUploadCtrl", ["$timeout", "$http","$scope", "Upload","FormSettingParseService", function($timeout, $http, $scope,Upload,FormSettingParseService){

  $scope.stepOne = true;
  $scope.stepTwo = false;
  $scope.stepThree = false;

  $scope.formModel={
  };
  $scope.formFields=[
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

  $scope.submitFile = function(){
    console.log($scope.formModel);
    var uploadfile = $scope.formModel["Select A File"][0];
    console.log(uploadfile);

    if(uploadfile !== {}){

      upload = Upload.upload({
        url : "/Importer/uploadFile",
        file: uploadfile,
        fields:{
          'uploadInfo': {
            'name' : $scope.formModel.Name,
            'filename': $scope.formModel["Select A File"][0].name,
            'location': $scope.formModel.Location,
            'description': $scope.formModel.Description
          }
        }
      }).progress(function(evt) {
        var progress = parseInt(100.0 * evt.loaded / evt.total);
        $scope.$emit("uploadProgress", progress);
      }).success(function(data, status, headers, config) {


        $scope.stepThreeFormCollection = FormSettingParseService(data);

        console.log($scope.stepThreeFormCollection);
      }).error(function(err){
        alert(err);
      });
    } else {
      alert("Please Select A File");
    }
    $scope.$emit("stepTwo");
  };

  $scope.$on("uploadProgress", function(event, data){
    console.log(data);
    $scope.fileUploadProgress = data;
    if(data >= 100){
      $timeout(function(){
        $scope.stepOne = false;
        $scope.stepTwo = false;
        $scope.stepThree = true;
      }, 1000);
    }
  });

  $scope.cancelFile = function(){
    $scope.formModel= {};
  };

  $scope.optionStatus= {
    firstOpen : true,
    secondOpen: false,
    thirdOpen: false,
    fourthOpen: false
  };

  $scope.fileUploadProgress = 0;

  $scope.availableFields = {};

  $scope.$on("stepTwo",function(){
    $scope.stepOne = false;
    $scope.stepTwo = true;
  });


  $scope.cancelImport = function(){
    $scope.stepOne = true;
    $scope.stepTwo = false;
    $scope.stepThree = false;
    $scope.fileUploadProgress = 0;
  };

  $scope.decideImport = function(){
    var finalFormToUpload = {};

    for(var key in $scope.stepThreeFormCollection){
      finalFormToUpload[key] = {
        fields:[]
      };
      for(var key2 in $scope.stepThreeFormCollection[key])
      switch (key2) {
        case "fields":
        break;
        case "checked":
        finalFormToUpload[key].checked = $scope.stepThreeFormCollection[key][key2];
        break;
        default:
        var option = {};
        option[key2] = $scope.stepThreeFormCollection[key][key2];
        finalFormToUpload[key].fields.push(option);
        break;
      }
    }
    console.log(finalFormToUpload);
    $http.post("/Importer/decideImport", finalFormToUpload).
    success(function(data, status, headers, config) {
      // this callback will be called asynchronously
      // when the response is available
      alert("Importer Has Been Created");
      $scope.stepOne = true;
      $scope.stepTwo = false;
      $scope.stepThree = false;
    }).
    error(function(data, status, headers, config) {
      // called asynchronously if an error occurs
      // or server returns response with an error status.
      alert("Something Wents Wrong");
    });
  };

  $scope.$watch(function(){
    return $scope.stepOne;
  }, function(newValue){
    if(newValue === true){
      $scope.$emit("dynamicBackground");
    } else if ( newValue === false){
      $scope.$emit("removeDynamicBackground");
    }
  });


}]);
