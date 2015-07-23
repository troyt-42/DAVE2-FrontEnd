(function(){'use strict';
  angular.module("Dave2.Importer")
  .directive('daveSmartDisable', daveSmartDisableDirective)
  .directive('daveImporterListPage', daveImporterListPage)
  .directive('daveImporterPage', daveImporterPage)
  .directive('daveImporterConfigurationPage', daveImporterConfigurationPage)
  .directive('daveImporterSearchModePage', daveImporterSearchModePage);

  function daveSmartDisableDirective(){
    return {
      restrict:'A',
      scope:{
        daveSmartDisable:"=",
        daveContentChecked:"=",
        displayMessage:"="
      },
      link:function(scope, element, attrs){
        scope.originHtml = '';
        scope.$watch(function(){
          return scope.daveSmartDisable;
        }, function(newValue,oldValue){
          console.log(newValue);
          if(newValue !== undefined){
            if(newValue.length === 0){
              scope.originHtml = element.html();
              element.find('span').text(scope.displayMessage);
              element.css('text-align', 'center');
              element.css('background', 'black');
              element.css('color', 'white');
            } else {
              element.find('span').text('');
            }
          }
        }, true);

        scope.$watch(function(){
          return scope.daveContentChecked;
        },function(newValue,oldValue){
          console.log(newValue);
          if(newValue === false){
            element.css({
              background:"lightgray",
              opacity:"0.5"
            });
          } else if (newValue === true){
            element.css({
              background:"white",
              opacity:"1"
            });
          }
        });
      }
    };
  }

  function daveImporterListPage(){
    return {
      restrict: "EA",
      templateUrl: "Importer/ImporterDirectiveTemplates/daveImporterListPage.html",
      controller: 'DaveImporterListPageCtrl',
      scope: {},
      controllerAs: "daveImporterListPageCtrl",
      link: function(scope, element, attrs){
      }
    };
  }

  function daveImporterPage(){
    return {
      restrict : "EA",
      templateUrl:'Importer/ImporterDirectiveTemplates/daveImporterPage.html',
      controller: 'DaveImporterPageCtrl',
      controllerAs: 'daveImporterPageCtrl',
      scope:{
        importerToRequest: "@importerToRequest"
      },
      link: function(scope, element, attrs){

      }
    };
  }

  function daveImporterConfigurationPage(){
    return {
      restrict : "EA",
      templateUrl:'Importer/ImporterDirectiveTemplates/daveImporterConfigurationPage.html',
      controller:'DaveImporterConfigurationPageCtrl',
      controllerAs:'daveImporterConfigurationPageCtrl',
      scope:{
        formCollection: "@formCollection",
        importerCreationMeta: "@importerCreationMeta",
        progressing: "=progressing"
      },
      link: function(scope, element, attrs){
        console.log(scope);
      }
    };
  }

  function daveImporterSearchModePage(){
    return {
      restrict : "EA",
      templateUrl:'Importer/ImporterDirectiveTemplates/daveImporterSearchModePage.html',
      controller:'DaveImporterSearchModePageCtrl',
      controllerAs:'daveImporterSearchModePageCtrl',
      scope:{
        searchableColumns:"@searchableColumns",
        targetContainer: "@targetContainer",
        backDirective:"@backDirective"
      },
      link: function(scope, element, attrs){
      }
    };
  }
})();
