(function(){'use strict';
  angular.module("Dave2.DataItemDisplay")
  .factory("dataItemDisplaySocket", dataItemDisplaySocket);

  dataItemDisplaySocket.$inject=["socketFactory"];

  function dataItemDisplaySocket(socketFactory){
    var myIoSocket = io.connect('10.3.83.58:3000/dataItemDisplay');

    return socketFactory({
      ioSocket: myIoSocket
    });
  }
}());
