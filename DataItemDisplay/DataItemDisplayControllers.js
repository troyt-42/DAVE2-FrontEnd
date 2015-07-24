(function(){'use strict';

angular.module("Dave2.DataItemDisplay")
.controller("DataItemDisplayCtrl", DataItemDisplayCtrl)
.controller("DaveDataItemDisplayListPageCtrl", DaveDataItemDisplayListPageCtrl);

DataItemDisplayCtrl.$inject=['$scope','$timeout','DataItemDisplaySocket'];
DaveDataItemDisplayListPageCtrl.$inject=['$scope','$timeout','$compile', "$cookies", 'DataItemDisplaySocket','DirectiveService','generalStateWRS'];

function DataItemDisplayCtrl($scope,$timeout,DataItemDisplaySocket){
  var vm = this;
  var highchartsContainer = angular.element("#container");

  vm.loading = true;

  DataItemDisplaySocket.on('importersInfo', function(data){
    console.log(data);
  });

  DataItemDisplaySocket.on('importersData', function(data){

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
            DataItemDisplaySocket.emit("displayRquest", {min: this.min, max: this.max});
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

  DataItemDisplaySocket.on('displayResponse', function(data){
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

function DaveDataItemDisplayListPageCtrl($scope, $timeout,$compile,$cookies, DataItemDisplaySocket, DirectiveService,generalStateWRS){
  var vm = this;

  //functions
  vm.activate = activate;
  vm.addTableColumn = addTableColumn;
  vm.addTableColumnKeyPress = addTableColumnKeyPress;
  vm.decreaseColumnIndex = decreaseColumnIndex;
  vm.increaseColumnIndex = increaseColumnIndex;
  vm.removeColumn = removeColumn;
  vm.requestDataItem = requestDataItem;
  vm.toggleLayOutMenu = toggleLayOutMenu;
  vm.toggleSearchMode = toggleSearchMode;
  //variables
  vm.alerts = [];
  vm.avaliableDataItemTableColumns = [];
  vm.dataItemData = [];
  vm.dataItemList = [];
  vm.dataItemListCurrentPage = 1;
  vm.dataItemListTableColumns = [
    {name: "name", status: true, index: 0},
    {name:  "location", status: true, index: 1},
    {name:  "note", status: true, index: 2},
    {name: "precision", status: true, index: 3},
    {name: "unit", status: true, index: 4}
  ];
  vm.promiseToSolve = '';
  vm.search = {};
  vm.systemStatus = 'Normal';
  vm.loading = true;
  $scope.$on('socket:ipDataItemListResponse', function(event, data){
    console.log(event.name);
    if(vm.systemStatus === "Normal"){
      $timeout.cancel(vm.promiseToSolve);
      if(data.completeState !== 1.0){
        vm.dataItemList = vm.dataItemList.concat(data.list_out);
        // angular.element(".js-layout").addClass("hidden");
      } else {
        vm.dataItemList = vm.dataItemList.concat(data.list_out);
        vm.loading = false;
      }
    }
  });

  $scope.$on('socket:ipDataItemResponse', function(event,data){
    console.log(event.name);
    if(data.completeState !== 1){
      vm.dataItemData = vm.dataItemData.concat(data.list_out);
    } else {
      console.log(vm.dataItemData.length);
    }
  });
  vm.activate();
  /////////////////

  function activate(){
    $cookies.remove('dataItemListTableColumns');
    if($cookies.getObject('dataItemListTableColumns') === undefined){
      $cookies.putObject('dataItemListTableColumns', vm.dataItemListTableColumns);
    }
    vm.dataItemListTableColumns = $cookies.getObject('dataItemListTableColumns');
    vm.avaliableDataItemTableColumns = $cookies.getObject('avaliableDataItemTableColumns') || [];

    DataItemDisplaySocket.emit('requestDataItemList');
    vm.promiseToSolve =  $timeout(function(){

      var alertExsited = false;
      for(var i = 0; i < vm.alerts.length; i ++){
        if(vm.alerts[i].msg === 'Loading Importer List Failed. Please Check Your Internet Connection.'){
          alertExsited = true;
        }
      }
      if(!alertExsited){
        vm.alerts.push({ type: 'danger', msg: 'Loading Importer List Failed. Please Check Your Internet Connection.' });
      }
      vm.systemStatus = "Error";
    },5000);

    generalStateWRS.writeState('hasMenu', false);
  }

  function addTableColumn(column, index){
    if(vm.avaliableDataItemTableColumns.length !== 0){
      vm.dataItemListTableColumns[column.index - 1].status = true;
      vm.avaliableDataItemTableColumns.splice(index, 1);
      $cookies.putObject('dataItemListTableColumns', vm.dataItemListTableColumns);
      $cookies.putObject('avaliableDataItemTableColumns', vm.avaliableDataItemTableColumns);
    } else {

    }
  }

  function addTableColumnKeyPress(event, column, index){
    console.log(column);
    if(event.keyCode === 13){
      if(column.index === column.newIndex){
        vm.addTableColumn(column, index);
      } else {
        if(column.newIndex > vm.dataItemListTableColumns.length){
          column.newIndex = vm.dataItemListTableColumns.length;
        }
        if(column.newIndex < 1){
          column.newIndex = 1;
        }
        vm.dataItemListTableColumns[column.index - 1].index = column.newIndex - 1;
        vm.dataItemListTableColumns[column.newIndex - 1].index = column.index - 1;
        var temp  = vm.dataItemListTableColumns[column.index - 1];
        vm.dataItemListTableColumns[column.index - 1] = vm.dataItemListTableColumns[column.newIndex - 1];
        vm.dataItemListTableColumns[column.newIndex - 1] = temp;
        column.index = column.newIndex;
        console.log(column);
        console.log(vm.avaliableDataItemTableColumns);
        console.log(vm.dataItemListTableColumns);
        vm.addTableColumn(column, index);

      }
    }
    $cookies.putObject('dataItemListTableColumns', vm.dataItemListTableColumns);
    $cookies.putObject('avaliableDataItemTableColumns', vm.avaliableDataItemTableColumns);
  }

  function decreaseColumnIndex(index){
    for(var i = index - 1; i >= 0; i--){
      if(vm.dataItemListTableColumns[i].status){
        var temp = vm.dataItemListTableColumns[index];
        temp.index = i;
        vm.dataItemListTableColumns[i].index = index;
        vm.dataItemListTableColumns[index] = vm.dataItemListTableColumns[i];
        vm.dataItemListTableColumns[i] = temp;
        break;
      }
    }

  }

  function increaseColumnIndex(index){
    for(var i = index + 1; i < vm.dataItemListTableColumns.length; i++){
      if(vm.dataItemListTableColumns[i].status){
        var temp = vm.dataItemListTableColumns[index];
        temp.index = i;
        vm.dataItemListTableColumns[i].index = index;
        vm.dataItemListTableColumns[index] = vm.dataItemListTableColumns[i];
        vm.dataItemListTableColumns[i] = temp;
        break;
      }
    }
  }

  function removeColumn(index){
    vm.dataItemListTableColumns[index].status = false;
    vm.avaliableDataItemTableColumns.push({index: index + 1, value: vm.dataItemListTableColumns[index].name, newIndex : index + 1});
    console.log(vm.avaliableDataItemTableColumns);
    $cookies.putObject('dataItemListTableColumns', vm.dataItemListTableColumns);
    $cookies.putObject('avaliableDataItemTableColumns', vm.avaliableDataItemTableColumns);
  }

  function requestDataItem(dataItem){
    console.log(dataItem);
    DataItemDisplaySocket.emit('requestDataItem', dataItem);
  }
  function toggleLayOutMenu(){
    angular.element('.js-layout').toggleClass('hidden');
  }
  function toggleSearchMode(){
    DirectiveService.EnterSearchMode('dave-data-item-display-list-page', '<dave-data-item-display-list-page></dave-data-item-display-list-page>', '.dataItemDisplayContainer',$scope, $compile);
  }
}
}());
