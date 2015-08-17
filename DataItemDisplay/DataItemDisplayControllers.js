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

}

function DaveDataItemDisplayListPageCtrl($scope, $timeout,$compile,$cookies, DataItemDisplaySocket, DirectiveService,generalStateWRS, DataItemDisplayRegistryService){
  var vm = this;

  //functions
  vm.activate = activate;
  vm.addTableColumn = addTableColumn;
  vm.addTableColumnKeyPress = addTableColumnKeyPress;
  vm.cancelMultipleDataItems = cancelMultipleDataItems;
  vm.closeAlert = closeAlert;
  vm.decreaseColumnIndex = decreaseColumnIndex;
  vm.increaseColumnIndex = increaseColumnIndex;
  vm.removeColumn = removeColumn;
  vm.requestDataItem = requestDataItem;
  vm.requestMultipleDataItems = requestMultipleDataItems;
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
  vm.disableMultipleSelectionMode = false;
  vm.multipleSelectionMode = false;
  vm.promiseToSolve = '';
  vm.search = {};
  vm.selectedDataItems = [];
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

  function cancelMultipleDataItems(){
    vm.multipleSelectionMode = false;
    DataItemDisplayRegistryService.clearDataItems();

    vm.selectedDataItems = [];
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
    console.log(vm.multipleSelectionMode);
    if(vm.multipleSelectionMode){
      if(vm.selectedDataItems.indexOf(dataItem) === -1){
        vm.selectedDataItems.push(dataItem);
      } else {
        vm.selectedDataItems.splice(vm.selectedDataItems.indexOf(dataItem), 1);
      }

    } else {
      DataItemDisplayRegistryService.recordToDoItems([dataItem]);
      if(angular.element('dave-data-item-display-page').length === 0){

        var bindScope = $scope.$parent.$new(true);
        DirectiveService.DestroyDirectiveService('dave-data-item-display-list-page', $scope);

        DirectiveService.AddDirectiveService('.dataItemDisplayContainer', '<dave-data-item-display-page class="angular-directive"></dave-data-item-display-page>', bindScope, $compile);
      }
    }
  }

  function requestMultipleDataItems(){
    console.log(vm.selectedDataItems.length);
    if(vm.selectedDataItems.length !== 0){
      DataItemDisplayRegistryService.recordToDoItems(vm.selectedDataItems);
      console.log(DataItemDisplayRegistryService.readToDoItems());
      if(angular.element('dave-data-item-display-page').length === 0){

        var bindScope = $scope.$parent.$new(true);
        DirectiveService.DestroyDirectiveService('dave-data-item-display-list-page', $scope);

        DirectiveService.AddDirectiveService('.dataItemDisplayContainer', '<dave-data-item-display-page class="angular-directive"></dave-data-item-display-page>', bindScope, $compile);


      }
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
  vm.changeDataItemStatusTo = changeDataItemStatusTo;
  vm.openSettingModal = openSettingModal;
  vm.toggleSearchMode = toggleSearchMode;
  //variables
  vm.alerts = [];
  vm.completeStates = [];
  vm.dataItemsData = [

  ];
  vm.currentDataItems = DataItemDisplayRegistryService.readCurrentDataItems();
  vm.currentDataItemsStatus = [];
  vm.dataItemsToWait = [];
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
        if(vm.completeStates[data.payload.name] === undefined){
          vm.completeStates[data.payload.name] = 0;
        }
        if(data.completeState !== 1){
          if((data.completeState * 100 - vm.completeStates[[data.payload.name]]) > 5 ){
            vm.completeStates[data.payload.name] = data.completeState * 100;
          }
          vm.dataItemsData[data.payload.name] = vm.dataItemsData[data.payload.name].concat(data.list_out);
        } else {

          vm.completeState = data.completeState * 100;
          vm.dataItemsData[data.payload.name] = vm.dataItemsData[data.payload.name].concat(data.list_out);
          console.log(vm.dataItemsData[data.payload.name].length);
          console.log("First Value: " + vm.dataItemsData[data.payload.name][0]);
          console.log("Last Value: " + vm.dataItemsData[data.payload.name][vm.dataItemsData[data.payload.name].length - 1]);

          vm.dataItemsToWait.forEach(function(element, index, array){
            if(element.name === data.payload.name){
              array.splice(index, 1);
            }
          });

          if(vm.dataItemsToWait.length === 0){
            var temp = [];
            for(var key in vm.dataItemsData){
              temp.push({
                name: key,
                data: vm.dataItemsData[key]
              });

            }

            temp.forEach(function(element, array, index){
              highchartsContainer.highcharts().addSeries(element);
            });
            vm.loading = false;

          }


        }
      } else if (data.list_out){
        for( var p = 0; p < data.list_out.length; p ++){

          for(var p0 = 0; p0 < highchartsContainer.highcharts().series.length; p0++){
            if(highchartsContainer.highcharts().series[p0].name === data.payload.name){
              highchartsContainer.highcharts().series[p0].addPoint(data.list_out[p], true, true);
            }
          }
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

  vm.activate();
  //////////////////////////

  function activate(){
    var dataItemsToRequest= DataItemDisplayRegistryService.readToDoItems();
    for(var i = 0; i < dataItemsToRequest.length; i++){
      DataItemDisplaySocket.emit('requestDataItem', dataItemsToRequest[i]);
      DataItemDisplayRegistryService.clearToDoItem(dataItemsToRequest[i]);
      vm.dataItemsData[dataItemsToRequest[i].name] = [];
      vm.dataItemsToWait.push(dataItemsToRequest[i]);
      console.log(vm.dataItemsToWait);
      vm.currentDataItemsStatus.push(true);
    }
    vm.currentDataItems = DataItemDisplayRegistryService.readCurrentDataItems();

    var highOptions = {
      chart:{
        zoomType:'x',
        type:"spline"
      },
      title: {
        text: vm.currentDataItems[0].name
      },
      tooltip:{
        pointFormat: ' | <span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> <br/>',
        positioner:function(){
          return { x: 0, y: 0 };
        },
        hideDelay: 100000,
        crosshairs: {
          // dashStyle: 'dash',
          color:'black',
          hideDelay: 100000,
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
          lineWidth: 2,
          gapSize: 2

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
            // DataItemDisplaySocket.emit("ipAsychLoadingDataRequest", {min: this.min, max: this.max, name: vm.currentDataItems.name, location: vm.currentDataItems.location});
          }
        },
        minRange: 10000
      },
      navigator : {
        // enabled: false
      },
      scrollbar: {
        liveRedraw: true
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
    };
    highchartsContainer.highcharts('StockChart', highOptions);
  }

  function addDataItem(){
    var addDataItemInterface = $modal.open({
      templateUrl:"DataItemDisplay/DataItemModalViews/addDataItem.html",
      controller: "AddDataItemModalCtrl as addDataItemModalCtrl",
      size: "lg",
      resolve :{
        currentDataItems : function(){
          return vm.currentDataItems;
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

  function changeDataItemStatusTo(dataItem, index, status){
    if(highchartsContainer.highcharts()){
      var answer = 0;
      highchartsContainer.highcharts().series.forEach(function(element, index, array){
        if(element.name === dataItem.name){
          answer = index;
        }
      });
      vm.currentDataItemsStatus[index] = status;
      if(status){
        highchartsContainer.highcharts().series[answer].show();
      } else {
        highchartsContainer.highcharts().series[answer].hide();
      }


    }
  }

  function openSettingModal(index){
    var dataItemSettingInterface = $modal.open({
      templateUrl:"DataItemDisplay/DataItemModalViews/dataItemSetting.html",
      controller: "DataItemSettingModalCtrl as dataItemSettingModalCtrl",
      resolve :{
        currentDataItem : function(){
          return vm.currentDataItems[index];
        }
      }
    });

    dataItemSettingInterface.result.then(function(data){
      console.log(data);
    });
  }


  function toggleSearchMode(){
    // $cookies.putObject('requestedDataItems', vm.currentDataItems);
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
