(function(){'use strict';
  angular.module("Dave2.Importer")
  .directive('daveSmartDisable', daveSmartDisableDirective);


  function daveSmartDisableDirective(){
    return {
      restrict:'A',
      scope:{
        daveSmartDisable:"=",
        daveContentChecked:"="
      },
      link:function(scope, element, attrs){
        scope.$watch(function(){
          return scope.daveSmartDisable;
        }, function(newValue,oldValue){
          if(newValue !== undefined){
            if(newValue.length === 0){
              element.text("No Configurations Avaliable");
            }
          }
        });

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
})();
