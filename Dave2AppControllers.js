var Dave2AppControllers = angular.module("Dave2App");


Dave2AppControllers.controller('Dave2Ctrl', ['$scope','$location','$modal', function($scope, $location,$modal){
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

  $scope.signIn = function(){
    var loginInterface = $modal.open({
      templateUrl:"loginModal.html",
      controller:["$scope","$modalInstance", function($scope, $modalInstance){
        $scope.username = '';
        $scope.password = '';
        $scope.ok = function(){
          $modalInstance.close({username:$scope.username, password:$scope.password});
        };

        $scope.cancel = function(){
          $modalInstance.dismiss('cancel');
        };
      }]
    });

    loginInterface.result.then(function(data){
      console.log(data);
    });
  };
  
}]);
