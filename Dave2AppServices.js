(function(){'use strict';
  angular
  .module("Dave2App")
  .factory("userSocket", userSocket);

  userSocket.$inject = ["socketFactory"];

  function userSocket(socketFactory){
    var myIoSocket = io.connect('10.3.83.58:3000/');

    return socketFactory({
      ioSocket: myIoSocket
    });
  }
})();
