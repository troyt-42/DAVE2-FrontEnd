(function(){'use strict';
  angular.module("Dave2.DataItemDisplay")
  .directive("daveDataItemDisplayListPage", daveDataItemDisplayListPage);

  function daveDataItemDisplayListPage(){
    return {
      restrict: "EA",
      templateUrl: "DataItemDisplay/DataItemDisplayDirectiveTemplates/daveDataItemDisplayListPage.html",
      controller: 'DaveDataItemDisplayListPageCtrl',
      scope: {},
      controllerAs: "daveDataItemDisplayListPageCtrl",
      link: function(scope, element, attrs){
      }
    };
  }
})();
