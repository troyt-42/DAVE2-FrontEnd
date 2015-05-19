var angularFormlyLib = angular.module("angularFormlyDaveLib",[]);

angularFormlyLib.run(["formlyConfig", function(formlyConfig){
  formlyConfig.setType({
    name:"input",
    templateUrl: "angularFormlyBasicTemplates/input.html",
    defaultOptions :{
      data:{
        inputType:"text"
      }
    }
  });

  formlyConfig.setType({
    name:"textarea",
    templateUrl: "angularFormlyBasicTemplates/textarea.html"
  });

  formlyConfig.setType({
    name:"select",
    templateUrl: "angularFormlyBasicTemplates/select.html"
  });
}]);
