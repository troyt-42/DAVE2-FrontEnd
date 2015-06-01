(function(){'use strict';
angular
.module("Dave2App.Importer")
.controller("ImporterUploadCtrl" ,ImporterUploadCtrl);

ImporterUploadCtrl.$inject = [
  "$timeout",
  "$http",
  "$scope",
  "Upload",
  "FormSettingParseService",
  "ImporterSocket"
];


function ImporterUploadCtrl($timeout, $http, $scope,Upload, FormSettingParseService, ImporterSocket){
  var vm = this;

  vm.submitFile = submitFile;
  vm.cancelFile = cancelFile;
  vm.cancelImport = cancelImport;
  vm.decideImport = decideImport;
  vm.requestImporter = requestImporter;
  vm.chooseDataItem = chooseDataItem;
  vm.backToImporterList = backToImporterList;
  vm.closeAlert = closeAlert;

  vm.stepOne = true;
  vm.stepTwo = false;
  vm.stepTwoB = false;
  vm.stepThree = false;

  vm.formModel={};
  vm.fileUploadProgress = 0;
  vm.availableFields = {};

  vm.importerList = {};
  vm.importerListCurrentPage = 1;
  vm.importerToDisplay = {};
  vm.importerToDisplayContent = {};
  vm.currentDataItem = "Fermenter Sample HPLC Ethanol";

  vm.alerts = {
    "stepOne":[
      { type: 'danger', msg: 'Load Item Fails. Please Check Your Internet Connect.' }
    ],
    "stepTwoB" :[
      { type: 'warning', msg: 'Lost Connection (still can manipulate cached data)' }
    ]
  };


  vm.sampleDataQuantity = 50;
  vm.sampleDataReduction = 50;


  vm.search = {};
  vm.search2 = '';
  vm.optionStatus = {
    firstOpen : true,
    secondOpen: false,
    thirdOpen: false,
    fourthOpen: false
  };

  vm.formFields = [
    {
      type:"input",
      key:"Name"
    },
    {
      type:"input",
      key:"Location"
    },
    {
      type:"textarea",
      key:"Description"
    },
    {
      type:"input",
      key:"Select A File",
      data:{
        inputType:"file"
      },
      ngModelAttrs:{
        fileAccept:{
          attribute:"accept"
        },
        fileUploaderMarkup:{
          attribute:"ngf-select"
        },
        fileUploaderOnChangeMarkup:{
          attribute:"ngf-change"
        },
        fileUploaderModelMarkup:{
          attribute:"ng-model"
        }
      },
      templateOptions:{
        fileAccept:".csv",
        fileUploaderMarkup: "",
        fileUploaderOnChangeMarkup:"fileSelected($files, $event)",
        fileUploaderModelMarkup:"uploadfile"
      },
      expressionProperties:{
        "templateOptions.disabled":"!(model.Name || model.Location || model.Description)"
      }
    }
  ];

  vm.fakeDataItemData = {
    fields:[
      "Fermenter Sample HPLC Ethanol",
      "Fermenter Sample %Solids",
      "Fermenter Sample ID 17380",
      "Fermenter Sample ID 17381",
      "Fermenter Sample ID 17382",
      "Fermenter Sample ID 17383",
      "Fermenter Sample ID 17384",
      "Fermenter Sample ID 17385",
    ],
    data:[
      ["11-11-04 0:00",2.27],
      ["11-11-04 8:00",6.84],
      ["11-11-04 22:00",11.94],
      ["11-11-05 11:00",13.68],
      ["12-01-01 9:30",0.21],
      ["12-01-01 19:31",1.93],
      ["12-01-01 23:10",0.23],
      ["12-01-01 23:20",1.76],
      ["12-01-02 3:31",6.34],
      ["12-01-02 9:10",7.90],
      ["12-01-02 12:55", 4.32],
      ["12-01-02 17:10", 1.27],
      ["12-01-02 17:31", 9.93],
      ["12-01-02 22:45",2.24]]
    };

    $scope.$watch(function(){
      return vm.stepOne;
    }, function(newValue){
      if(newValue === true){
        $scope.$emit("dynamicBackground");
      } else if ( newValue === false){
        $scope.$emit("removeDynamicBackground");
      }
    });

    $scope.$on("stepTwo",function(){
      vm.stepOne = false;
      vm.stepTwo = true;
      vm.stepTwoB = false;
      vm.stepThree = false;
    });


    $scope.$on("uploadProgress", function(event, data){
      console.log(data);
      vm.fileUploadProgress = data;
      if(data >= 100){
        $timeout(function(){
          vm.stepOne = false;
          vm.stepTwo = false;
          vm.stepTwoB = false;
          vm.stepThree = true;
        }, 1000);
      }
    });

    $scope.$watch(function(){
      return vm.sampleDataReduction;
    }, function(newValue){
      if(newValue <= 10){
        vm.sampleDataReductionString = "1 Hour";
      } else if ((newValue > 10) && (newValue <= 20)){
        vm.sampleDataReductionString = "2 Hour";
      } else if ((newValue > 20) && (newValue <= 30)){
        vm.sampleDataReductionString = "3 Hour";
      } else if ((newValue > 30) && (newValue <= 40)){
        vm.sampleDataReductionString = "4 Hour";
      } else if ((newValue > 40) && (newValue <= 50)){
        vm.sampleDataReductionString = "5 Hour";
      } else if ((newValue > 50) && (newValue <= 60)){
        vm.sampleDataReductionString = "6 Hour";
      } else if ((newValue > 60) && (newValue <= 70)){
        vm.sampleDataReductionString = "7 Hour";
      } else if ((newValue > 70) && (newValue <= 80)){
        vm.sampleDataReductionString = "8 Hour";
      } else if ((newValue > 80) && (newValue <= 90)){
        vm.sampleDataReductionString = "9 Hour";
      } else if ((newValue > 90) && (newValue <= 100)){
        vm.sampleDataReductionString = "10 Hour";
      }
    });
    activate();

    ///////////////////////////

    function activate(){
      $http.get("/Importer/gettable")
      .success(function(data, status, header, config){
        vm.importerList = data;
      })
      .error(function(data, status, header, config){
        console.log("error: " + status);
      });

    }

    function submitFile(){
      console.log(vm.formModel);
      var uploadfile = vm.formModel["Select A File"][0];
      console.log(uploadfile);

      if(uploadfile !== {}){

        Upload.upload({
          url : "/Importer/uploadFile",
          file: uploadfile,
          fields:{
            'uploadInfo': {
              'name' : vm.formModel.Name,
              'filename': vm.formModel["Select A File"][0].name,
              'location': vm.formModel.Location,
              'description': vm.formModel.Description
            }
          }
        }).progress(function(evt) {
          var progress = parseInt(100.0 * evt.loaded / evt.total);
          $scope.$emit("uploadProgress", progress);
        }).success(function(data, status, headers, config) {


          vm.stepThreeFormCollection = FormSettingParseService(data); // jshint ignore:line

          console.log(vm.stepThreeFormCollection);
        }).error(function(err){
          alert(err);
        });
      } else {
        alert("Please Select A File");
      }
      $scope.$emit("stepTwo");
    }

    function cancelFile(){
      vm.formModel= {};
    }

    function cancelImport(){
      vm.stepOne = true;
      vm.stepTwo = false;
      vm.stepTwoB = false;
      vm.stepThree = false;
      vm.fileUploadProgress = 0;
    }

    function decideImport(){
      var finalFormToUpload = {};
      console.log(vm.stepThreeFormCollection);
      for(var key in vm.stepThreeFormCollection){
        finalFormToUpload[key] = {};
        for(var key2 in vm.stepThreeFormCollection[key]){
          switch(key2){
            case "fields":
            break;
            default:
            finalFormToUpload[key][key2] = vm.stepThreeFormCollection[key][key2];
            break;
          }
        }
      }
      console.log(finalFormToUpload);
      $http.post("/Importer/decideImport", finalFormToUpload).
      success(function(data, status, headers, config) {
        // this callback will be called asynchronously
        // when the response is available
        alert("Importer Has Been Created");
        vm.stepOne = true;
        vm.stepTwo = false;
        vm.stepTwoB = false;
        vm.stepThree = false;
      }).
      error(function(data, status, headers, config) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
        alert("Something Wents Wrong");
      });
    }


    function requestImporter(importer){
      console.log(importer);
      ImporterSocket.emit("requestImporter", importer);
      ImporterSocket.on("responseImporter", function(data){
        console.log(data);
        vm.stepOne = false;
        vm.stepTwo = false;
        vm.stepTwoB = true;
        vm.stepThree = false;
        vm.importerToDisplay = importer;
        vm.importerToDisplayContent = data;
      });
    }

    function chooseDataItem(dataItem){
      vm.currentDataItem = dataItem;
    }

    function backToImporterList(){
      vm.stepOne = true;
      vm.stepTwo = false;
      vm.stepTwoB = false;
      vm.stepThree = false;
    }

    function closeAlert(index, position){
      vm.alerts[position].splice(index, 1);
    }
  }
})();
