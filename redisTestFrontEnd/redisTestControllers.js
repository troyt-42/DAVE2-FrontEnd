(function(){'use strict';

angular.module("RedisTest")
.controller("RedisTestCtrl", RedisTestCtrl);

RedisTestCtrl.$inject=['$scope','generalSocket'];

function RedisTestCtrl($scope,generalSocket){
  var vm = this;

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
  generalSocket.on('importersInfo', function(data){
    console.log(data);
  });

  generalSocket.on('importersData', function(data){
    // console.log(data);
    // chart.series[0].setData(data);
    // chart.hideLoading();

    var highchartsContainer = angular.element("#container");
    highchartsContainer.highcharts('StockChart',{
      chart:{
        zoomType:'x',
        type:"areaspline"
      },
      title: {
        text: 'Data Item 58-B9-E1-F1-87-89'
      },
      plotOptions: {
        series: {
          tooltip:{
            dateTimeLabelFormats:{
              millisecond:"%A, %b %e, %H:%M:%S.%L, %Y"
            }
          },
          states:{
            hover:false
          }
        }
      },
      xAxis: {
        type: 'datetime',
        dateTimeLabelFormats: {
          day: '%e  %b %Y',
          month: '%b %Y'
        }
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
        selected: 4
      },


      series: [{
        name:"Data Point",
        data:data
      }]
    });
  });




}
}());
