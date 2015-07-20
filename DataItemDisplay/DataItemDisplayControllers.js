(function(){'use strict';

angular.module("Dave2.DataItemDisplay")
.controller("DataItemDisplayCtrl", DataItemDisplayCtrl)
.controller("DaveDataItemDisplayListPageCtrl", DaveDataItemDisplayListPageCtrl);

DataItemDisplayCtrl.$inject=['$scope','$timeout','dataItemDisplaySocket'];
DaveDataItemDisplayListPageCtrl.$inject=['$scope','$timeout','dataItemDisplaySocket'];

function DataItemDisplayCtrl($scope,$timeout,dataItemDisplaySocket){
  var vm = this;
  var highchartsContainer = angular.element("#container");

  vm.loading = true;

  dataItemDisplaySocket.on('importersInfo', function(data){
    console.log(data);
  });

  dataItemDisplaySocket.on('importersData', function(data){

    highchartsContainer.highcharts('StockChart',{
      chart:{
        zoomType:'x',
        type:"areaspline"
      },
      title: {
        text: 'Data Item 58-B9-E1-F1-87-89'
      },
      tooltip:{
        pointFormat: ' | <span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b>',
        positioner:function(){
          return { x: 10, y: 100 };
        },
        crosshairs: {
          dashStyle: 'dash',
          color:'orange'
        }
      },
      plotOptions: {
        series: {
          tooltip:{
            dateTimeLabelFormats:{
              millisecond:"%A, %b %e, %H:%M:%S.%L"
            }
          },
      		marker:{
      			states:{
      				hover:{
      					fillColor:'orange'
      				}
      			}
      		},
          animation:false,
          states:{
            hover:false
          }
        }
      },
      xAxis: {
        type: 'datetime',
        dateTimeLabelFormats: {
          day: '%e  %b %Y',
          month: '%b'
        },
        events:{
          afterSetExtremes: function(){
            highchartsContainer.highcharts().showLoading('Loading data from server...');
            dataItemDisplaySocket.emit("displayRquest", {min: this.min, max: this.max});
          }
        },
        minRange: 3600 * 1000 * 24 * 7
      },
      navigator : {
        adaptToUpdatedData: false,
        series : {
          data : data
        }
      },
      scrollbar: {
        liveRedraw: false
      },

      rangeSelector: {
        enabled:true,
        allButtonsEnabled:true,
        buttons: [{
          type: 'day',
          count: 3,
          text: '3d'
        }, {
          type: 'week',
          count: 1,
          text: '1w'
        }, {
          type: 'month',
          count: 1,
          text: '1m'
        }, {
          type: 'month',
          count: 6,
          text: '6m'
        }, {
          type: 'year',
          count: 1,
          text: '1y'
        }, {
          type: 'all',
          text: 'All'
        }],
        selected: 2
      },


      series: [{
        name:"Data Point",
        data:data
      }]
    });
    var points = [];
    var points2 = [];
    console.log(data.slice(0,100));

    var min = new Date(data[0][0]);
    var max = new Date(data[data.length - 1][0]);
    var maxYear = max.getFullYear();
    var minYear = min.getFullYear();
    var diff = maxYear - minYear;
    for(var i2 = minYear; i2 < maxYear; i2 ++){
      points.push({
        id:"id_"+i2,
        name:"Data of "+i2,
        value: 12,
        max:4321.241,
        min:1932.490,
        average:3284.531,
        dataLabels: {
          enabled: true,
          format: '<span style="; text-shadow:none">Complete Data of<br><span style=";color:red;text-shadow:none">'+i2+'</span></span>',
          verticalAlign: 'middle',

        }
      });

      for(var p = 1; p <= 4; p++){

        points.push({
          id:"id_"+i2+"_"+p,
          parent:"id_"+i2,
          name:"Data of "+i2+" "+p,
          value: 1
        });
      }
    }

    console.log(points.length);
    for(var i3 = minYear; i3 < maxYear; i3++){
      points2.push([Date.UTC(i3, 0, 0, 0), 12]);
    }

    angular.element("#container2").highcharts('StockChart',{
      chart:{
        animation:true
      },
      tooltip:{
        pointFormat: '<span style="color:{series.color};font-weight:bold">{point.name}</span><br>| <b>Max: </b>{point.max}<br>| <b>Min: </b>{point.min}<br>| <b>Average: </b>{point.average}',

        borderColor:"#3A8AD3",
        borderRadius:5,

      },
      rangeSelector:{
        buttons:[{
          type: 'millisecond',
          count: 100/diff * 1,
          text: '1 item'
        },{
          type: 'millisecond',
          count: 100/diff * 2,
          text: '2 item'
        }, {
          type: 'millisecond',
          count: 100/diff * 4,
          text: '4 items'
        }, {
          type: 'millisecond',
          count: 100/diff * 8,
          text: '8 items'
        }, {
          type: 'millisecond',
          count: 100/diff * 10,
          text: '10 items'
        }],
        selected:4
      },
      navigator:{
        enabled:false,
        adaptToUpdatedData:false,
        xAxis:{

          floor: 0,
          ceiling: 100,
          dateTimeLabelFormats:{
            millisecond: '%L',
            day: '%L',
          }
        }
      },
      xAxis:{
        events:{
          afterSetExtremes:function(){
            console.log(this);
          }
        }
      },
      plotOptions:{
        series:{

          dataGrouping:{
            enabled:false
          }
        },
        treemap:{

          states:{
            hover:{
              enabled:false
            }
          }
        }
      },
      series: [{

        type: "treemap",
        layoutAlgorithm: 'stripes',
        allowDrillToNode: true,
        dataLabels: {
          enabled: false
        },
        levelIsConstant: false,
        levels: [{
          level: 1,
          dataLabels: {
            enabled: true,
            style:{
              fontSize:'1.3em'
            }
          },
          borderWidth: 3,
          borderColor:'white',
          color:'black'
        },{
          level:2,
          borderColor:'#3A8AD3'
        }],
        data:points
      }],
      subtitle: {
        text: 'Data Table'
      },
      title: {
        text: '58-B9-E1-F1-87-89'
      }
    });

    var temp = [];
    for(var i = 0; i < 100; i ++){
      var date =new Date(data[i][0]);
      temp.push([date.toUTCString(), data[i][1]]);
    }



    vm.tableData = temp;
    vm.loading = false;

  });

  dataItemDisplaySocket.on('displayResponse', function(data){
    console.log(data);
    highchartsContainer.highcharts().series[0].setData(data);
    highchartsContainer.highcharts().hideLoading();
    var temp = [];
    for(var i = 0; i < 100; i ++){
      var date =new Date(data[i][0]);
      temp.push([date.toUTCString(), data[i][1]]);
    }
    vm.tableData = temp;
  });


}

function DaveDataItemDisplayListPageCtrl($scope, $timeout, dataItemDisplaySocket){
  var vm = this;

  //functions
  vm.activate = activate;
  //variables

  vm.activate();
  /////////////////

  function activate(){
    dataItemDisplaySocket.emit('requestDataItemList');
  }
}
}());
