(function(){'use strict';
  angular.module("Dave2.DataItemDisplay")
  .factory("DataItemDisplaySocket", DataItemDisplaySocket)
  .factory("DataItemDisplayRegistryService", DataItemDisplayRegistryService);

  DataItemDisplaySocket.$inject=["socketFactory"];
  DataItemDisplayRegistryService.$inject = [];

  function DataItemDisplaySocket(socketFactory){
    var myIoSocket = io.connect('10.3.83.58:3000/dataItemDisplay');
    var dataItemDisplaySocket = socketFactory({
      ioSocket: myIoSocket
    });
    dataItemDisplaySocket.forward('ipDataItemListResponse');
    dataItemDisplaySocket.forward('ipDataItemResponse');
    dataItemDisplaySocket.forward('ipAsychLoadingDataResponse');
    return dataItemDisplaySocket;
  }

  function DataItemDisplayRegistryService(){
    var finishedItems = [];
    var toDoItems = [];
    var currentDataItemNames = [];
    return {
      recordToDoItems: function(dataItems){
        for(var i = 0; i < dataItems.length; i++){
          var dataItem = dataItems[i];
          if(currentDataItemNames.indexOf(dataItem.name) === -1){
            currentDataItemNames.push(dataItem.name);
            toDoItems.push(dataItem);
          }
        }
      },
      readfinishedItems : function(){
        return angular.copy(finishedItems) ;
      },
      readToDoItems : function(){
        return angular.copy(toDoItems);
      },
      clearToDoItems : function(dataItem){
        for(var i = 0; i < toDoItems.length; i++){
          if(dataItem.name === toDoItems[i].name){
            toDoItems.splice(i, 1);
            finishedItems.push(dataItem);
          }
        }
      },
      clearDataItems : function(){
        finishedItems = [];
        currentDataItemNames = [];
        toDoItems = [];
      }
    };
  }
}());
