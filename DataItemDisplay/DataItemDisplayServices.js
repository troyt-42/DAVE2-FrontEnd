(function(){'use strict';
  angular.module("Dave2.DataItemDisplay")
  .factory("DataItemDisplaySocket", DataItemDisplaySocket);

  DataItemDisplaySocket.$inject=["socketFactory"];

  function DataItemDisplaySocket(socketFactory){
    var myIoSocket = io.connect('10.3.83.58:3000/dataItemDisplay');
    var dataItemDisplaySocket = socketFactory({
      ioSocket: myIoSocket
    });
    dataItemDisplaySocket.forward('ipDataItemListResponse');
        dataItemDisplaySocket.forward('ipDataItemResponse');

    return dataItemDisplaySocket;
  }
}());
