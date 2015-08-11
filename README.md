# DAVE2_Front_End
A project aims to demonstrate how to use Angularjs and Nodejs for DAVE2 front end design.

**Folder Structure**

Folder and Files can be divided into two catagories according to their content: 
* Dependencies or tools
```
.
├── ...
├── bourbon                    # bourbon dependency installed using codekit
├── bourbon_neat               # bourbon neat dependency installed using codekit
├── bower_components           # front-end angularjs dependencies installed using bower
├── ServerSideNodejs
│   ├── node_modules              # back-end nodejs dependencies installed using npm
│   ├── package.json              # npm cofig file
├── redisTestFrontEnd
│   ├── bower_components          # back-end nodejs dependencies installed using npm
│   ├── bower.json                # bower config file
├── template                   # angular-ui-bootstrap dependency downloaded from https://angular-ui.github.io/bootstrap/
├── bower.json                 # bower config file
└── ...
```
These dependencies installed through bower/npm are all recorded in the bower.json/package.json and can be easily managed through `bower` commands/ `npm` commands
* Non-Dependencies (project content)
```
.
├── ...
├── API.txt                    
├── DataItemDisplay             
│   ├── DataItemDisplayDirectiveTemplates
│   │   ├── daveDataItemDisplayListPage.html
│   │   ├── daveDataItemDisplayPage.html
│   ├── DataItemModalViews
│   │   ├── addDataItem.html
│   │   ├── dataItemSetting.html
│   ├── DataItemDisplay.html
│   ├── DataItemDisplay.js
│   ├── DataItemDisplayControllers.js
│   ├── DataItemDisplayDirectives.js
│   ├── DataItemDisplayServices.js
├── Importer                
│   ├── ImporterDirectiveTemplates
│   │   ├── daveImporterConfigurationPage.html
│   │   ├── daveImporterListPage.html
│   │   ├── daveImporterPage.html
│   │   ├── daveImporterSearchModePage.html
│   ├── ImporterModalViews
│   │   ├── updateImporter.html
│   ├── Importer.html
│   ├── Importer.js
│   ├── ImporterControllers.js
│   ├── ImporterDirectives.js
│   ├── ImporterFilters.js
│   ├── ImporterServices.js
│   ├── fieldFormTemplate.html
│   ├── silderBar.css
├── ServerSideNodejs
│   ├── importerfiles        
│   ├── server-redis.js          
│   ├── server.js
│   ├── testServer.js
├── angularFormlyBasicTemplates
│   ├── angularFormlyDaveLib.js 
│   ├── input.html
│   ├── input2.html
│   ├── input3.html
│   ├── select.html
│   ├── select2.html
│   ├── textarea.html
│   ├── textarea2.html
│   ├── textarea.html
│   ├── validation.html
│   ├── wrappers
│   │   ├── has-error.html
├── highchartsThemes        #highcharts themes folder
├── imgs                    #image resources folder
├── redisTestFrontEnd       #redis test front end folder
├── sass
│   ├── _dataItemDisplay.modal.sass
│   ├── _dataItemDisplay.sass
│   ├── _importer.modal.sass
│   ├── _importer.sass
│   ├── _preloader.sass
│   ├── _preloader2.sass
│   ├── _texture.scss
│   ├── index.sass
├── Dave2.js
├── Dave2Controllers.js
├── Dave2Services.js
├── README.md
├── index.html
├── loginModal.html
└── ...
```
For the sake of clearity, this project follows the stylling rules created by [john_papa](https://github.com/johnpapa/angular-styleguide) and is divided based on funcitonality differences.

**Data Flow**

![Angular Structure](https://raw.githubusercontent.com/watrool/DAVE2_Front_End_Documents/master/DAVE2%20Angular%20Structure.jpg)
