var Dave2AppControllers = angular.module("Dave2AppControllers",[]);


Dave2AppControllers.controller('Dave2Ctrl', ['$scope','$location', function($scope, $location){
  $scope.navClass = function(page){
    var currentRoute = $location.path();
    return page === currentRoute ? 'active' : '';
  };

  $scope.isHome = function(){
    if ($location.path() === ''){
      return true;
    } else {
      return false;
    }
  };


}]);
