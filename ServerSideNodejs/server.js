var express = require('express');
var http = require('http');
var fs = require('fs');
var io = require('socket.io')();
var bodyparser = require('body-parser');
var multiparty= require('multiparty');
var kafka = require('kafka-node');

var app = express();
var server = http.createServer(app);

var kafkaClient = new kafka.Client('10.3.83.74:2181');
var HighLevelProducer = kafka.HighLevelProducer;
var HighLevelConsumer = kafka.HighLevelConsumer;

var kafkaProducer = new HighLevelProducer(kafkaClient);
var kafkaConsumer = new HighLevelConsumer(kafkaClient,[
  { topic: '__main_out__' },
  { topic: '__importer_stepOne_list_out__'},
  { topic: '__importer_stepTwoB_importer_out__'},
  { topic: '__importer_stepTwoB_dataItem_out__'},
  { topic: '__importer_stepOne_createImporter_out__'}
],
{
  groupId: 'my-group'
});


io.listen(server);

app.use(express.static(__dirname + '/../'));


app.post('/Importer/uploadFile', function(req,res){
  var form = new multiparty.Form();
  var file;
  var filename;
  var count = 0;

  var fileInfo = '';
  form.on('error', function(err) {
    console.log('Error parsing form: ' + err.stack);
  });

  form.on('part', function(part) {

    if (!part.filename) {
      // filename is not defined when this is a field and not a file
      console.log('got field named ' + part.name);
      part.on('data', function(chunk){
        fileInfo += chunk;
      });

      part.on('end', function(){
        console.log(part.name + ' is received: ' + fileInfo);
      });

      // ignore field's content
      part.resume();
    }

    if (part.filename) {
      filename = part.filename;
      // filename is defined when this is a file
      count++;
      part.on('data', function(chunk){
        file += chunk;
      });


      part.on('end', function(){
        console.log('file upload success!');
      });
      part.resume();
    }

    part.on('error', function(err) {
      // decide what to do
    });
  });

  form.on('close', function() {
    console.log('Upload completed!');

    fs.writeFile(__dirname + '/importerfiles/' + filename,file, function(err){
      res.end(err);
    });

    res.end();
  });

  // form.on('progress', function(bytesReceived, bytesExpected){
  //   var progress =bytesReceived / bytesExpected * 100;
  //   console.log('Progress: ' + progress.toFixed(2) + '%');
  // });
  form.parse(req);
});


app.post('/Importer/decideImport',bodyparser.json(), function(req, res){
  //console.log(JSON.stringify(req.body));
  res.end();
});

app.get('/Importer/gettable', function(req, res){
  fs.readFile('table.json', function(err,data){
    if (err){
      console.log('Error Reading File');
      console.log(err);
      res.writeHead(404,{'Content-Type': 'text/plain'});
      res.end();
    } else {
      res.write(data);
      res.end();
    }
  });
});

io.on('connection', function(socket){
  console.log(socket.handshake.address + ' has connected! id: ' + socket.id);
  socket.on('disconnect',function(){
    kafkaProducer.send([{
      topic:'__main_in__',
      messages:[
        JSON.stringify({
          session_id: socket.id,
          username: 'troy',
          password: '1234',
          return_topic: 'troy_out',
          action:'RELEASE_CONNECTION'
        })
      ]
    }],function (err, data) {
      if(err){
        console.log(err);
      } else {
        console.log('user: ' + socket.id + ' has disconnectted successfully');
      }
    });
  });
});

io.of('/user').on('connection', function(socket){
  kafkaProducer.send([{
    topic:'__main_in__',
    messages:[
      JSON.stringify({
        session_id: socket.id,
        username: 'troy',
        password: '1234',
        return_topic: 'troy_out',
        action:'LOGIN'
      })
    ]
  }],function (err, data) {
    if(err){
      console.log(err);
    } else {
      console.log('user: ' + socket.id + ' has submit info successfully');
    }
  });

});


io.of('/importer').on('connection', function(socket){
  console.log(socket.handshake.address + ' has connected! id: ' + socket.id + ' Namespace: /importer');
  socket.on('requestImporterList',function(){
    kafkaProducer.send([{
      topic:'__importer_stepOne_list_in__',
      messages: [
        JSON.stringify({
          session_id: socket.id,
          username: 'troy',
          password: '1234',
          return_topic: '__importer_stepOne_list_out__',
          location:'brampton',
          action:'GETALL_IMPORTER'
        })
      ]
    }],
    function(err,data){
      if(err){
        console.log(err);
      } else {
        console.log('User ' + socket.id + ' has send importer_list request successfully');
      }
    });
  });
  socket.on('requestImporter', function(importer){
    var messageToSend = {
      session_id: socket.id,
      return_topic: '__importer_stepTwoB_importer_out__',
      action: 'QUERY_IMPORTER',
      payload:{
        importerName: importer.importerName,
        location: importer.location,
        list_type: 'importer',
        userName: 'troy'
      }
    };
    console.log('Requested Importer Info: ' + JSON.stringify(messageToSend));
    kafkaProducer.send([{
      topic:'__importer_stepTwoB_importer_in__',
      messages:[JSON.stringify(messageToSend)]
    }],function(err,data){
      if(err){
        console.log(err);
      } else {
        console.log('User ' + socket.id + ' has sent importer request successfully');
      }
    });
  });
  socket.on('requestImporterDataItemData', function(dataItem){
    var messageToSend = {
      session_id : socket.id,
      return_topic: '__importer_stepTwoB_dataItem_out__',
      action: 'QUERY_DATAITEM',
      location:dataItem.location,
      payload:{
        name:dataItem.fieldName,
        list_type:'dataItem'
      }
    };
    kafkaProducer.send([{
      topic:'__importer_stepTwoB_dataItem_in__',
      messages:[JSON.stringify(messageToSend)]
    }],function(err,data){
      if(err){
        console.log(err);
      } else {
        console.log('User ' + socket.id + ' has sent dataItem request successfully:' + dataItem.fieldName);
      }
    });

  });
  socket.on('createNewImporter',function(importerInfo){
    importerInfo.session_id = socket.id;
    importerInfo.action = 'CREATE_IMPORTER';
    importerInfo.return_topic = '__importer_stepOne_createImporter_out__';
    importerInfo.type = 'csv';
    kafkaProducer.send([{
      topic:'__importer_stepOne_createImporter_in__',
      messages:[JSON.stringify(importerInfo)]
    }],function(err,data){
      if(err){
        console.log(err);
      } else {
        console.log('User ' + socket.id + ' has sent importer creation request successfully:' + JSON.stringify(importerInfo));
      }
    });
  });

  socket.on('decideImporterCreation', function(decision){
    var temp = {
      session_id : socket.id,
      return_topic : '__importer_stepTwo_decideCreation_out__',
      action : 'DECIDE_CREATION',
      location : decision.location,
      list_out : decision.data
    };
    kafkaProducer.send([{
      topic:'__importer_stepTwo_decideCreation_in__',
      messages:[JSON.stringify(temp)]
    }],function(err,data){
      if(err){
        console.log(err);
      } else {
        console.log('User ' + socket.id + ' has sent importer creation decision successfully');
      }
    });
  });
});



kafkaConsumer.on('message',function(message){
  if(message.value === "hi"){

  } else if(message.value[1] !== '\"'){
    console.log(message.value[1]);
  } else if(message.topic === '__main_out__'){
    var data = JSON.parse(message.value);
    if(data.status === 'SUCCESS'){
      console.log('User ' + data.username + ' (id: ' + data.session_id + ') ' + 'has logged in successfully.');

    } else if (data.status === 'ERROR'){
      console.log('User ' + data.username + '\'s (id: ' + data.session_id + ') ' + 'login failed. Error: ' + data.detail);
    }
  } else if (message.topic === '__importer_stepOne_list_out__'){
    var data2 = JSON.parse(message.value);

    if(data2.list_out){
      io.of('/importer').to(data2.session_id).emit('importerListData', data2.list_out);
    }
  } else if (message.topic === '__importer_stepTwoB_importer_out__'){

    var data3 = JSON.parse(message.value);
    if(data3.list_out){
      io.of('/importer').to(data3.session_id).emit('importerData', data3.list_out);
    }
  } else if (message.topic === '__importer_stepTwoB_dataItem_out__'){
    var data4 = JSON.parse(message.value);
    if(data4.list_out){
      io.of('/importer').to(data4.session_id).emit('importerDataItemData', {name:data4.payload.name, data: data4.list_out});
    }
  } else if (message.topic === '__importer_stepOne_createImporter_out__'){
    var data5 = JSON.parse(message.value);
    if(data5.list_out){
      io.of('/importer').to(data5.session_id).emit('importerCreationResponse',{
        importerName:data5.importerName,
        location:data5.location,
        data: data5.list_out
      });
    }
  } else {
    console.log(message);
  }
});

process.on('SIGINT', function() {
  kafkaConsumer.close(true, function(){
    console.log('close kafka consumer DONE');
  });
  kafkaProducer.close(function(){
    console.log('close kafka producer DONE');
  });
  kafkaClient.close(function(){
    console.log('close kafkaClient DONE');
  });
  process.exit(0);
});

server.listen(3000);
console.log('Express Server Is Listenning at 3000');
