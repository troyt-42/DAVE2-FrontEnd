(function(){'use strict';
  angular.module("RedisTest")
  .factory("generalSocket", generalSocket);

  generalSocket.$inject=["socketFactory"];

  function generalSocket(socketFactory){
    var myIoSocket = io.connect('10.3.83.58:3000/');

    return socketFactory({
      ioSocket: myIoSocket
    });
  }
}());
