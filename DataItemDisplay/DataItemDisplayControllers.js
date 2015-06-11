(function(){'use strict';

angular.module("Dave2.DataItemDisplay")
.controller("DataItemDisplayCtrl", DataItemDisplayCtrl);

DataItemDisplayCtrl.$inject=['$scope','$timeout','dataItemDisplaySocket'];

function DataItemDisplayCtrl($scope,$timeout,dataItemDisplaySocket){
  var vm = this;
  vm.loading = true;
  vm.chartConfig = {

    options: {
      //This is the Main Highcharts chart config. Any Highchart options are valid here.
      //will be overriden by values specified below.
      chart: {
        type: 'line',
        zoomType: 'x'
      },
      data:{
        parseDate:function(data){
          console.log(data);
          return new Date(data);
        }
      }
    },
    //The below properties are watched separately for changes.

    //Series object (optional) - a list of series using normal highcharts series options.
    series: [{
    }],
    //Title configuration (optional)
    title: {
      text: 'Data Item 58-B9-E1-F1-87-89'
    },
    //Boolean to control showng loading status on chart (optional)
    //Could be a string if you want to show specific loading text.
    loading: true,
    //Configuration for the xAxis (optional). Currently only one x axis can be dynamically controlled.
    //properties currentMin and currentMax provied 2-way binding to the chart's maximimum and minimum
    xAxis: {
      title: {text: 'Date'}
    },
    //Whether to use HighStocks instead of HighCharts (optional). Defaults to false.
    useHighStocks: true,
    //size (optional) if left out the chart will default to size of the div or something sensible.
    size: {
      width: 800,
      height: 600
    },
    //function (optional)
    func: function (chart) {
      //setup some logic for the chart
    }
  };

  // var chart = highchartsContainer.highcharts();
  // chart.showLoading();
  dataItemDisplaySocket.on('importersInfo', function(data){
    console.log(data);
  });

  var highchartsContainer = angular.element("#container");
  dataItemDisplaySocket.on('importersData', function(data){
    console.log(data);
    // chart.series[0].setData(data);
    // chart.hideLoading();


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
        }
      },
      plotOptions: {
        series: {
          tooltip:{
            dateTimeLabelFormats:{
              millisecond:"%A, %b %e, %H:%M:%S.%L"
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
        selected: 1
      },


      series: [{
        name:"Data Point",
        data:data
      }]
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
}());
