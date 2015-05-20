var ImporterServices = angular.module("ImporterApp");


ImporterApp.factory("FormSettingParseService",[function(){
  return {
    fieldsParsing: function(dataToParse){
      if(dataToParse){
        var formCollection = [];
        for(var i = 0; i < dataToParse.length; i++){
          var singleForm = [];
          for(var p = 0; p < dataToParse[i].avaliableOptions.length; p++){
            var rawOption = dataToParse[i].avaliableOptions[p];
            var translatedField = {};

            translatedField.key = rawOption.name;
            translatedField.defaultValue = rawOption.value;
            translatedField.expressionProperties = {
              "templateOptions.disabled":'!model.checked'
            };
            switch(rawOption.type) {
              case "text":
              translatedField.type = "input2";
              break;
              case "number":
              translatedField.type = "input2";
              translatedField.data = { inputType : "number"};
              break;
              case "select":
              translatedField.type = "select";
              translatedField.data = {options : rawOption.options};
              break;
              case "textarea":
              translatedField.type = "textarea";
              break;
              default:
              break;
            }

            singleForm.push(translatedField);
          }
          formCollection.push(singleForm);

        }
        console.log(formCollection);
        return formCollection;
      }
    },
    modelsParsing: function(dataToParse){
      if(dataToParse){
        var modelCollection={};
        for(var i = 0; i < dataToParse.length; i++){
          modelCollection[dataToParse[i].name] = { checked : dataToParse[i].checked};
        }
        return modelCollection;
      }
    }
  };
}]);
