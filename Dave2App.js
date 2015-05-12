var Dave2App = angular.module("Dave2App",["ngRoute", "ImporterApp","ngAnimate", "ui.bootstrap"]);

Dave2App.config(["$routeProvider", function($routeProvider){
  $routeProvider.when('/Import',{
    templateUrl : "Importer/importer.html"
  });
}]);
