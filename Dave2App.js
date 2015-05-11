var Dave2App = angular.module("Dave2App",["Dave2AppControllers", "ngRoute", "ImporterApp"]);

Dave2App.config(["$routeProvider", function($routeProvider){
  $routeProvider.when('/Import',{
    templateUrl : "Importer/importer.html"
  });
}]);
