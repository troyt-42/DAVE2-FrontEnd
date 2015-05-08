var express = require('express');
var http = require('http');
var fs = require('fs');
var io = require('socket.io');
var bodyparser = require('body-parser');

var app = express();
var server = http.createServer(app);
var socket = io.listen(server);

app.use(express.static(__dirname + '/../'));



server.listen(3000);
console.log("Express Server Is Listenning at 3000");
