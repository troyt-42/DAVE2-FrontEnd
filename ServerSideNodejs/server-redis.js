var redis = require('redis');
var fs = require('fs');


var  client = redis.createClient();


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
            .exec(function (err, replies) {
              console.log("MULTI got " + replies.length + " replies");
              replies.forEach(function (reply, index) {
                console.log("Reply " + index + ": " + reply.toString());
              });
            });
          });
        }
      });

      //Feeding the Redis using DA-60-CF-2A-24-CF-1H.json.  Data Structure: importers:<ID>:date(set) importers:<ID>:date:<DATE>(hash)
      fs.readFile("DA-60-CF-2A-24-CF-1H.json", function(err, data){
        if(err){
          console.log("Fail to read file");
        } else {
          var parsedData = JSON.parse(data);

          parsedData.data.forEach(function(element, index, array){
            client.multi()
            .zadd("importers:DA-60-CF-2A-24-CF-1H:date", Date.parse(element.Date), Date.parse(element.Date))
            .hmset("importers:DA-60-CF-2A-24-CF-1H:date:" + Date.parse(element.Date), "Value", element.Value)
            .exec(function (err, replies) {
              console.log("MULTI got " + replies.length + " replies");
              replies.forEach(function (reply, index) {
                console.log("Reply " + index + ": " + reply.toString());
              });
            });
          });
        }
      });
    } else {
      var importers = data;

      importers.forEach(function(element, index, array){
        client.hgetall("importers:"+element, function(err, data){
          if(err){

          } else {
            console.log(data);
          }
        });
      });

      client.smembers("importers:DA-60-CF-2A-24-CF-1H:date", function(err, data){
        data.forEach(function(element, index, array){
          client.hgetall("importers:DA-60-CF-2A-24-CF-1H:date:"+element, function(err, obj){
            console.log(obj);
          });
        });
      });

    }
  });


});
