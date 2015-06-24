(function(){'use strict';
  angular
  .module("Dave2")
  .controller('Dave2Ctrl', Dave2Ctrl);

  Dave2Ctrl.$inject = ['$scope','$location','$modal','userSocket','generalSocket'];

  function Dave2Ctrl($scope, $location,$modal, userSocket, generalSocket){
    userSocket.on("some", function(){
      console.log("test");
    });
    var vm = this;

    vm.navClass = navClass;
    vm.isHome = isHome;
    vm.signIn = signIn;

    vm.dynamicBackground = true;
    $scope.$on("dynamicBackground", function(){
      vm.dynamicBackground = true;
    });

    $scope.$on("removeDynamicBackground", function(){
      vm.dynamicBackground = false;
    });
    $(document).ready(function() {
      var menuToggle = $('#js-mobile-menu').unbind();
      $('#js-navigation-menu').removeClass("show");

      menuToggle.on('click', function(e) {
        e.preventDefault();
        menuToggle.toggleClass('expand');
        $('#js-navigation-menu').slideToggle(function(){
          if($('#js-navigation-menu').is(':hidden')) {
            $('#js-navigation-menu').removeAttr('style');
          }
        });
      });
    });
    //////////////////////////
    function navClass(page){
      var currentRoute = $location.path();
      return page === currentRoute ? 'active' : '';
    }

    function isHome(){
      if ($location.path() === ''){
        return true;
      } else {
        return false;
      }
    }

    function signIn(){
      var loginInterface = $modal.open({
        templateUrl:"loginModal.html",
        controller:["$scope","$modalInstance", function($scope, $modalInstance){
          $scope.username = '';
          $scope.password = '';
          $scope.ok = function(){
            $modalInstance.close({username:vm.username, password:vm.password});
          };

          $scope.cancel = function(){
            $modalInstance.dismiss('cancel');
          };
        }]
      });

      loginInterface.result.then(function(data){
        console.log(data);
      });
    }
  }
})();
