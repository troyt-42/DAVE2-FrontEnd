(function(){'use strict';
  angular
  .module("Dave2.Importer").filter("importerListColumnNamesConversion", importerListColumnNamesConversion);
  function importerListColumnNamesConversion(){
    return function(input){
      var temp ={
            "importerName" : "Name",
            "location" : "Location",
            "ownerName" : "Owner",
            "type" : "Type",
            "description" : "Description"
      };
      return temp[input];
    };
  }
})();
