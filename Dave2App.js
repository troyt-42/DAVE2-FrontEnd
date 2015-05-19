var Dave2App = angular.module("Dave2App",["ngRoute", "ImporterApp","ngAnimate", "ui.bootstrap","btford.socket-io"]);

Dave2App.config(["$routeProvider", function($routeProvider){
  $routeProvider.when('/Import',{
    templateUrl : "Importer/importer.html"
  });
}]);


Dave2App.factory('userSocket', function(socketFactory){
  return socketFactory();
});
