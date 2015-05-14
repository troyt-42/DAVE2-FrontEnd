var ImporterControllers = angular.module("ImporterApp");

ImporterControllers.controller("ImporterUploadCtrl", ["$timeout", "$http","$scope", function($timeout, $http, $scope){
  var upload = {};

  $scope.stepOne = true;
  $scope.stepTwo = false;
  $scope.stepThree = false;
  $scope.formModel={
  };
  $scope.formFields=[
    {
      type:"uploadForm",
      key:"uploadInfo"
    }
  ];

  $scope.formFields2=[
    {
      type:"fieldForm",
      key:"fieldInfo"
    }
  ];

  $scope.formOptions={
    formState:{
      testProperty: true
    }

  };

  $scope.optionStatus= {
    firstOpen : true,
    secondOpen: false,
    thirdOpen: false,
    fourthOpen: false
  };

  $scope.fileUploadProgress = 0;


  $scope.$on("stepTwo",function(){
    $scope.stepOne = false;
    $scope.stepTwo = true;
  });

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

  $scope.fieldsStatus=[false,false,false,false,false,false,false,false,false,false,false];

  $scope.fields=[
    {name: "fake field", index: 0},
    {name: "fake field", index: 1},
    {name: "fake field", index: 2},
    {name: "fake field", index: 3},
    {name: "fake field", index: 4},
    {name: "fake field", index: 5},
    {name: "fake field", index: 6},
    {name: "fake field", index: 7},
    {name: "fake field", index: 8},
    {name: "fake field", index: 9},
    {name: "fake field", index: 10}
  ];
}]);
