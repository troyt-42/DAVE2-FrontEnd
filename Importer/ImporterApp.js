var ImporterApp = angular.module("ImporterApp",["formly","formlyBootstrap","ui.bootstrap","ngFileUpload","ngAnimate"]);

ImporterApp.run(["formlyConfig", function(formlyConfig){
  formlyConfig.setType({
    name:"uploadForm",
    templateUrl:"Importer/uploadFormTemplate.html",
    defaultOptions: {},
    controller: ["$scope","Upload", function($scope, Upload) {
      var upload = {};
      $scope.uploadfile = {};

      $scope.submitFile = function(){
        console.log($scope.uploadfile);
        if($scope.uploadfile !== {}){

          upload = Upload.upload({
            url : "/Importer/uploadFile",
            file: $scope.uploadfile,
            fields:{
              uploadInfo: $scope.model[$scope.options.key]
            }
          }).progress(function(evt) {
            var progress = parseInt(100.0 * evt.loaded / evt.total);
            console.log('progress: ' + progress + '% file :'+ evt.config.file.name);
            $scope.$emit("uploadProgress", progress);
          }).success(function(data, status, headers, config) {
            console.log('file ' + config.file.name + 'is uploaded successfully. Response: ' + data);
          }).error(function(err){
            alert(err);
          });
        } else {
          alert("Please Select A File");
        }
        $scope.$emit("stepTwo");
      };

      $scope.importInfoMissing = true;
      
      $scope.cancelFile = function(){
        $scope.model[$scope.options.key] = {};
        $scope.uploadfile = {};
      };

      $scope.fileSelected = function(file, event){

        if((file[0] !== undefined) && (file[0] !== null)){
          if(($scope.model[$scope.options.key] === undefined) || ($scope.model[$scope.options.key] === null)){
            $scope.model[$scope.options.key] = { file: ""};
          }
          $scope.model[$scope.options.key].file = file[0].name;
        }
      };
    }]
  });

  formlyConfig.setType({
    name:"fieldForm",
    templateUrl:"/Importer/fieldFormTemplate.html",
    defaultOptions:{}

  });

}]);
