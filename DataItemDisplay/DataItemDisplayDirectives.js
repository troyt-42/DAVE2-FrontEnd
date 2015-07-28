(function(){'use strict';
  angular.module("Dave2.DataItemDisplay")
  .directive("daveDataItemDisplayListPage", daveDataItemDisplayListPage)
  .directive("daveDataItemDisplayPage", daveDataItemDisplayPage);

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

  function daveDataItemDisplayPage(){
    return {
      restrict: "E",
      templateUrl: "DataItemDisplay/DataItemDisplayDirectiveTemplates/daveDataItemDisplayPage.html",
      scope: {
        dataItemToRequest:"@daveDataItem"
      },
      controller:"DaveDataItemDisplayPageCtrl",
      controllerAs: "daveDataItemDisplayPageCtrl",
      link: function(scope, element, attrs){

      }
    };
  }
})();
