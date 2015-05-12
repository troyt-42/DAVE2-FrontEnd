var ImporterApp = angular.module("ImporterApp",["formly","formlyBootstrap","ui.bootstrap","angularFileUpload","ngAnimate"]);

ImporterApp.run(["formlyConfig", function(formlyConfig){
  formlyConfig.setType({
    name:"uploadForm",
    templateUrl:"Importer/uploadFormTemplate.html",
    defaultOptions: {
    },
    controller: ["$scope", "FileUploader", function($scope, FileUploader) {
      $scope.uploader = new FileUploader();
    }]
  });
}]);
