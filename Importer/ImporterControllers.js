var ImporterControllers = angular.module("ImporterControllers",["formly","formlyBootstrap"]);

ImporterControllers.controller("ImporterUploadCtrl", ["$http","$scope", function($http, $scope){
  $scope.formModel={};
  $scope.formFields=[
    {
      type:"input",
      key:"File Name",
      templateOptions:{
        label:"File Name"
      }
    },
    {
      template:"<input type='file'>",
      templateOptions:{
        label:"Chose A file"
      }
    }
  ];
}]);
