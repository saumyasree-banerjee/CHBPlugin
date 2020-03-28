import React, {Component} from 'react';
import Loader from '../Common/Loader';
import {FilterSection, InPageDialog, TextField} from 'damco-components';
import {DataTable, SelectionDropDownAdvanced} from 'damco-components';
import API from "../../../Constants/API-config";
import {Environment} from "../../../Constants/Environment";
import ReactExport from "react-export-excel";



class ResponseDestination extends Component {
    constructor(props) {
        super(props);
        let tableActions = {
            primaryActionIsMoreBtn: false,
            primaryActionLabel: "Add New Response Destination ",
            primaryAction: () => this.addReceiverDestination(),

        }
        this.state = {
            loader: false,
            columns: [],
            clicking: true,
            pageNumber: 1,
            columnDataObj: [],
            colObj: [],
            SearchPageSize: 10,
            actions:tableActions,
            showNewReceiverDestinationPage:false,
            warningMsg: '',
            showWarningDialog: false,
            destinationtype:[],
            eventtypeFile:[],
            showExistsDialog:false,
            showDialog:false,
            showAddError:false,
            addErrorMsg:'',
            pageSize:0,
            eventTypeSel:null,
            destNameSel:null
        }
        this.cancelPage = this.cancelPage.bind(this);
        this.saveReceiverDestination = this.saveReceiverDestination.bind(this);
        this.getDestinationType=this.getDestinationType.bind(this);
    }
    addReceiverDestination = () => {
        let selectDefault={
            value:"Select",
            label:"Select"
        }
        this.setState({
            showNewReceiverDestinationPage: true,
            eventTypeSel:selectDefault,
            destNameSel:selectDefault,
            showWarningDialog:false

        });
    }
    onChangeResponseDestination = (value) => {

    }
    exportToExcelResponseDestination(tokenData,state,datalength) {
        let self = this;
        if(state.clear!==undefined && state.clear!== false){
            self.setState({
                colObj:[]
            })
        }
        let pagetotal =  1;
        if(self.state.colObj===[]){
            var obj="[]"
        } else {
            obj = self.state.colObj;
        }
        let controller = new AbortController();
        let signal = controller.signal;
        let headers=Environment.headerValues;
        headers.Authorization='Bearer ' + tokenData;
        fetch(API.RESPONSEDESTINATION_SEARCH + "?pageNumber=" + pagetotal + "&pageSize=" + datalength, {
            method: "POST",
            body: JSON.stringify(obj),
            headers: headers,
            signal: signal
        }).then(function (response) {
            return response.json();
        }).then(function (data) {
            const results = data.ResponseDestinationList.map((_arrayElement) => Object.assign({}, _arrayElement));
            self.setState({
                dataForExport: results
            })
        });
    }

    componentWillMount = () => {
        this.setState({loader: true,});

    }

    componentDidMount = () => {
        // let self = this;
        //this.loadIdentifiedTableData();
    }

    componentWillUnmount = () => {
        clearTimeout(this.fetchDataTimeOut);
        clearInterval(this.fetchDataInterval);
    }


    fetchDestinationTypeTable(state, instance) {
        this.initializeToken(state, instance);



    }
    initializeToken(state, instance) {
        let self = this;
        var tokenData = '';
        self.setState({
            loader:true
        })
        if (tokenData === '') {
            const Aud = {
                "Audience": API.AUDIENCE_ID
            }
            fetch(API.TOKEN_NUMBER_URL, {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(Aud)
            }).then(function (response) {

                return response.json();
            }).then(function (data) {
                sessionStorage.setItem("tokenDataFromAud", JSON.stringify(data));
                tokenData = data;
                self.setState({
                    loader:false
                })
                self.searchDestinationType(tokenData, state, instance);
                self.getDestinationType();
            });
        }
    };
    searchDestinationType(tokenData, state, instance) {
        let self = this;
        if(state.pageSize!==undefined && state.pageSize!==null )
            self.setState(
                {
                    SearchPageSize:state.pageSize,
                    pageSize:state.pageSize
                }
            )
        let pagetotal = state.page + 1;
        var jsonObj;

        if(self.state.colObj === []){
            jsonObj = "[]";
        } else {
            jsonObj = self.state.colObj;
        }
        if (tokenData !== "") {
            let headers=Environment.headerValues;
            headers.Authorization='Bearer ' + tokenData;
            fetch(API.RESPONSEDESTINATION_SEARCH + "?pageNumber=" + pagetotal + "&pageSize=" + state.pageSize,{
                method: "POST",
                body: JSON.stringify(jsonObj),
                headers: headers
            }).then(function (response) {
                return response.json();
            }).then(function (data) {

                if (data.ResponseDestinationList != null) {
                    data.ResponseDestinationList.map(item => {
                        item.ResponseSource = item.ResponseSource.toString();
                        item.ResponseSource = [item.ResponseSource, "/ResponseDestination/" + item.ResponseDestinationId + "/ResponseDestinationUpdate"];
                        if(item.InsertedTime !== null) {
                            item.InsertedTime = item.InsertedTime.slice(0, 4) + '-' + item.InsertedTime.slice(5, 7) + '-' + item.InsertedTime.slice(8, 10)+ " " + item.InsertedTime.slice(11, 19);
                        }
                        if(item.UpdatedTime !== null) {
                            item.UpdatedTime = item.UpdatedTime.slice(0, 4) + '-' + item.UpdatedTime.slice(5, 7) + '-' + item.UpdatedTime.slice(8, 10)+ " " + item.UpdatedTime.slice(11, 19);
                        }
                        return null;
                    });
                }

                let record = data.TotalRecords % self.state.SearchPageSize;
                if (record === 0) {
                    let pagenum = (data.TotalRecords) / self.state.SearchPageSize;
                    self.setState({
                        pageNumber: pagenum
                    })
                } else {
                    let remain = data.TotalRecords % self.state.SearchPageSize
                    self.setState({
                        pageNumber: (((data.TotalRecords) - remain) / self.state.SearchPageSize) + 1
                    })
                }
                      if(data.ResponseDestinationList !== null) {
                          self.setState({
                              loader: false,
                              destinationTableContent: data.ResponseDestinationList,
                          });
                      }
                self.exportToExcelResponseDestination(tokenData,state,data.TotalRecords);

            })
        }
    }

    applyDestinationType() {
        this.setState({
            loader:true,
            columnDataObj : [],
            showDialog:false,
            showExistsDialog:false,
            showAddError:false
        });
        let destinationTypeFilterValues = this.filters.getFilterValues();
        this.dataTable.table.state.page=0;
        // console.log(destinationTypeFilterValues, ' - Destination Type Filter values');
        let DestinationTypeName = '';
        let method = '';
        let details = '';
        let active = '';
        let insertedBy = '';
        let updatedBy = '';
        let insertedTime = '';
        let updatedTime = '';
        let insertedTimeTo = '';
        let updatedTimeTo = '';
        let insertedTimeValue = '';
        let updatedTimeValue = '';
        let insertedTimeValueTo = '';
        let updatedTimeValueTo = '';
        let DestinationEmail='';
        let CustomerCode='';
        let FileName='';
        let ResponseSource;
        let EventType;
        if(destinationTypeFilterValues.length <= 4) {
            DestinationTypeName = destinationTypeFilterValues[1].value;
            DestinationEmail=destinationTypeFilterValues[0].value;
            FileName=destinationTypeFilterValues[3].value;
            active = destinationTypeFilterValues[2].value;

        } else {
            ResponseSource= destinationTypeFilterValues[7].value;
             EventType= destinationTypeFilterValues[8].value;
            DestinationTypeName = destinationTypeFilterValues[0].value;
            DestinationEmail=destinationTypeFilterValues[2].value;
            FileName=destinationTypeFilterValues[3].value;
            CustomerCode=   destinationTypeFilterValues[4].value;
            insertedBy = destinationTypeFilterValues[5].value;
            updatedBy = destinationTypeFilterValues[6].value;
            active = destinationTypeFilterValues[1].value;
            insertedTime = destinationTypeFilterValues[9].value;
            insertedTimeTo = destinationTypeFilterValues[10].value;
            updatedTime = destinationTypeFilterValues[11].value;
            updatedTimeTo = destinationTypeFilterValues[12].value;
        }
        if(DestinationTypeName===null){
            DestinationTypeName="";
        }
        if(FileName===null){
            FileName="";
        }
        let columnDataObj = this.state.columnDataObj;


        let DestinationEmailName = {
            "ColumnName": 'DestinationEmail',
            "Operator": 'contains',
            "Value1": DestinationEmail,
            "Value2": ''
        };
        if(DestinationEmail !== '' ) {
            columnDataObj.push(DestinationEmailName);
        }
        let FileNameS = {
            "ColumnName": 'FileName',
            "Operator": 'equal',
            "Value1": FileName,
            "Value2": ''
        };
        if(FileName !== '' && FileName!=='Select' ) {
            columnDataObj.push(FileNameS);
        }
        let CustomerCodeS = {
            "ColumnName": 'CustomerCode',
            "Operator": 'contains',
            "Value1": CustomerCode,
            "Value2": ''
        };
        if(CustomerCode !== '' ) {
            columnDataObj.push(CustomerCodeS);
        }

        if(insertedTime !== ''){
            let yearConst = insertedTime.slice(6, 10);
            let monthConst = insertedTime.slice(3, 5);
            let daysConst = insertedTime.slice(0, 2);
            insertedTimeValue = yearConst + '-' + monthConst+'-'+daysConst;
        }else{
            insertedTimeValue='';
        }
        if(updatedTime !== ''){
            let yearConst = updatedTime.slice(6, 10);
            let monthConst = updatedTime.slice(3, 5);
            let daysConst = updatedTime.slice(0, 2);
            updatedTimeValue = yearConst + '-' + monthConst+'-'+daysConst;
        }else{
            updatedTimeValue='';
        }
        if(insertedTimeTo !== ''){
            let yearConst = insertedTimeTo.slice(6, 10);
            let monthConst = insertedTimeTo.slice(3, 5);
            let daysConst = insertedTimeTo.slice(0, 2);
            insertedTimeValueTo = yearConst + '-' + monthConst+'-'+daysConst;
        }else{
            insertedTimeValueTo = '';
        }
        if(updatedTime !== ''){
            let yearConst = updatedTime.slice(6, 10);
            let monthConst = updatedTime.slice(3, 5);
            let daysConst = updatedTime.slice(0, 2);
            updatedTimeValue = yearConst + '-' + monthConst+'-'+daysConst;
        }else{
            updatedTimeValue ='';
        }
        if(updatedTimeTo !== ''){
            let yearConst = updatedTimeTo.slice(6, 10);
            let monthConst = updatedTimeTo.slice(3, 5);
            let daysConst = updatedTimeTo.slice(0, 2);
            updatedTimeValueTo = yearConst + '-' + monthConst+'-'+daysConst;
        }else{
            updatedTimeValueTo = '';
        }
        let updatedTimeValueItem = {
            "ColumnName": 'UpdatedTime',
            "Operator": 'range',
            "Value1": updatedTimeValue,
            "Value2": updatedTimeValueTo
        };
        if(updatedTimeValue !== '' ) {
            columnDataObj.push(updatedTimeValueItem);
        }
        let insertedTimeValueItem = {
            "ColumnName": 'InsertedTime',
            "Operator": 'range',
            "Value1": insertedTimeValue,
            "Value2": insertedTimeValueTo
        };
        if(insertedTimeValue !== '' ) {
            columnDataObj.push(insertedTimeValueItem);
        }
        let destinationTypeNameItem = {
            "ColumnName": 'DestinationTypeName',
            "Operator": 'equal',
            "Value1": DestinationTypeName,
            "Value2": ''
        };
        if(DestinationTypeName !== '' && DestinationTypeName !=='Select') {
            columnDataObj.push(destinationTypeNameItem);
        }
        let methodItem = {
            "ColumnName": 'Method',
            "Operator": 'contains',
            "Value1": method,
            "Value2": ''
        };
        if(method !== '' ) {
            columnDataObj.push(methodItem);
        }
        let detailsItem = {
            "ColumnName": 'Details',
            "Operator": 'contains',
            "Value1": details,
            "Value2": ''
        };
        if(details !== '' ) {
            columnDataObj.push(detailsItem);
        }
        let insertedByItem = {
            "ColumnName": 'InsertedBy',
            "Operator": 'contains',
            "Value1": insertedBy,
            "Value2": ''
        };
        if(insertedBy !== '' ) {
            columnDataObj.push(insertedByItem);
        }
        let updatedByItem = {
            "ColumnName": 'UpdatedBy',
            "Operator": 'contains',
            "Value1": updatedBy,
            "Value2": ''
        };
        if(updatedBy !== '' ) {
            columnDataObj.push(updatedByItem);
        }
        let activeItem = {
            "ColumnName": 'IsActive',
            "Operator": 'equal',
            "Value1": active,
            "Value2": ''
        };
        if(active !== '' && active !== 'Select') {
            columnDataObj.push(activeItem);
        }
        let ResponseSourceVal = {
            "ColumnName": 'ResponseSource',
            "Operator": 'contains',
            "Value1": ResponseSource,
            "Value2": ''
        };
        if(ResponseSource !== '' ) {
            columnDataObj.push(ResponseSourceVal);
        }
        let EventTypeVal = {
            "ColumnName": 'EventType',
            "Operator": 'contains',
            "Value1": EventType,
            "Value2": ''
        };
        if(EventType !== '' ) {
            columnDataObj.push(EventTypeVal);
        }
        this.setState({
            colObj:columnDataObj
        });
        this.useTokenForDestinationTypeSearch(columnDataObj);
    }
    useTokenForDestinationTypeSearch(obj) {
        let self = this;
        let tokenData = '';
        if (tokenData === '') {
            const Aud = {
                "Audience": API.AUDIENCE_ID
            }
            fetch(API.TOKEN_NUMBER_URL, {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(Aud)
            }).then(function (response) {
                return response.json();
            }).then(function (data) {
                tokenData = data;
                self.searchDestinationTypeFromFilter(tokenData,obj);
            });
        }
    };
    searchDestinationTypeFromFilter(tokenData, obj){
        let self = this;
        let pagetotal = 1;
        var pageSize=10;
        if(self.state.pageSize>=0){
            pageSize=self.state.pageSize

        }
        if(self.state.colObj===[]){
            obj="[]"
        }
        else {
            obj=self.state.colObj;
        }
        if (tokenData !== "") {
            let headers=Environment.headerValues;
            headers.Authorization='Bearer ' + tokenData;
            fetch(API.RESPONSEDESTINATION_SEARCH + "?pageNumber=" + pagetotal + "&pageSize=" + pageSize, {
                method: "POST", // *GET, POST, PUT, DELETE, etc.
                body: JSON.stringify(obj),
                headers: headers
            }).then(function (response) {
                return response.json();
            }).then(function (data) {
                if (data.ResponseDestinationList != null) {
                    data.ResponseDestinationList.map(item => {
                        item.ResponseSource = item.ResponseSource.toString();
                        item.ResponseSource = [item.ResponseSource, "/ResponseDestination/" + item.ResponseDestinationId + "/ResponseDestinationUpdate"];
                        if(item.InsertedTime !== null) {
                            item.InsertedTime = item.InsertedTime.slice(0, 4) + '-' + item.InsertedTime.slice(5, 7) + '-' + item.InsertedTime.slice(8, 10)+ " " + item.InsertedTime.slice(11, 19);;
                        }
                        if(item.UpdatedTime !== null) {
                            item.UpdatedTime = item.UpdatedTime.slice(0, 4) + '-' + item.UpdatedTime.slice(5, 7) + '-' + item.UpdatedTime.slice(8, 10)+ " " + item.UpdatedTime.slice(11, 19);;
                        }
                        return null;
                    });
                }
                let record = data.TotalRecords % self.state.SearchPageSize;
                if (record === 0) {
                    let pagenum = (data.TotalRecords) /  self.state.SearchPageSize;
                    self.setState({
                        pageNumber: pagenum
                    })
                } else {
                    let remain = data.TotalRecords %  self.state.SearchPageSize
                    self.setState({
                        pageNumber: (((data.TotalRecords) - remain) /  self.state.SearchPageSize) + 1
                    })
                }
                self.setState({
                    loader: false,
                    destinationTableContent: data.ResponseDestinationList
                });
                self.exportToExcelResponseDestination(tokenData,self.state,data.TotalRecords);
            })
        }
    };
    clear() {
        let self=this;
        var vals={
            pageSize:10,
            page: 0,
            clear:true
        }
        self.setState({
            loader:true,
            colObj:[],
            showDialog:false,
            showExistsDialog:false,
            showAddError:false
        })
        this.dataTable.table.state.page=0;
        var instance=null;

        this.initializeToken(vals,instance);
    };
    closeDialog() {

       this.setState({
           showDialog:false,
           loader:false,
           showNewReceiverDestinationPage: false,
           showExistsDialog: false,
           showAddError:false
       })
    }

    cancelPage(e) {
        this.setState({
            showNewReceiverDestinationPage :false,
            showAddError:false
        });
    }


    saveReceiverDestination(){
        let self = this;
        self.setState({
            showWarningDialog: false
        });
        let destinationName = this.destnationNameSelect.getSelection().toString();
        let eventTypeFileId = this.eventTypeSelect.getSelection().toString();
        let customerCode=this.inputCustomerCode.getValue()
        let date = new Date().getDate();
        let month = new Date().getMonth() + 1;
        let year = new Date().getFullYear();
        let destelected=this.destnationNameSelect.state.value;
       let evTypeSelec=this.eventTypeSelect.state.value;
        self.setState({
            eventTypeSel:evTypeSelec,
            destNameSel:destelected
        })
        //sessionStorage.getItem('userMail')
        let jsonData = {
            "EventTypeFileId": eventTypeFileId,
            "DestinationTypeId": destinationName,
            "DestinationEmail":this.inputEmail.getValue(),
            "CustomerCode":this.inputCustomerCode.getValue(),
            "IsActive": true,
            "InsertedBy": sessionStorage.getItem('userMail') ,
            "InsertedTime": year + '-' + month + '-' + date
        };
        if(customerCode=== '' || destinationName==='Select' || eventTypeFileId==='Select') {
            self.setState({
                warningMsg: 'Mandatory Field cant be left blank',
                showWarningDialog: true,
            });
        }else {
            this.setState({
                loader :true
            });
            let tokenData = '';
            if (tokenData === '') {
                const Aud = {
                    "Audience": API.AUDIENCE_ID
                }
                fetch(API.TOKEN_NUMBER_URL, {
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(Aud)
                }).then(function (response) {
                    return response.json();
                }).then(function (data) {
                    tokenData = data;
                    if (tokenData !== '') {
                        let headers=Environment.headerValues;
                        headers.Authorization='Bearer ' + tokenData;
                        fetch(API.RESPONSEDESTINATION_ADD , {
                            method: "POST",
                            body: JSON.stringify(jsonData),
                            headers: headers
                        }).then(function (response) {
                            if (response.status === 200) {
                                self.setState({
                                    loader:false,
                                    showNewReceiverDestinationPage: false,
                                    showExistsDialog: false,
                                    showDialog: true,
                                    showAddError:false
                                });
                            }else if(response.status === 409){
                                self.setState({
                                    loader:false,
                                    showNewReceiverDestinationPage: false,
                                    showExistsDialog: false,
                                    showDialog: false,
                                    showAddError:true,
                                    addErrorMsg:response.statusText
                                });
                            }
                            else if(response.status === 500){
                                self.setState({
                                    loader:false,
                                    showNewReceiverDestinationPage: false,
                                    showExistsDialog: false,
                                    showDialog: false,
                                    showAddError:true,
                                    addErrorMsg:response.statusText
                                });
                            }

                        }).then(function (data) {
                            console.log('Created :', data);

                        });
                    }
                });
            }
        }
    }

    getDestinationType(){
        let self = this;
        let tokenData = '';
        if (tokenData === '') {
            const Aud = {
                "Audience": API.AUDIENCE_ID
            }
            fetch(API.TOKEN_NUMBER_URL, {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(Aud)
            }).then(function (response) {
                return response.json();
            }).then(function (data) {
                tokenData = data;
                if (tokenData !== '') {
                    let headers=Environment.headerValues;
                    headers.Authorization='Bearer ' + tokenData;
                    fetch(API.RESPONSEDESTINATION_LOAD_DESTINATION_TYPE, {
                        method: "GET",
                        headers: headers
                    }).then(function (response) {
                        return response.json();
                    }).then(function (data) {
                        self.setState({
                            destinationtype:data
                        })
                        let headers=Environment.headerValues;
                        headers.Authorization='Bearer ' + tokenData;

                        fetch(API.RESPONSEDESTINATION_LOAD_EVENT_TYPE_FILE, {
                            method: "GET",
                            headers: headers
                        }).then(function (response) {
                            return response.json();
                        }).then(function (data) {
                            self.setState({
                                eventtypeFile:data

                            })
                        });

                    });
                }
            });
        }
    }




    render() {


        let inputState = {
            warningInputText: "Warning text",
            errorInputText: "Error text",
            warning: false,
            error: false,
            complete: false
        };
        let DestinationTypeArray = [];
        let DestinationTypeArrayForFilter=[];
        let eventTypeFilterArray = [];
        let eventTypeFilterArrayForFilter=[];

        if(this.state.eventtypeFile.length > 0){
            for(let i = 0; i< this.state.eventtypeFile.length; i++) {
                let eventTypeObj = {value: this.state.eventtypeFile[i].EventTypeFileId, label: this.state.eventtypeFile[i].FileName};
                eventTypeFilterArray.push(eventTypeObj);
                // console.log(eventTypeObj);
            }
            let eventtypeFileSelect={
                value:"Select",
                label:"Select"
            }
            eventTypeFilterArray.unshift( eventtypeFileSelect );
        }
        if(this.state.eventtypeFile.length > 0){
            for(let i = 0; i< this.state.eventtypeFile.length; i++) {
                let eventTypeObj = {value: this.state.eventtypeFile[i].FileName, label: this.state.eventtypeFile[i].FileName};
                eventTypeFilterArrayForFilter.push(eventTypeObj);
                // console.log(eventTypeObj);
            }
        }
        let secondValue={
            value:"Select",
            label:"Select"
        }
        eventTypeFilterArrayForFilter.unshift( secondValue );

        if(this.state.destinationtype.length > 0){
            for(let i = 0; i< this.state.destinationtype.length; i++) {
                let eventTypeObj = {value: this.state.destinationtype[i].DestinationTypeId, label: this.state.destinationtype[i].DestinationTypeName};
                DestinationTypeArray.push(eventTypeObj);
            }
            let DestinationTypeArrayalue={
                value:"Select",
                label:"Select"
            }
            DestinationTypeArray.unshift( DestinationTypeArrayalue );
        }
        if(this.state.destinationtype.length > 0){
            for(let i = 0; i< this.state.destinationtype.length; i++) {
                let eventTypeObj = {value: this.state.destinationtype[i].DestinationTypeName, label: this.state.destinationtype[i].DestinationTypeName};
                DestinationTypeArrayForFilter.push(eventTypeObj);
            }
        }
        let firstValue={
            value:"Select",
            label:"Select"
        }
        DestinationTypeArrayForFilter.unshift( firstValue );



        let filters = {
            defaultStateOpen: true,
            moreLess: true,



            inputs: [
                {id: 91, label: 'Destination Type Name', type: 'dropdown', placeholder:'Select', options: DestinationTypeArrayForFilter, isBaseFilter: true},
                {id: 92, label: 'Active', type: 'dropdown', placeholder:'Select', options: [{label: 'Select', value:'Select'},{label: 'true', value:'true'}, {label: 'false', value:'false'}], isBaseFilter: true},
                {id: 93, label: 'Destination Email', type: 'text', placeholder: "Enter Destination Email", isBaseFilter: true},
                {id: 94, label: 'File Name', type: 'dropdown', placeholder:'Select', options: eventTypeFilterArrayForFilter, isBaseFilter: true},
                {id: 95, label: 'Customer Code', type: 'text', placeholder: "Enter Customer Code ", isBaseFilter: false},
                {id: 96, label: "Created From", type: 'date-mon-sun', noDateOption: false, isBaseFilter: false},
                {id: 97, label: "Created To", type: 'date-mon-sun', noDateOption: false, isBaseFilter: false},
                {id: 98, label: 'Created By', type: 'text', placeholder: "Enter Created By", isBaseFilter: false},
                {id: 99, label: 'Updated From', type: 'date-mon-sun', noDateOption: false, isBaseFilter: false},
                {id: 100, label: 'Updated To', type: 'date-mon-sun', noDateOption: false, isBaseFilter: false},
                {id: 101, label: "Update By",type: 'text', placeholder: "Enter Updated By", isBaseFilter: false},
                {id: 102, label: "Response Source ",type: 'text', placeholder: "Enter Response Source", isBaseFilter: false},
                {id: 103, label: "Event Type",type: 'text', placeholder: "Enter Event Type", isBaseFilter: false},


            ]

        };
        const ExcelFile = ReactExport.ExcelFile;
        const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
        const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;
        if(this.state.dataForExport!==null && typeof this.state.dataForExport!== undefined){
            // console.log(this.state.dataForExport,'excel sheet table values')
        }
        return (
            <div>
                {
                    this.state.showNewReceiverDestinationPage !== true ?
                        <div>
                            <div className="grid-wrapper">
                                <div className="header-group profile-template">
                                    <ul className="page-title-group">
                                        <li>
                                            <button className="hidden button-large button-transparent back-btn">
                                                <i className="fa fa-angle-left" aria-hidden="true"/>
                                            </button>
                                        </li>
                                        <li>
                                            <h1>Response Destination </h1>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <section className="page-container">
                                <div className="grid-wrapper">
                                    <div className="col-100">
                                        <div>
                                            <FilterSection data={filters}
                                                           applyAction={() => this.applyDestinationType()}
                                                           clearAction={() => this.clear()}
                                                           ref={(filters) => this.filters = filters}/>
                                        </div>
                                    </div>
                                </div>
                                <ExcelFile filename="responseDestination" element={<button type="button" className="button button-blue">Export to Excel</button>}>
                                    <ExcelSheet data={this.state.dataForExport} name="Receiver Response Destination">
                                        <ExcelColumn label="Response Source" value="ResponseSource"/>
                                        <ExcelColumn label="Event Type" value="EventType"/>
                                        <ExcelColumn label="File Name" value="FileName"/>
                                        <ExcelColumn label="Destination Type Name" value="DestinationTypeName"/>
                                        <ExcelColumn label="Destination Email" value="DestinationEmail"/>
                                        <ExcelColumn label="Customer Code" value="CustomerCode"/>
                                        <ExcelColumn label="Active" value="IsActive"/>
                                        <ExcelColumn label="Created Time" value="InsertedTime"/>
                                        <ExcelColumn label="Created By" value="InsertedBy"/>
                                        <ExcelColumn label="Updated Time" value="UpdatedTime"/>
                                        <ExcelColumn label="Updated By" value="UpdatedBy"/>
                                    </ExcelSheet>
                                </ExcelFile>
                                <div>
                                    <br/>
                                    <InPageDialog showDialog={this.state.showDialog} type={"success"}
                                                  message={"Response Destination  Added successfully"}
                                                  closeMethod={() => this.closeDialog()}/>
                                    <InPageDialog showDialog={this.state.showExistsDialog} type={"warning"}
                                                  message={"Response Destination  Already exists"}
                                                  closeMethod={() => this.closeDialog()}/>
                                    <InPageDialog showDialog={this.state.showAddError} type={"warning"}
                                                  message={this.state.addErrorMsg}
                                                  closeMethod={() => this.closeDialog()}/>

                                    <br/>
                                </div>
                                <div className="grid-wrapper">
                                    <div className="col-100">
                                        <DataTable
                                            data={this.state.destinationTableContent}
                                            columns={[


                                                {
                                                    headerClassName: 'data-table header',
                                                    accessor: "ResponseSource",
                                                    editable: false,
                                                    isHyperlink: true,
                                                    fieldHeader: 'Response Source',
                                                    show: true
                                                },

                                                {
                                                    headerClassName: 'data-table header',
                                                    accessor: "EventType",
                                                    editable: false,
                                                    isHyperlink: false,
                                                    fieldHeader: 'Event Type',
                                                    show: true
                                                },

                                                {
                                                    headerClassName: 'data-table header',
                                                    accessor: "FileName",
                                                    editable: false,
                                                    isLink: false,
                                                    fieldHeader: 'File Name',
                                                    show: true
                                                },
                                                {
                                                    headerClassName: 'data-table header',
                                                    accessor: "DestinationTypeName",
                                                    isStatus: false,
                                                    isLink: false,
                                                    fieldHeader: 'Destination Type Name',
                                                    show: true,
                                                    footer: null
                                                },
                                                {
                                                    headerClassName: 'data-table header',
                                                    accessor: "DestinationEmail",
                                                    editable: false,
                                                    isLink: false,
                                                    fieldHeader: 'Destination Email',
                                                    show: true
                                                },
                                                {
                                                    headerClassName: 'data-table header',
                                                    accessor: "CustomerCode",
                                                    editable: false,
                                                    isLink: false,
                                                    fieldHeader: 'Customer Code ',
                                                    show: true
                                                },
                                                {
                                                    headerClassName: 'data-table header',
                                                    accessor: "IsActive",
                                                    editable: false,
                                                    isLink: false,
                                                    fieldHeader: 'Active',
                                                    show: true
                                                },
                                                {
                                                    headerClassName: 'data-table header',
                                                    accessor: "InsertedTime",
                                                    editable: false,
                                                    isLink: false,
                                                    fieldHeader: 'Created Time',
                                                    show: true
                                                },
                                                {
                                                    headerClassName: 'data-table header',
                                                    accessor: "InsertedBy",
                                                    editable: false,
                                                    isLink: false,
                                                    fieldHeader: 'Created By',
                                                    show: true
                                                },
                                                {
                                                    headerClassName: 'data-table header',
                                                    accessor: "UpdatedTime",
                                                    editable: false,
                                                    isLink: false,
                                                    fieldHeader: 'Updated Time',
                                                    show: true
                                                },
                                                {
                                                    headerClassName: 'data-table header',
                                                    accessor: "UpdatedBy",
                                                    editable: false,
                                                    isLink: false,
                                                    fieldHeader: 'Updated By',
                                                    show: true
                                                }


                                            ]}
                                            isSelectable={true}
                                            selectedOption={false}
                                            isSortable={false}
                                            isResizable={true}
                                            isEditable={false}
                                            hasFooter={false}
                                            isExpandable={false}
                                            manualPagination={true}
                                            showPagination={true}
                                            showColumnOptions={true}
                                            pageCount={this.state.pageNumber}
                                            fetchData={this.fetchDestinationTypeTable.bind(this)}
                                            tableName={"destinationTypeTable"}
                                            ref={(dataTable) => {
                                                this.dataTable = dataTable;
                                            }}

                                            actions={this.state.actions}
                                            height={"auto"}/>
                                    </div>
                                </div>
                            </section>
                            <Loader loader={this.state.loader}/>
                        </div>
                        :
                        <div>
                            <div className="grid-wrapper">
                                <div className="header-group profile-template">
                                    <ul className="page-title-group">
                                        <li>
                                            <button className="hidden button-large button-transparent back-btn">
                                                <i className="fa fa-angle-left" aria-hidden="true"/>
                                            </button>
                                        </li>
                                        <li>
                                            <h1>Create New Response Destination</h1>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <section className="page-container">
                                <div className="grid-wrapper">
                                    <div className="button-group">
                                        <button type="button" className="button button-blue" onClick={this.saveReceiverDestination}>SAVE</button>
                                        <button type="button" className="button button-transparent" onClick={this.cancelPage}>CANCEL</button>&nbsp;&nbsp;
                                    </div>
                                </div>
                                <InPageDialog showDialog={this.state.showWarningDialog} type={"error"}
                                              message={this.state.warningMsg}
                                              closeMethod={() => this.closeWarningDialog()}/>
                                <div className="grid-wrapper">
                                    <div className="col-25">
                                        <TextField disabled={false} readOnly={false} label={"Customer Code"}  state={inputState} required={true} ref={(input) => {this.inputCustomerCode = input}}/>
                                    </div>

                                    <div className="col-25">
                                        <span className="small-body-text">Event Type File</span><span
                                        className="required-field"> *</span>
                                        <SelectionDropDownAdvanced options={eventTypeFilterArray}
                                                                   isClearable={false}
                                                                   isDisabled={false}
                                                                   isSearchable={false}
                                                                   isMulti={false}
                                                                   onChange={this.onChangeResponseDestination}
                                                                   ref={(selectBox) => this.eventTypeSelect = selectBox}
                                                                   defaultValue={this.state.eventTypeSel}

                                        />
                                    </div>
                                    <div className="col-25">
                                        <span className="small-body-text">Destination Name </span><span
                                        className="required-field"> *</span>
                                        <SelectionDropDownAdvanced options={DestinationTypeArray}
                                                                   isClearable={false}
                                                                   isDisabled={false}
                                                                   isSearchable={false}
                                                                   isMulti={false}
                                                                   onChange={this.onChangeResponseDestination}
                                                                   ref={(selectBox) => this.destnationNameSelect = selectBox}
                                                                   defaultValue={this.state.destNameSel}
                                        />
                                    </div>
                                    <div className="col-25">
                                        <TextField disabled={false} readOnly={false} label={"Destination Email"}  state={inputState} required={false} ref={(input) => {this.inputEmail = input}}/>
                                    </div>





                                </div>
                            </section>
                        </div>
                }
            </div>
        )
    }
}
export default ResponseDestination;