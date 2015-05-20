var ImporterDirectives = angular.module("ImporterApp");

ImporterDirectives.directive('smartDisable', function(){
  return {
    restrict:'A',
    scope:{
      smartDisable:"=",
      contentChecked:"="
    },
    link:function(scope, element, attrs){


      scope.$watch(function(){
        return scope.smartDisable;
      }, function(newValue,oldValue){
        if(newValue !== undefined){
          if(newValue.length === 0){
            element.text("No Configurations Avaliable");
          }
        }
      });

      scope.$watch(function(){
        return scope.contentChecked;
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
});
