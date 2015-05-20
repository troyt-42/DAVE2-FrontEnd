var ImporterControllers = angular.module("ImporterApp");

ImporterControllers.controller("ImporterUploadCtrl", ["$timeout", "$http","$scope", "Upload","FormSettingParseService", function($timeout, $http, $scope,Upload,FormSettingParseService){

  $scope.stepOne = false;
  $scope.stepTwo = false;
  $scope.stepThree = true;

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
        $scope.availableFields = data;
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


  $scope.fakeFieldsInfo=[{
    name:"Fermenter Sample HPLC Ethanol",
    checked: true,
    avaliableOptions:[
      {
        name:"Percision", value: 2, type:"number"
      },
      {
        name:"Unit", value: "meter", type:"select", options:["centimeter", "millimeter", "litre", "gram", "kilogram"]
      },
      {
        name:"Status", value: "ACTIVE", type:"text"
      },
      {
        name:"Note", type:"textarea"
      }
    ]
  }, {
    name: "Fermenter Sample %Solids",
    checked: true,
    avaliableOptions:[
      {
        name: "Percision", value: 2, type:"number"
      }
    ]
  },
  {
    name: "Date",
    checked: true,
    avaliableOptions:[]
  }, {
    name: "Fermenter Sample ID",
    checked: true,
    avaliableOptions:[]
  }];


  $scope.stepThreeFieldsCollection = FormSettingParseService.fieldsParsing($scope.fakeFieldsInfo);

  $scope.stepThreeFormModelCollection = FormSettingParseService.modelsParsing($scope.fakeFieldsInfo);
  console.log($scope.stepThreeFormModelCollection);
  $scope.extendContent = function(index){
    var temp = $scope.stepThreeFieldsCollection[0];
    $scope.stepThreeFieldsCollection[0] = $scope.stepThreeFieldsCollection[index];
    $scope.stepThreeFieldsCollection[index] = temp;
  };
}]);
