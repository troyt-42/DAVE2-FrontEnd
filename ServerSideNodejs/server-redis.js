var redis = require('redis');
var fs = require('fs');
var express = require('express');
var http = require('http');
var io = require('socket.io')();
var multiparty= require('multiparty');
var app = express();
var server = http.createServer(app);
var client = redis.createClient({no_ready_check:true});
io.listen(server);


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
app.use(express.static(__dirname + '/../'));

client.on('error', function (err) {
  console.log('Error ' + err);
});


client.on('ready', function(){

  client.smembers('importers', function(err, data){
    if(err){

    } else if (data.length === 0){

      //Feeding the Redis using table.json.   Data Structure: importers(set) importers:<ID>(hash)
      fs.readFile("table.json", function(err, data){
        if(err){
          console.log("Fail to read file");
        } else {
          var parsedData = JSON.parse(data);

          parsedData.forEach(function(element, index, array){
            client.multi()
            .sadd("importers", element.Id)
            .hmset("importers:" +　element.Id, "Id", element.Id, "Name", element.Name, "Location", element.Location, "Owner", element.Owner)
            .exec(function (err, replies) {//
            });
          });
        }
      });

      //Feeding the Redis using DA-60-CF-2A-24-CF-1H.json.  Data Structure: importers:<ID>:date(set) importers:<ID>:date:<DATE>(hash)
      fs.readFile("DA-60-CF-2A-24-CF-1H.json", function(err, data){
        if(err){
          console.log("Fail to read file");
        } else {
          // var parsedData = JSON.parse(data);
          //
          // parsedData.data.forEach(function(element, index, array){
          //   var dateInMM = Date.parse(element.Date);
          //   client.zadd("importers:DA-60-CF-2A-24-CF-1H:date", dateInMM, dateInMM, function(err, data){
          //     if(err){
          //       console.log(err);
          //     } else {
          //       client.hmset("importers:DA-60-CF-2A-24-CF-1H:date:"+dateInMM, "Value", element.Value);
          //       console.log("importers:DA-60-CF-2A-24-CF-1H:date:"+dateInMM+" has been added");
          //     }
          //   });
          //
          //   //The Multi Command appears to be problematic on performance
          //
          //   // client.multi()
          //   // .zadd("importers:DA-60-CF-2A-24-CF-1H:date", dateInMM, dateInMM)
          //   // .hmset("importers:DA-60-CF-2A-24-CF-1H:date:" + dateInMM, "Value", element.Value)
          //   // .exec(function (err, replies) {
          //   //   if(err){
          //   //     console.log(err);
          //   //   }
          //   // });
          // });
        }
      });

      //Feeding the Redis using Output.json  Data Structure: importers:<ID>:date(set) importers:<ID>:date
      fs.readFile("../../Output.json", function(err, data){
        if(err){
          console.log("Fail to read file");
        } else {
          var parsedData = JSON.parse(data);
          for(var key in parsedData){
            var temp = parsedData[key];
            for(var i = 0; i < temp.length; i++){
              var date = temp[i].DATE;
              var value = temp[i].VALUE;
              client.zadd("importers:58-B9-E1-F1-87-89:date", date, "{ \"DATE\":" + date + ", \"VALUE\":" + value + "}");
              console.log("importers:58-B9-E1-F1-87-89:date", date, "{ \"DATE\":" + date + ", \"VALUE\":" + value + "}");
            }
          }
        }
      });


    } else {
      var importers = data;


      io.on("connection", function(socket){
        var message = [];

        importers.forEach(function(element, index, array){
          client.hgetall("importers:"+element, function(err, data){
            if(err){

            } else {
              // socket.emit("importersInfo", data);
            }
          });
        });

        client.zrange("importers:58-B9-E1-F1-87-89:date",0, -1, function(err, data){
          if(err){
            console.log(err);
          } else {
            var dataToSend = [];
            for(var i = 0; i < data.length; i ++){
              var obj =JSON.parse(data[i]);
              var temp = [obj.DATE, obj.VALUE];
              dataToSend[i] = temp;
            }
            socket.emit("importersData", dataToSend);
            console.log("Done");
          }
        });

        socket.on("displayRquest",function(data){
          client.zrangebyscore("importers:58-B9-E1-F1-87-89:date", data.min, data.max, function(err,data){
            if(err){
              console.log(err);
            } else {
              var dataToSend = [];
              for(var i = 0; i < data.length; i ++){
                var obj =JSON.parse(data[i]);
                var temp = [obj.DATE, obj.VALUE];
                dataToSend[i] = temp;
              }
              socket.emit("displayResponse", dataToSend);
            }
          });
        });

      });



    }
  });


});


server.listen(3000);
console.log('Redis Test Server Is Listenning at 3000');
