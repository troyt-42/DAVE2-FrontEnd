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
    name:"input2",
    templateUrl: "angularFormlyBasicTemplates/input2.html"
  });

  formlyConfig.setType({
    name:"textarea",
    templateUrl: "angularFormlyBasicTemplates/textarea.html"
  });

  formlyConfig.setType({
    name:"textarea2",
    templateUrl: "angularFormlyBasicTemplates/textarea2.html"
  });

  formlyConfig.setType({
    name:"select",
    templateUrl: "angularFormlyBasicTemplates/select.html"
  });


}]);
