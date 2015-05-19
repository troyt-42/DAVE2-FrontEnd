var ImporterDirectives = angular.module("ImporterApp");

ImporterDirectives.directive('smartDisable', function(){
  return {
    restrict:'A',
    scope:{
      smartDisable:"=",
      contentChecked:"="
    },
    link:function(scope, element, attrs){
      if(scope.smartDisable.length === 0){
        element.text("No Configurations Avaliable");
      }

      scope.$watch(function(){
        return scope.contentChecked;
      },function(newValue,oldValue){
        console.log(newValue);
        if(newValue === false){
          console.log(newValue);
          element.css({
            background:"lightgray",
            opacity:"0.5"
          });

          //element.text("Please Select This Field First");
        } else if (newValue === true){
          element.css({
            background:"white",
            opacity:"1.0"
          });
        }
      });
    }
  };
});
