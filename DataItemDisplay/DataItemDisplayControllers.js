(function(){'use strict';

angular.module("Dave2.DataItemDisplay")
.controller("DataItemDisplayCtrl", DataItemDisplayCtrl)
.controller("DaveDataItemDisplayListPageCtrl", DaveDataItemDisplayListPageCtrl)
.controller("DaveDataItemDisplayPageCtrl", DaveDataItemDisplayPageCtrl)
.controller("AddDataItemModalCtrl", AddDataItemModalCtrl)
.controller("DataItemSettingModalCtrl", DataItemSettingModalCtrl);

DataItemDisplayCtrl.$inject=['$scope','$timeout','DataItemDisplaySocket'];

DaveDataItemDisplayListPageCtrl.$inject=['$scope','$timeout','$compile', "$cookies", 'DataItemDisplaySocket','DirectiveService','generalStateWRS', 'DataItemDisplayRegistryService'];

DaveDataItemDisplayPageCtrl.$inject = ['$scope','$timeout','$compile', "$cookies", "$modal", 'DataItemDisplaySocket','DirectiveService','generalStateWRS', 'DataItemDisplayRegistryService'];

AddDataItemModalCtrl.$inject = ["$scope","$modalInstance","currentDataItems","DataItemDisplaySocket"];

DataItemSettingModalCtrl.$inject = ["$scope","$modalInstance","currentDataItem","DataItemDisplaySocket"];

function DataItemDisplayCtrl($scope,$timeout,DataItemDisplaySocket){
  var vm = this;

  vm.loading = true;
  var highchartsContainer = angular.element("#container");

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

function DaveDataItemDisplayListPageCtrl($scope, $timeout,$compile,$cookies, DataItemDisplaySocket, DirectiveService,generalStateWRS, DataItemDisplayRegistryService){
  var vm = this;

  //functions
  vm.activate = activate;
  vm.addTableColumn = addTableColumn;
  vm.addTableColumnKeyPress = addTableColumnKeyPress;
  vm.closeAlert = closeAlert;
  vm.decreaseColumnIndex = decreaseColumnIndex;
  vm.increaseColumnIndex = increaseColumnIndex;
  vm.removeColumn = removeColumn;
  vm.requestDataItem = requestDataItem;
  vm.toggleLayOutMenu = toggleLayOutMenu;
  vm.toggleSearchMode = toggleSearchMode;
  //variables
  vm.alerts = [];
  vm.avaliableDataItemTableColumns = [];
  vm.dataItemList = [];
  vm.dataItemListCurrentPage = 1;
  vm.dataItemListTableColumns = [
    {name: "name", status: true, index: 0},
    {name:  "location", status: true, index: 1},
    {name:  "note", status: true, index: 2},
    {name: "precision", status: true, index: 3},
    {name: "unit", status: true, index: 4}
  ];
  vm.disableSetUpButton = false;
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

    vm.options = $scope.options ? JSON.parse($scope.options) : {};
    console.log(vm.options);
    if(vm.options.length !== 0){
      for(var key in vm.options){
        vm[key] = vm.options[key];
        console.log(vm[key]);

      }
    }
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

  function closeAlert(index){
    angular.element('div.alert.animated#dataItemList'+index).removeClass("fadeInDown");
    angular.element('div.alert.animated#dataItemList'+index).addClass("fadeOutUp");
    vm.alerts.splice(index, 1);
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
    DataItemDisplayRegistryService.recordToDoItems([dataItem]);
    if(angular.element('dave-data-item-display-page').length === 0){

      var bindScope = $scope.$parent.$new(true);
      bindScope.dataItemsToRequest = [dataItem];
      DirectiveService.DestroyDirectiveService('dave-data-item-display-list-page', $scope);

      DirectiveService.AddDirectiveService('.dataItemDisplayContainer', '<dave-data-item-display-page class="angular-directive" dave-data-items="{{dataItemsToRequest}}"></dave-data-item-display-page>', bindScope, $compile);
    }
  }
  function toggleLayOutMenu(){
    angular.element('.js-layout').toggleClass('hidden');
  }
  function toggleSearchMode(){
    DirectiveService.EnterSearchMode('dave-data-item-display-list-page', '<dave-data-item-display-list-page></dave-data-item-display-list-page>', '.dataItemDisplayContainer',$scope, $compile);
  }
}

function DaveDataItemDisplayPageCtrl($scope, $timeout, $compile, $cookies, $modal, DataItemDisplaySocket,  DirectiveService,generalStateWRS, DataItemDisplayRegistryService){
  var vm = this;

  //functions
  vm.activate = activate;
  vm.addDataItem = addDataItem;
  vm.backToDataItemList = backToDataItemList;
  vm.closeAlert = closeAlert;
  vm.removeData = removeData;
  vm.openSettingModal = openSettingModal;
  vm.toggleSearchMode = toggleSearchMode;
  //variables
  vm.alerts = [];
  vm.completeState = 0;
  vm.dataItemsData = [

  ];
  vm.dataItemsToRequest = DataItemDisplayRegistryService.readToDoItems();

  vm.loading = true;
  vm.systemStatus = "Normal";

  vm.waitingMessage = "Loading Data From Server";

  var highchartsContainer = angular.element("#container");

  $scope.$on('socket:ipDataItemResponse', function(event,data){
    console.log(data);
    if(data.reply === "ERROR"){
      vm.loading = false;
      var alertExsited = false;
      for(var i = 0; i < vm.alerts.length; i ++){
        if(vm.alerts[i].msg === 'Loading Data Item Failed. Please Check Your Internet Connection.'){
          alertExsited = true;
        }
      }
      if(!alertExsited){
        vm.alerts.push({ type: 'danger', msg: 'Loading Data Item Failed. Please Check Your Internet Connection.' });
      }
      vm.systemStatus = "Error";
    } else {

      console.log(data.payload.name);
      if(data.completeState){
        if(data.completeState !== 1){
          if((data.completeState * 100 - vm.completeState) > 5 ){
            vm.completeState = data.completeState * 100;
          }
          vm.dataItemsData[data.payload.name] = vm.dataItemsData[data.payload.name].concat(data.list_out);
        } else {

          vm.completeState = data.completeState * 100;
          vm.dataItemsData[data.payload.name] = vm.dataItemsData[data.payload.name].concat(data.list_out);
          console.log(vm.dataItemsData[data.payload.name].length);
          console.log("First Value: " + vm.dataItemsData[data.payload.name][0]);
          console.log("Last Value: " + vm.dataItemsData[data.payload.name][vm.dataItemsData[data.payload.name].length - 1]);
          vm.loading = false;

          if(highchartsContainer.highcharts() === undefined){
            var highOptions = {
              chart:{
                zoomType:'x',
                type:"spline"
              },
              title: {
                text: vm.dataItemsToRequest[0].name
              },
              tooltip:{
                pointFormat: ' | <span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b>',
                positioner:function(){
                  return { x: 0, y: 0 };
                },
                crosshairs: {
                  // dashStyle: 'dash',
                  color:'black'
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
                        // fillColor:'greenyellow'
                      }
                    }
                  },
                  animation:true,
                  states:{
                    hover:false
                  },
                  lineWidth: 1
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
                    // highchartsContainer.highcharts().showLoading('Loading data from server...');
                    // DataItemDisplaySocket.emit("ipAsychLoadingDataRequest", {min: this.min, max: this.max, name: vm.dataItemsToRequest.name, location: vm.dataItemsToRequest.location});
                  }
                },
                minRange: 10000
              },
              navigator : {
              },
              scrollbar: {
                liveRedraw: false
              },

              rangeSelector: {
                enabled:true,
                buttonTheme: { // styles for the buttons
                  fill: 'orange',
                  stroke: 'none',
                  'stroke-width': 0,
                  r: 8,
                  style: {
                    color: '#000',
                    fontWeight: 'bold'
                  },
                  states: {
                    hover: {
                    },
                    select: {
                      fill: 'black',
                      style: {
                        color: 'white'
                      }
                    }
                  }
                },
                buttons: [{
                  type: 'second',
                  count: 30,
                  text: '30s'
                }, {
                  type: 'minute',
                  count: 1,
                  text: '1m'
                }, {
                  type: 'minute',
                  count: 30,
                  text: '30m'
                }, {
                  type: 'hour',
                  count: 1,
                  text: '1h'
                }, {
                  type: 'hour',
                  count: 3,
                  text: '3h'
                }, {
                  type: 'all',
                  text: 'All'
                }],
                selected: 2
              },


              series: [{
                name: data.payload.name,
                data:vm.dataItemsData[data.payload.name]
              }]
            };
            highchartsContainer.highcharts('StockChart', highOptions);
          } else {
            highchartsContainer.highcharts().addSeries({
              name: data.payload.name,
              data:vm.dataItemsData[data.payload.name]});
            }

          }
        } else if (data.list_out){
          for( var p = 0; p < data.list_out.length; p ++){
            highchartsContainer.highcharts().series[0].addPoint(data.list_out[p], true, true);
          }

        }

      }
    });

    $scope.$on('socket:ipAsychLoadingDataResponse', function(event, data){
      console.log(event.name);
      highchartsContainer.highcharts().series[0].setData(data);
      highchartsContainer.highcharts().hideLoading();
    });

    $scope.$on('$destroy', function(){
      DataItemDisplaySocket.emit('stopDataItemConnection');
    });

    $scope.$watch(function(){
      return DataItemDisplayRegistryService.readToDoItems();
    }, function(newValue, OldValue){
      console.log(newValue);
      vm.dataItemsToRequest = DataItemDisplayRegistryService.readfinishedItems().concat(newValue);
      for(var i = 0; i < newValue.length; i++){
        DataItemDisplaySocket.emit('requestDataItem', newValue[i]);
        vm.dataItemsData[newValue[i].name] = [];
        DataItemDisplayRegistryService.clearToDoItems(newValue[i]);
      }
    }, true);
    vm.activate();
    //////////////////////////

    function activate(){
      // if($cookies.getObject('requestedDataItems') === undefined){
      //   $cookies.putObject('requestedDataItems', vm.dataItemsToRequest);
      // }
      // vm.dataItemsToRequest = $cookies.getObject('requestedDataItems');
      // $cookies.remove('requestedDataItems');
      vm.dataItemsToRequest = DataItemDisplayRegistryService.readToDoItems();
      for(var i = 0; i < vm.dataItemsToRequest.length; i ++){
        DataItemDisplaySocket.emit('requestDataItem', vm.dataItemsToRequest[i]);
        vm.dataItemsData[vm.dataItemsToRequest[i].name] = [];
        DataItemDisplayRegistryService.clearToDoItems(vm.dataItemsToRequest[i]);
        console.log(vm.dataItemsToRequest);
      }
    }

    function addDataItem(){
      var addDataItemInterface = $modal.open({
        templateUrl:"DataItemDisplay/DataItemModalViews/addDataItem.html",
        controller: "AddDataItemModalCtrl as addDataItemModalCtrl",
        size: "lg",
        resolve :{
          currentDataItems : function(){
            return vm.dataItemsToRequest;
          }
        }
      });

      addDataItemInterface.result.then(function(data){
        console.log(data);
      });
    }

    function backToDataItemList(){
      var bindScope = $scope.$parent.$new(true);
      DirectiveService.DestroyDirectiveService('dave-data-item-display-page', $scope);
      DirectiveService.AddDirectiveService('.dataItemDisplayContainer','<dave-data-item-display-list-page  class="angular-directive"></dave-data-item-display-list-page>',bindScope, $compile);
      DataItemDisplayRegistryService.clearDataItems();
    }

    function closeAlert(index){
      angular.element('div.alert.animated#dataItem'+index).removeClass("fadeInDown");
      angular.element('div.alert.animated#dataItem'+index).addClass("fadeOutUp");
      vm.alerts.splice(index, 1);
    }

    function removeData(){
      highchartsContainer.highcharts().series[0].setData([]);
    }

    function openSettingModal(index){
      var dataItemSettingInterface = $modal.open({
        templateUrl:"DataItemDisplay/DataItemModalViews/dataItemSetting.html",
        controller: "DataItemSettingModalCtrl as dataItemSettingModalCtrl",
        resolve :{
          currentDataItem : function(){
            return vm.dataItemsToRequest[index];
          }
        }
      });

      dataItemSettingInterface.result.then(function(data){
        console.log(data);
      });
    }

    function toggleSearchMode(){
      // $cookies.putObject('requestedDataItems', vm.dataItemsToRequest);
      DirectiveService.EnterSearchMode('dave-data-item-display-page', '<dave-data-item-display-page></dave-data-item-display-page>', '.dataItemDisplayContainer',$scope, $compile);
    }
  }

  function AddDataItemModalCtrl($scope, $modalInstance, currentDataItems, DataItemDisplaySocket){
    var vm = this;

    //functions
    vm.activate = activate;
    vm.cancel = cancel;
    //variables

    vm.activate();
    //////////////////////////////
    function activate(){
      console.log(currentDataItems);
    }

    function cancel(){
      console.log('called');
      $modalInstance.dismiss('cancel');
    }
  }

  function DataItemSettingModalCtrl($scope, $modalInstance, currentDataItem, DataItemDisplaySocket){
    var vm = this;

    //functions
    vm.activate = activate;
    vm.cancel = cancel;
    //variables

    //////////////////////////////

    function activate(){

    }

    function cancel(){
      console.log('called');
      $modalInstance.dismiss('cancel');
    }
  }
}());
