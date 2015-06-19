(function(){'use strict';
  angular
  .module("Dave2.Importer")
  .factory("FormSettingParseService",FormSettingParseService)
  .factory("ImporterSocket", ImporterSocket);

  FormSettingParseService.$inject = [];
  ImporterSocket.$inject = ["socketFactory"];
  function FormSettingParseService(){
    return function(dataToParse){
        if(dataToParse){
          var formCollection = {};
          for(var i = 0; i < dataToParse.length; i++){
            var singleForm = [];
            for(var p in dataToParse[i].availableOptions){
              var rawOption = dataToParse[i].availableOptions[p];
              var translatedField = {};

              translatedField.key = rawOption.name;
              translatedField.defaultValue = rawOption.value;
              translatedField.expressionProperties = {
                "templateOptions.disabled":'!model.checked'
              };
              switch(rawOption.name) {
                case "flexibleFieldName":
                translatedField.type = "input2";
                break;
                case "precision":
                translatedField.type = "input2";
                translatedField.data = { inputType : "number"};
                break;
                case "unit":
                translatedField.type = "select";
                translatedField.data = {options : rawOption.options};
                break;
                case "note":
                translatedField.type = "textarea2";
                break;
                default:
                break;
              }

              singleForm.push(translatedField);
            }
            formCollection[dataToParse[i].fieldName] = { fields : singleForm, checked : dataToParse[i].checked};

          }
          return formCollection;
        }
      };
  }
  function ImporterSocket(socketFactory){
    var myIoSocket = io.connect('10.3.83.58:3000/importer'); //jshint ignore:line
    return socketFactory({
      ioSocket : myIoSocket
    });
  }
})();
