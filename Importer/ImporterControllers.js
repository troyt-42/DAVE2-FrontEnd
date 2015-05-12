var ImporterControllers = angular.module("ImporterApp");

ImporterControllers.controller("ImporterUploadCtrl", ["$http","$scope","FileUploader", function($http, $scope, FileUploader){


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
}]);
