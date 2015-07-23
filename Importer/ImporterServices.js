(function(){'use strict';
  angular
  .module("Dave2.Importer")
  .factory("FormSettingParseService",FormSettingParseService)
  .factory("ImporterSocket", ImporterSocket)
  .factory("DirectiveService", DirectiveService);

  ImporterSocket.$inject = ["socketFactory"];
  DirectiveService.$inject = ['$compile'];
  function FormSettingParseService(){
    return function(dataToParse){
        if(dataToParse){
          var formCollection = {};
          for(var i = 0; i < dataToParse.length; i++){
            var singleForm = [];
            var topic = '';
            for(var p in dataToParse[i].availableOptions){
              var rawOption = dataToParse[i].availableOptions[p];
              var translatedField = {};
              var useful = true;
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
                case "topic": // a backend field
                topic = rawOption.value;
                useful = false;
                break;
                default:
                break;
              }
              if(useful){
                singleForm.push(translatedField);
              }

            }
            formCollection[dataToParse[i].fieldName] = { fields : singleForm, checked : dataToParse[i].checked, 'topic' : topic};

          }
          return formCollection;
        }
      };
  }
  function ImporterSocket(socketFactory){
    var myIoSocket = io.connect('10.3.83.58:3000/importer'); //jshint ignore:line
    var importerSocket = socketFactory({
      ioSocket : myIoSocket
    });
    importerSocket.forward('importerListData');
    importerSocket.forward('importerData');
    importerSocket.forward('importerDataItemData');
    return importerSocket;
  }
  function DirectiveService(){
    var DirectiveServiceObj = {
      'DestroyDirectiveService' : DestroyDirectiveService,
      'AddDirectiveService' : AddDirectiveService,
      'CheckDirectiveExpandStatus' : CheckDirectiveExpandStatus,
      'EnterSearchMode' : EnterSearchMode
    };
    return DirectiveServiceObj;
    ///////////////

    function DestroyDirectiveService(directiveName, scope){
      angular.element(directiveName).remove();
      scope.$destroy();
    }

    function AddDirectiveService(targetContainer, directiveName, scope, $compile){
      var el = $compile(directiveName)(scope);
      angular.element(targetContainer).append(el);
    }

    function CheckDirectiveExpandStatus(targetContainer){
      if(!angular.element('.importerContainerRightPanel').hasClass('expanded')){
        angular.element("#js-expand-sign").text(' Collapse');
        angular.element("#js-expand-sign").text(' Collapse');
        angular.element("#js-expand-arrow").removeClass('glyphicon-arrow-right');
        angular.element("#js-expand-arrow").addClass('glyphicon-arrow-left');
      }
    }

    function EnterSearchMode(backDirective,backDirectiveHtml, targetContainer, scope, $compile){
      var bindScope = scope.$parent.$new(true);
      DirectiveServiceObj.DestroyDirectiveService(backDirective, scope);
      DirectiveServiceObj.AddDirectiveService(targetContainer, '<dave-importer-search-mode-page class="angular-directive" back-directive="' + backDirectiveHtml + '"></dave-importer-search-mode-page>', bindScope, $compile);
    }
  }
})();
