!function(){"use strict";function e(e,t,a){var l=this;l.loading=!0;var o=angular.element("#container");a.on("importersInfo",function(e){console.log(e)}),a.on("importersData",function(e){o.highcharts("StockChart",{chart:{zoomType:"x",type:"areaspline"},title:{text:"Data Item 58-B9-E1-F1-87-89"},tooltip:{pointFormat:' | <span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b>',positioner:function(){return{x:10,y:100}},crosshairs:{dashStyle:"dash",color:"orange"}},plotOptions:{series:{tooltip:{dateTimeLabelFormats:{millisecond:"%A, %b %e, %H:%M:%S.%L"}},marker:{states:{hover:{fillColor:"orange"}}},animation:!1,states:{hover:!1}}},xAxis:{type:"datetime",dateTimeLabelFormats:{day:"%e  %b %Y",month:"%b"},events:{afterSetExtremes:function(){o.highcharts().showLoading("Loading data from server..."),a.emit("displayRquest",{min:this.min,max:this.max})}},minRange:6048e5},navigator:{adaptToUpdatedData:!1,series:{data:e}},scrollbar:{liveRedraw:!1},rangeSelector:{enabled:!0,allButtonsEnabled:!0,buttons:[{type:"day",count:3,text:"3d"},{type:"week",count:1,text:"1w"},{type:"month",count:1,text:"1m"},{type:"month",count:6,text:"6m"},{type:"year",count:1,text:"1y"},{type:"all",text:"All"}],selected:2},series:[{name:"Data Point",data:e}]});var t=[],n=[];console.log(e.slice(0,100));for(var s=new Date(e[0][0]),i=new Date(e[e.length-1][0]),m=i.getFullYear(),r=s.getFullYear(),d=m-r,c=r;m>c;c++){t.push({id:"id_"+c,name:"Data of "+c,value:12,max:4321.241,min:1932.49,average:3284.531,dataLabels:{enabled:!0,format:'<span style="; text-shadow:none">Complete Data of<br><span style=";color:red;text-shadow:none">'+c+"</span></span>",verticalAlign:"middle"}});for(var u=1;4>=u;u++)t.push({id:"id_"+c+"_"+u,parent:"id_"+c,name:"Data of "+c+" "+u,value:1})}console.log(t.length);for(var p=r;m>p;p++)n.push([Date.UTC(p,0,0,0),12]);angular.element("#container2").highcharts("StockChart",{chart:{animation:!0},tooltip:{pointFormat:'<span style="color:{series.color};font-weight:bold">{point.name}</span><br>| <b>Max: </b>{point.max}<br>| <b>Min: </b>{point.min}<br>| <b>Average: </b>{point.average}',borderColor:"#3A8AD3",borderRadius:5},rangeSelector:{buttons:[{type:"millisecond",count:100/d*1,text:"1 item"},{type:"millisecond",count:100/d*2,text:"2 item"},{type:"millisecond",count:100/d*4,text:"4 items"},{type:"millisecond",count:100/d*8,text:"8 items"},{type:"millisecond",count:100/d*10,text:"10 items"}],selected:4},navigator:{enabled:!1,adaptToUpdatedData:!1,xAxis:{floor:0,ceiling:100,dateTimeLabelFormats:{millisecond:"%L",day:"%L"}}},xAxis:{events:{afterSetExtremes:function(){console.log(this)}}},plotOptions:{series:{dataGrouping:{enabled:!1}},treemap:{states:{hover:{enabled:!1}}}},series:[{type:"treemap",layoutAlgorithm:"stripes",allowDrillToNode:!0,dataLabels:{enabled:!1},levelIsConstant:!1,levels:[{level:1,dataLabels:{enabled:!0,style:{fontSize:"1.3em"}},borderWidth:3,borderColor:"white",color:"black"},{level:2,borderColor:"#3A8AD3"}],data:t}],subtitle:{text:"Data Table"},title:{text:"58-B9-E1-F1-87-89"}});for(var I=[],g=0;100>g;g++){var D=new Date(e[g][0]);I.push([D.toUTCString(),e[g][1]])}l.tableData=I,l.loading=!1}),a.on("displayResponse",function(e){console.log(e),o.highcharts().series[0].setData(e),o.highcharts().hideLoading();for(var t=[],a=0;100>a;a++){var n=new Date(e[a][0]);t.push([n.toUTCString(),e[a][1]])}l.tableData=t})}function t(e,t,a,l,o,n,s,i){function m(){if(l.remove("dataItemListTableColumns"),void 0===l.getObject("dataItemListTableColumns")&&l.putObject("dataItemListTableColumns",y.dataItemListTableColumns),y.dataItemListTableColumns=l.getObject("dataItemListTableColumns"),y.avaliableDataItemTableColumns=l.getObject("avaliableDataItemTableColumns")||[],o.emit("requestDataItemList"),y.promiseToSolve=t(function(){for(var e=!1,t=0;t<y.alerts.length;t++)"Loading Importer List Failed. Please Check Your Internet Connection."===y.alerts[t].msg&&(e=!0);e||y.alerts.push({type:"danger",msg:"Loading Importer List Failed. Please Check Your Internet Connection."}),y.systemStatus="Error"},5e3),s.writeState("hasMenu",!1),y.options=e.options?JSON.parse(e.options):{},console.log(y.options),0!==y.options.length)for(var a in y.options)y[a]=y.options[a],console.log(y[a])}function r(e,t){0!==y.avaliableDataItemTableColumns.length&&(y.dataItemListTableColumns[e.index-1].status=!0,y.avaliableDataItemTableColumns.splice(t,1),l.putObject("dataItemListTableColumns",y.dataItemListTableColumns),l.putObject("avaliableDataItemTableColumns",y.avaliableDataItemTableColumns))}function d(e,t,a){if(console.log(t),13===e.keyCode)if(t.index===t.newIndex)y.addTableColumn(t,a);else{t.newIndex>y.dataItemListTableColumns.length&&(t.newIndex=y.dataItemListTableColumns.length),t.newIndex<1&&(t.newIndex=1),y.dataItemListTableColumns[t.index-1].index=t.newIndex-1,y.dataItemListTableColumns[t.newIndex-1].index=t.index-1;var o=y.dataItemListTableColumns[t.index-1];y.dataItemListTableColumns[t.index-1]=y.dataItemListTableColumns[t.newIndex-1],y.dataItemListTableColumns[t.newIndex-1]=o,t.index=t.newIndex,console.log(t),console.log(y.avaliableDataItemTableColumns),console.log(y.dataItemListTableColumns),y.addTableColumn(t,a)}l.putObject("dataItemListTableColumns",y.dataItemListTableColumns),l.putObject("avaliableDataItemTableColumns",y.avaliableDataItemTableColumns)}function c(){y.multipleSelectionMode=!1,i.clearDataItems(),y.selectedDataItems=[]}function u(e){angular.element("div.alert.animated#dataItemList"+e).removeClass("fadeInDown"),angular.element("div.alert.animated#dataItemList"+e).addClass("fadeOutUp"),y.alerts.splice(e,1)}function p(e){for(var t=e-1;t>=0;t--)if(y.dataItemListTableColumns[t].status){var a=y.dataItemListTableColumns[e];a.index=t,y.dataItemListTableColumns[t].index=e,y.dataItemListTableColumns[e]=y.dataItemListTableColumns[t],y.dataItemListTableColumns[t]=a;break}}function I(e){for(var t=e+1;t<y.dataItemListTableColumns.length;t++)if(y.dataItemListTableColumns[t].status){var a=y.dataItemListTableColumns[e];a.index=t,y.dataItemListTableColumns[t].index=e,y.dataItemListTableColumns[e]=y.dataItemListTableColumns[t],y.dataItemListTableColumns[t]=a;break}}function g(e){y.dataItemListTableColumns[e].status=!1,y.avaliableDataItemTableColumns.push({index:e+1,value:y.dataItemListTableColumns[e].name,newIndex:e+1}),console.log(y.avaliableDataItemTableColumns),l.putObject("dataItemListTableColumns",y.dataItemListTableColumns),l.putObject("avaliableDataItemTableColumns",y.avaliableDataItemTableColumns)}function D(t){if(console.log(y.multipleSelectionMode),y.multipleSelectionMode)-1===y.selectedDataItems.indexOf(t)?y.selectedDataItems.push(t):y.selectedDataItems.splice(y.selectedDataItems.indexOf(t),1);else if(i.recordToDoItems([t]),0===angular.element("dave-data-item-display-page").length){var l=e.$parent.$new(!0);n.DestroyDirectiveService("dave-data-item-display-list-page",e),n.AddDirectiveService(".dataItemDisplayContainer",'<dave-data-item-display-page class="angular-directive"></dave-data-item-display-page>',l,a)}}function h(){if(console.log(y.selectedDataItems.length),0!==y.selectedDataItems.length&&(i.recordToDoItems(y.selectedDataItems),console.log(i.readToDoItems()),0===angular.element("dave-data-item-display-page").length)){var t=e.$parent.$new(!0);n.DestroyDirectiveService("dave-data-item-display-list-page",e),n.AddDirectiveService(".dataItemDisplayContainer",'<dave-data-item-display-page class="angular-directive"></dave-data-item-display-page>',t,a)}}function b(){angular.element(".js-layout").toggleClass("hidden")}function v(){n.EnterSearchMode("dave-data-item-display-list-page","<dave-data-item-display-list-page></dave-data-item-display-list-page>",".dataItemDisplayContainer",e,a)}var y=this;y.activate=m,y.addTableColumn=r,y.addTableColumnKeyPress=d,y.cancelMultipleDataItems=c,y.closeAlert=u,y.decreaseColumnIndex=p,y.increaseColumnIndex=I,y.removeColumn=g,y.requestDataItem=D,y.requestMultipleDataItems=h,y.toggleLayOutMenu=b,y.toggleSearchMode=v,y.alerts=[],y.avaliableDataItemTableColumns=[],y.dataItemList=[],y.dataItemListCurrentPage=1,y.dataItemListTableColumns=[{name:"name",status:!0,index:0},{name:"location",status:!0,index:1},{name:"note",status:!0,index:2},{name:"precision",status:!0,index:3},{name:"unit",status:!0,index:4}],y.disableSetUpButton=!1,y.disableMultipleSelectionMode=!1,y.multipleSelectionMode=!1,y.promiseToSolve="",y.search={},y.selectedDataItems=[],y.systemStatus="Normal",y.loading=!0,e.$on("socket:ipDataItemListResponse",function(e,a){console.log(e.name),"Normal"===y.systemStatus&&(t.cancel(y.promiseToSolve),1!==a.completeState?y.dataItemList=y.dataItemList.concat(a.list_out):(y.dataItemList=y.dataItemList.concat(a.list_out),y.loading=!1))}),y.activate()}function a(e,t,a,l,o,n,s,i,m){function r(){for(var e=m.readToDoItems(),t=0;t<e.length;t++)n.emit("requestDataItem",e[t]),m.clearToDoItem(e[t]),D.dataItemsData[e[t].name]=[],D.dataItemsToWait.push(e[t]),console.log(D.dataItemsToWait);D.currentDataItems=m.readCurrentDataItems();var a={chart:{zoomType:"x",type:"spline"},title:{text:D.currentDataItems[0].name},tooltip:{pointFormat:' | <span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> <br/>',positioner:function(){return{x:0,y:0}},hideDelay:1e5,crosshairs:{color:"black",hideDelay:1e5}},plotOptions:{series:{tooltip:{dateTimeLabelFormats:{millisecond:"%A, %b %e, %H:%M:%S.%L"}},marker:{states:{hover:{}}},animation:!0,states:{hover:!1},lineWidth:2,gapSize:2}},xAxis:{type:"datetime",dateTimeLabelFormats:{day:"%e  %b %Y",month:"%b"},events:{afterSetExtremes:function(){}},minRange:1e4},navigator:{},scrollbar:{liveRedraw:!0},rangeSelector:{enabled:!0,buttonTheme:{fill:"orange",stroke:"none","stroke-width":0,r:8,style:{color:"#000",fontWeight:"bold"},states:{hover:{},select:{fill:"black",style:{color:"white"}}}},buttons:[{type:"second",count:30,text:"30s"},{type:"minute",count:1,text:"1m"},{type:"minute",count:30,text:"30m"},{type:"hour",count:1,text:"1h"},{type:"hour",count:3,text:"3h"},{type:"all",text:"All"}],selected:2}};h.highcharts("StockChart",a)}function d(){var e=o.open({templateUrl:"DataItemDisplay/DataItemModalViews/addDataItem.html",controller:"AddDataItemModalCtrl as addDataItemModalCtrl",size:"lg",resolve:{currentDataItems:function(){return D.currentDataItems}}});e.result.then(function(e){console.log(e)})}function c(){var t=e.$parent.$new(!0);s.DestroyDirectiveService("dave-data-item-display-page",e),s.AddDirectiveService(".dataItemDisplayContainer",'<dave-data-item-display-list-page  class="angular-directive"></dave-data-item-display-list-page>',t,a),m.clearDataItems()}function u(e){angular.element("div.alert.animated#dataItem"+e).removeClass("fadeInDown"),angular.element("div.alert.animated#dataItem"+e).addClass("fadeOutUp"),D.alerts.splice(e,1)}function p(e){if(h.highcharts()){var t=0;h.highcharts().series.forEach(function(a,l,o){a.name===e.name&&(t=l)}),h.highcharts().series[t].hide()}}function I(e){var t=o.open({templateUrl:"DataItemDisplay/DataItemModalViews/dataItemSetting.html",controller:"DataItemSettingModalCtrl as dataItemSettingModalCtrl",resolve:{currentDataItem:function(){return D.currentDataItems[e]}}});t.result.then(function(e){console.log(e)})}function g(){s.EnterSearchMode("dave-data-item-display-page","<dave-data-item-display-page></dave-data-item-display-page>",".dataItemDisplayContainer",e,a)}var D=this;D.activate=r,D.addDataItem=d,D.backToDataItemList=c,D.closeAlert=u,D.hideDataItem=p,D.openSettingModal=I,D.toggleSearchMode=g,D.alerts=[],D.completeStates=[],D.dataItemsData=[],D.currentDataItems=m.readToDoItems(),D.dataItemsToWait=[],D.loading=!0,D.systemStatus="Normal",D.waitingMessage="Loading Data From Server";var h=angular.element("#container");e.$on("socket:ipDataItemResponse",function(e,t){if(console.log(t),"ERROR"===t.reply){D.loading=!1;for(var a=!1,l=0;l<D.alerts.length;l++)"Loading Data Item Failed. Please Check Your Internet Connection."===D.alerts[l].msg&&(a=!0);a||D.alerts.push({type:"danger",msg:"Loading Data Item Failed. Please Check Your Internet Connection."}),D.systemStatus="Error"}else if(console.log(t.payload.name),t.completeState){if(void 0===D.completeStates[t.payload.name]&&(D.completeStates[t.payload.name]=0),1!==t.completeState)100*t.completeState-D.completeStates[[t.payload.name]]>5&&(D.completeStates[t.payload.name]=100*t.completeState),D.dataItemsData[t.payload.name]=D.dataItemsData[t.payload.name].concat(t.list_out);else if(D.completeState=100*t.completeState,D.dataItemsData[t.payload.name]=D.dataItemsData[t.payload.name].concat(t.list_out),console.log(D.dataItemsData[t.payload.name].length),console.log("First Value: "+D.dataItemsData[t.payload.name][0]),console.log("Last Value: "+D.dataItemsData[t.payload.name][D.dataItemsData[t.payload.name].length-1]),D.dataItemsToWait.forEach(function(e,a,l){e.name===t.payload.name&&l.splice(a,1)}),0===D.dataItemsToWait.length){var o=[];for(var n in D.dataItemsData)o.push({name:n,data:D.dataItemsData[n]});o.forEach(function(e,t,a){h.highcharts().addSeries(e)}),D.loading=!1}}else if(t.list_out)for(var s=0;s<t.list_out.length;s++)for(var i=0;i<h.highcharts().series.length;i++)h.highcharts().series[i].name===t.payload.name&&h.highcharts().series[i].addPoint(t.list_out[s],!0,!0)}),e.$on("socket:ipAsychLoadingDataResponse",function(e,t){console.log(e.name),h.highcharts().series[0].setData(t),h.highcharts().hideLoading()}),e.$on("$destroy",function(){n.emit("stopDataItemConnection")}),D.activate()}function l(e,t,a,l){function o(){console.log(a)}function n(){console.log("called"),t.dismiss("cancel")}var s=this;s.activate=o,s.cancel=n,s.activate()}function o(e,t,a,l){function o(){}function n(){console.log("called"),t.dismiss("cancel")}var s=this;s.activate=o,s.cancel=n}angular.module("Dave2.DataItemDisplay").controller("DataItemDisplayCtrl",e).controller("DaveDataItemDisplayListPageCtrl",t).controller("DaveDataItemDisplayPageCtrl",a).controller("AddDataItemModalCtrl",l).controller("DataItemSettingModalCtrl",o),e.$inject=["$scope","$timeout","DataItemDisplaySocket"],t.$inject=["$scope","$timeout","$compile","$cookies","DataItemDisplaySocket","DirectiveService","generalStateWRS","DataItemDisplayRegistryService"],a.$inject=["$scope","$timeout","$compile","$cookies","$modal","DataItemDisplaySocket","DirectiveService","generalStateWRS","DataItemDisplayRegistryService"],l.$inject=["$scope","$modalInstance","currentDataItems","DataItemDisplaySocket"],o.$inject=["$scope","$modalInstance","currentDataItem","DataItemDisplaySocket"]}();