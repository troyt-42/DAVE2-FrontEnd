var express = require('express');
var http = require('http');
var fs = require('fs');
var io = require('socket.io');
var bodyparser = require('body-parser');
var multiparty= require('multiparty');


var app = express();
var server = http.createServer(app);
var socket = io.listen(server);

app.use(express.static(__dirname + '/../'));

app.post("/Importer/uploadFile", function(req,res){
  var form = new multiparty.Form();
  var file;
  var filename;
  var count = 0;
  form.on('error', function(err) {
    console.log('Error parsing form: ' + err.stack);
  });

  form.on('part', function(part) {

    if (!part.filename) {
      var uploadInfo;
      // filename is not defined when this is a field and not a file
      console.log('got field named ' + part.name);
      part.on('data', function(chunk){
        uploadInfo += chunk;
      });

      part.on('end', function(){
        console.log(uploadInfo);
        console.log(part.name + " is received");
      });

      // ignore field's content
      part.resume();
    }

    if (part.filename) {
      filename = part.filename;
      // filename is defined when this is a file
      count++;
      console.log('got file named ' + part.name);

      part.on("data", function(chunk){
        file += chunk;
      });


      part.on('end', function(){
        console.log('part upload success!');
      });
      part.resume();
    }

    part.on('error', function(err) {
      // decide what to do
    });
  });

  form.on('close', function() {
    console.log('Upload completed!');
    fs.writeFile(__dirname + "/upload_files/" + filename,file, function(err){
      res.end(err);
    });

    res.end('Received ' + count + ' files');
  });

  // form.on('progress', function(bytesReceived, bytesExpected){
  //   var progress =bytesReceived / bytesExpected * 100;
  //   console.log("Progress: " + progress.toFixed(2) + "%");
  // });
  form.parse(req);
});

server.listen(3000);
console.log("Express Server Is Listenning at 3000");
