(function(){'use strict';
  angular
  .module("Dave2App")
  .factory("generalSocket", generalSocket)
  .factory("userSocket", userSocket);
  userSocket.$inject = ["socketFactory"];

  function generalSocket(socketFactory){
    var myIoSocket = io.connect('10.3.83.58:3000/');

    return socketFactory({
      ioSocket: myIoSocket
    });
  }

  function userSocket(socketFactory){
    var myIoSocket = io.connect('10.3.83.58:3000/user');

    return socketFactory({
      ioSocket: myIoSocket
    });
  }
})();
