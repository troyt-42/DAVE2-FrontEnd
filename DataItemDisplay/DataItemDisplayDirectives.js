(function(){'use strict';
  angular.module("Dave2.DataItemDisplay")
  .directive("daveDataItemDisplayListPage", daveDataItemDisplayListPage)
  .directive("daveDataItemDisplayPage", daveDataItemDisplayPage);

  function daveDataItemDisplayListPage(){
    return {
      restrict: "EA",
      templateUrl: "DataItemDisplay/DataItemDisplayDirectiveTemplates/daveDataItemDisplayListPage.html",
      controller: 'DaveDataItemDisplayListPageCtrl',
      scope: {
        options: "@options"
      },
      controllerAs: "daveDataItemDisplayListPageCtrl",
      link: function(scope, element, attrs){
      }
    };
  }

  function daveDataItemDisplayPage(){
    return {
      restrict: "E",
      templateUrl: "DataItemDisplay/DataItemDisplayDirectiveTemplates/daveDataItemDisplayPage.html",
      scope: {
        dataItemsToRequest:"@daveDataItems"
      },
      controller:"DaveDataItemDisplayPageCtrl",
      controllerAs: "daveDataItemDisplayPageCtrl",
      link: function(scope, element, attrs){

      }
    };
  }
})();
