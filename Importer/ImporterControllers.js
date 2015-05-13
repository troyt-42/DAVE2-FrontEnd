var ImporterControllers = angular.module("ImporterApp");

ImporterControllers.controller("ImporterUploadCtrl", ["$timeout", "$http","$scope", function($timeout, $http, $scope){
  var upload = {};
  $scope.stepOne = true;
  $scope.stepTwo = false;

  $scope.formModel={
  };
  $scope.formFields=[
    {
      type:"uploadForm",
      key:"uploadInfo"
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
  });

}]);
