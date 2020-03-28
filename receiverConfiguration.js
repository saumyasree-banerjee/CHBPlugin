import React, {Component} from 'react';
import Loader from '../Common/Loader';
import {FilterSection, ModalMain, SelectionDropDownAdvanced} from 'damco-components';
import {DataTable} from 'damco-components';
import API from "../../../Constants/API-config";
import {TextField} from 'damco-components';
import {InPageDialog} from 'damco-components';
import {Environment} from "../../../Constants/Environment";
import ReactExport from "react-export-excel";


class ReceiverSection extends Component {
    constructor(props) {
        super(props);
        let tableActions = {
            primaryActionIsMoreBtn: false,
            primaryActionLabel: "Add Sender Configuration",
            primaryAction: () => this.addReceiver(),

        }
        this.state = {
            userDataForApiHeader: {
                name: this.props.dataSendToApiHeader.name,
                email: this.props.dataSendToApiHeader.email,
                userType: this.props.dataSendToApiHeader.userType,
                defaultBeCode: this.props.dataSendToApiHeader.defaultBeCode,
                otherBeCodes: (this.props.dataSendToApiHeader.otherBeCodes) ? this.props.dataSendToApiHeader.otherBeCodes.join(",") : null,
                organizationName: this.props.dataSendToApiHeader.organizationName,
                applicationName: this.props.dataSendToApiHeader.applicationName,
            },
            processingType:'',
            showDialog: false,
            showExistsDialog: false,
            warningMsg: '',
            showWarningDialog: false,
            loader: false,
            showAddReceiverError: false,
            showNewReceiverPage: false,
            hideErrorState: false,
            isDisabled: true,
            isDisabledSelect: false,
            iconWrapper: true,
            fileInfo: false,
            fileName: '',
            progress: false,
            clear: true,
            width: 1,
            speed: false,
            intervalSetForContentRefresh: 60000,
            intervalSetForContentAfterLoad: 5000,
            timeoutSetForContentAfterLoad: 120000,
            isSelectable: true,
            receiverTableContent: [],
            columns: [],
            clicking: true,
            pageNumber: 1,
            actions:tableActions,
            columnDataObj:[],
            colObj:[],
            pageSize:0,
            SearchPageSize: 10,
            senderTypeSel:null,
            methodIDSel:null,
            showModal:false,
            pending:true,
            existingPageSize:0,
            showErrorExportDialog: false,
            callExportExcel:true
        }
        this.saveReceiver = this.saveReceiver.bind(this);
        this.cancelPage = this.cancelPage.bind(this);
        this.fetchProcessingType = this.fetchProcessingType.bind(this);
        this.invalidExport = this.invalidExport.bind(this);
    }
    invalidExport(){
        let self = this;
        self.setState({
            showErrorExportDialog:true
        })
    }
    checkin(pending,pgSize,pageSize){
        if(pending=== true){

            console.log("Pending state")

            this.setState({
                pending:false,
                loader:false,
                showModal:false

            })
            this.reloading(pgSize,pageSize)
        }

    }
    reloading(pgSize,pageSize) {
        let self=this;
        const vals = {
            pageSize: pageSize,
            page: pgSize-1,
            clear: false,
            showModal:false,

        };
        self.setState({
            loader:true,
            pending:true,
            callExportExcel:true,

            showErrorExportDialog:false

        });
        const instance = null;
        this.initializeToken(vals,instance);

    }

    addReceiver = () => {
        let selectDefault={
            value:"Select",
            label:"Select"
        }

        this.setState({
            showNewReceiverPage: true,
            showWarningDialog:false,
            showDialog:false,
            showExistsDialog:false,
            senderTypeSel:selectDefault,
            methodIDSel:selectDefault
        });
    }
    closeDialog(){
        this.setState({
            showDialog:false,
            showExistsDialog: false
        })
    }
    closeWarningDialog(){
        this.setState({
            showWarningDialog:false,
            showErrorExportDialog: false
        })
    }
    showAddReceiverError(){
        this.setState({
            showAddReceiverError: true
        })
    }
    hideModal(){
        this.setState({
            showAddReceiverError: false,
            showErrorExportDialog: false
        })
    }
    componentWillMount = () => {
        this.setState({loader: true,});
    }

    componentDidMount = () => {
        // let self = this;
        //this.loadReceiverData();
    }

    componentWillUnmount = () => {
        clearTimeout(this.fetchDataTimeOut);
        clearInterval(this.fetchDataInterval);
    }

    signOut = () => {
        this.props.signOut();
    }
    onChangeSender = (value) => {

    }
    exportToExcelSenderConfigTable(tokenData,state,datalength) {
        let self = this;

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
        fetch(API.RECEIVER_SEARCH + "?pageNumber=" + pagetotal + "&pageSize=" + datalength, {
            method: "POST",
            body: JSON.stringify(obj),
            headers: headers,
            signal: signal
        }).then(function (response) {
            return response.json();
        }).then(function (data) {
            const results = data.PluginReceiverConfiguration.map((_arrayElement) => Object.assign({}, _arrayElement));
            self.setState({
                dataForExport: results
            })
        });
    }
    fetchReceiverData(state, instance) {
        this.setState({
            loader:true
        })
        if( state.data !== undefined) {
            if (state.data.length === 0) {
                this.setState({
                    callExportExcel: true
                })
            } else {
                this.setState({
                    callExportExcel: false
                })
            }
        }
        this.initializeToken(state, instance);
    }
    initializeToken(state, instance) {
        let self = this;
        var tokenData = '';
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
                self.searchReceiverService(tokenData, state, instance);

            });
        }
    };
    searchReceiverService(tokenData, state, instance) {
        // console.log(state, ' State');
        let self = this;
        let pagetotal = state.page + 1;
        let jsonObj;
        self.setState({
            pageSize:state.pageSize,
            SearchPageSize: state.pageSize,
            loader:true,
            showErrorExportDialog: false
        })
        if(self.state.colObj === []){
            jsonObj = "[]";
        } else {
            jsonObj = self.state.colObj;
        }
        // console.log(jsonObj, ' :JSON OBJ');
        if (tokenData !== "") {
            let headers=Environment.headerValues;
            headers.Authorization='Bearer ' + tokenData;
                    fetch(API.RECEIVER_SEARCH + "?pageNumber=" + pagetotal + "&pageSize=" + state.pageSize,{
                    method: "POST",
                    body: JSON.stringify(jsonObj),
                    headers: headers
                }).then(function (response) {
                    return response.json();
                }).then(function (data) {
                        let dataLength = data.TotalRecords;
                        if (data.PluginReceiverConfiguration != null) {
                            data.PluginReceiverConfiguration.map(item => {
                                if(item.ReceiverType !== null) {
                                    item.ReceiverType = item.ReceiverType.toString();
                                    item.ReceiverType = [item.ReceiverType, "/SenderConfiguration/" + item.ReceiverConfigurationId];
                                }else{
                                    item.ReceiverType = 'DATABIND';
                                    item.ReceiverType = [item.ReceiverType, "/SenderConfiguration/" + item.ReceiverConfigurationId];
                                }
                                if(item.CreatedDate!== null) {
                                    item.CreatedDate = item.CreatedDate.slice(0, 4) + '-' + item.CreatedDate.slice(5, 7) + '-' + item.CreatedDate.slice(8, 10) + ' ' + item.CreatedDate.slice(11, 19);
                                }
                                if(item.UpdatedDate !== null) {
                                    item.UpdatedDate = item.UpdatedDate.slice(0, 4) + '-' + item.UpdatedDate.slice(5, 7) + '-' + item.UpdatedDate.slice(8, 10) + ' ' + item.UpdatedDate.slice(11, 19);
                                }
                                return null;
                            });
                        }
                    let record = data.TotalRecords % state.pageSize;
                    if (record === 0) {
                        let pagenum = (data.TotalRecords) / state.pageSize;
                        self.setState({
                            pageNumber: pagenum
                        })
                    } else {
                        let remain = data.TotalRecords % state.pageSize;
                        self.setState({
                            pageNumber: (((data.TotalRecords) - remain) / state.pageSize) + 1
                        })
                    }
                    if(data.PluginReceiverFiles !== null) {
                        self.setState({
                            loader: false,
                            receiverTableContent: data.PluginReceiverConfiguration,
                            pending:false
                        });
                    }
                        if(dataLength <= Environment.defaultDownloadExcelLimit) {
                            if (self.state.callExportExcel === true) {

                                self.exportToExcelSenderConfigTable(tokenData, state, dataLength);
                            }

                        }

                        self.fetchProcessingType(tokenData);
                })
            let pgsize=state.page + 1
            var a=setTimeout(() => this.checkin(self.state.pending,pgsize,state.pageSize), 10000);
            }
    }
    apply(){
        let receiverFilterValues = this.filters.getFilterValues();
        console.log(receiverFilterValues);
        this.closeDialog();
        this.setState({loader: true,showExistsDialog: false,
            showDialog: false,
            showErrorExportDialog: false});
        this.dataTable.table.state.page=0;
        let receiverType = '';
        let receiver = '';
        let fileName = '';
        let subject = '';
        let customerCode = '';
        let active = '';
        let addedDateTime = '';
        let updatedDateTime = '';
        let addedDateTimeTo = '';
        let updatedDateTimeTo = '';
        let createdBy = '';
        let updateBy = '';
        let processingType = '';
        let addDateTimeValue = '';
        let updatedDateTimeValue = '';
        let addDateTimeValueTo = '';
        let updatedDateTimeValueTo = '';
        if(receiverFilterValues.length <= 4) {
            receiverType = receiverFilterValues[0].value;
            receiver = receiverFilterValues[1].value;
            fileName = receiverFilterValues[2].value;
            subject = receiverFilterValues[3].value;
        } else {
            receiverType = receiverFilterValues[0].value;
            receiver = receiverFilterValues[1].value;
            fileName = receiverFilterValues[2].value;
            subject = receiverFilterValues[3].value;
            // methodId = receiverFilterValues[4].value;
            customerCode = receiverFilterValues[5].value;
            createdBy = receiverFilterValues[7].value;
            updateBy = receiverFilterValues[8].value;
            processingType = receiverFilterValues[4].value;
            active = receiverFilterValues[6].value;
            addedDateTime = receiverFilterValues[9].value;
            addedDateTimeTo = receiverFilterValues[10].value;
            updatedDateTime = receiverFilterValues[11].value;
            updatedDateTimeTo = receiverFilterValues[12].value;
        }
        if(active === null) {
            active = '';
        }
        if(addedDateTime !== ''){
            let yearConst = addedDateTime.slice(6, 10);
            let monthConst = addedDateTime.slice(3, 5);
            let daysConst = addedDateTime.slice(0, 2);
            addDateTimeValue = yearConst + '-' + monthConst+'-'+daysConst;
        }else{
            addDateTimeValue='';
        }
        if(updatedDateTime !== ''){
            let yearConst = updatedDateTime.slice(6, 10);
            let monthConst = updatedDateTime.slice(3, 5);
            let daysConst = updatedDateTime.slice(0, 2);
            updatedDateTimeValue = yearConst + '-' + monthConst+'-'+daysConst;
        }else{
            updatedDateTimeValue='';
        }
        if(addedDateTimeTo !== ''){
            let yearConst = addedDateTimeTo.slice(6, 10);
            let monthConst = addedDateTimeTo.slice(3, 5);
            let daysConst = addedDateTimeTo.slice(0, 2);
            addDateTimeValueTo = yearConst + '-' + monthConst+'-'+daysConst;
        }else{
            addDateTimeValueTo ='';
        }
        if(updatedDateTime !== ''){
            let yearConst = updatedDateTime.slice(6, 10);
            let monthConst = updatedDateTime.slice(3, 5);
            let daysConst = updatedDateTime.slice(0, 2);
            updatedDateTimeValue = yearConst + '-' + monthConst+'-'+daysConst;
        }else{
            updatedDateTimeValue='';
        }
        if(updatedDateTimeTo !== ''){
            let yearConst = updatedDateTimeTo.slice(6, 10);
            let monthConst = updatedDateTimeTo.slice(3, 5);
            let daysConst = updatedDateTimeTo.slice(0, 2);
            updatedDateTimeValueTo = yearConst + '-' + monthConst+'-'+daysConst;
        }else{
            updatedDateTimeValueTo = '';
        }
        this.setState({
            columnDataObj : []
        });
        let columnDataObj = this.state.columnDataObj;
        let senderTypeItem = {
            "ColumnName": 'ReceiverType',
            "Operator": 'equal',
            "Value1": receiverType,
            "Value2": ''
        };
        if(receiverType !== '' && receiverType!=='Select' ) {
            columnDataObj.push(senderTypeItem);
        }
        let platformCodeItem = {
            "ColumnName": 'Receiver',
            "Operator": 'contains',
            "Value1": receiver,
            "Value2": ''
        };
        if(receiver !== '' ) {
            columnDataObj.push(platformCodeItem);
        }
        let fileNameItem = {
            "ColumnName": 'FileName',
            "Operator": 'contains',
            "Value1": fileName,
            "Value2": ''
        };
        if(fileName !== '' ) {
            columnDataObj.push(fileNameItem);
        }
        let subjectItem = {
            "ColumnName": 'Subject',
            "Operator": 'contains',
            "Value1": subject,
            "Value2": ''
        };
        if(subject !== '' ) {
            columnDataObj.push(subjectItem);
        }
        let customerCodeItem = {
            "ColumnName": 'CustomerCode',
            "Operator": 'contains',
            "Value1": customerCode,
            "Value2": ''
        };
        if(customerCode !== '' ) {
            columnDataObj.push(customerCodeItem);
        }
        let activeItem = {
            "ColumnName": 'IsActive',
            "Operator": 'equal',
            "Value1": active,
            "Value2": ''
        };
        if(active !== '' && active!=='Select' ) {
            columnDataObj.push(activeItem);
        }
        let processingTypeItem = {
            "ColumnName": 'Type',
            "Operator": 'equal',
            "Value1": processingType,
            "Value2": ''
        };
        if(processingType !== '' && processingType !=='Select') {
            columnDataObj.push(processingTypeItem);
        }

        let addedByItem = {
            "ColumnName": 'CreatedBy',
            "Operator": 'contains',
            "Value1": createdBy,
            "Value2": ''
        };
        if(createdBy !== '' ) {
            columnDataObj.push(addedByItem);
        }
        let updatedByItem = {
            "ColumnName": 'UpdatedBy',
            "Operator": 'contains',
            "Value1": updateBy,
            "Value2": ''
        };
        if(updateBy !== '' ) {
            columnDataObj.push(updatedByItem);
        }
        let addedDateTimeItem = {
            "ColumnName": 'CreatedDate',
            "Operator": 'range',
            "Value1": addDateTimeValue,
            "Value2": addDateTimeValueTo
        };
        if(addDateTimeValue !== '' ) {
            columnDataObj.push(addedDateTimeItem);
        }
        let updatedDateTimeItem = {
            "ColumnName": 'UpdatedDate',
            "Operator": 'range',
            "Value1": updatedDateTimeValue,
            "Value2": updatedDateTimeValueTo
        };
        if(updatedDateTimeValue !== '' ) {
            columnDataObj.push(updatedDateTimeItem);
        }
        this.setState({
            colObj:columnDataObj
        });
        this.useTokenForReceiverSearch(columnDataObj);
    }
    useTokenForReceiverSearch(obj) {
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
                sessionStorage.setItem("tokenDataFromAud", JSON.stringify(data));
                tokenData = data;
                self.searchReceiver(tokenData,obj);
            });
        }
    };
    searchReceiver(tokenData, obj){
        let self = this;
        let pagetotal = 1;
        var pageSize=10;
        if(self.state.pageSize>=0){
         pageSize=self.state.pageSize
        }
        self.setState({
            loader:false
        })
        if (tokenData !== "") {
            let headers=Environment.headerValues;
            headers.Authorization='Bearer ' + tokenData;
            fetch(API.RECEIVER_SEARCH + "?pageNumber=" + pagetotal + "&pageSize=" + pageSize, {
                method: "POST", // *GET, POST, PUT, DELETE, etc.
                body: JSON.stringify(obj),
                headers: headers
            }).then(function (response) {
                return response.json();
            }).then(function (data) {
                let dataLength = data.TotalRecords;
                if (data.PluginReceiverConfiguration != null) {
                    data.PluginReceiverConfiguration.map(item => {
                        if(item.ReceiverType !== null) {
                            item.ReceiverType = item.ReceiverType.toString();
                            item.ReceiverType = [item.ReceiverType, "/SenderConfiguration/" + item.ReceiverConfigurationId];
                        }
                        if(item.CreatedDate !== null) {
                            item.CreatedDate = item.CreatedDate.slice(0, 4) + '-' + item.CreatedDate.slice(5, 7) + '-' + item.CreatedDate.slice(8, 10) + ' ' + item.CreatedDate.slice(11, 19);
                        }
                        if(item.UpdatedDate!== null) {
                            item.UpdatedDate = item.UpdatedDate.slice(0, 4) + '-' + item.UpdatedDate.slice(5, 7) + '-' + item.UpdatedDate.slice(8, 10) + ' ' + item.UpdatedDate.slice(11, 19);
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
                    let remain = data.TotalRecords % self.state.SearchPageSize;
                    self.setState({
                        pageNumber: (((data.TotalRecords) - remain) / self.state.SearchPageSize) + 1
                    })
                }
                self.setState({
                    loader:false
                })
                if(data.PluginReceiverConfiguration !== null) {
                    self.setState({
                        loader: false,
                        receiverTableContent: data.PluginReceiverConfiguration,
                        pending:false
                    });
                }
                if(dataLength <= Environment.defaultDownloadExcelLimit) {
                    self.exportToExcelSenderConfigTable(tokenData,self.state,dataLength);
                }
                else {
                    self.setState({
                        dataForExport:null
                    })
                }

            })
            let pgSize=1;
            setTimeout(() => this.checkin(self.state.pending,pgSize,self.state.pageSize), 10000);
        }
    };
    clear() {
        this.setState({loader: true,
            colObj:[],
            callExportExcel:true,

            showErrorExportDialog:false


        });
        this.dataTable.table.state.page=0;

        let values={
            page:0,
            pageSize:10
        }
        let instance=null;
        this.fetchReceiverData(values,instance);
    }
    cancelPage(e) {
        this.setState({
            showNewReceiverPage :false
        });
    }
    fetchProcessingType(tokenData) {
        const self = this;
        if (tokenData !== "") {
            let headers=Environment.headerValues;
            headers.Authorization='Bearer ' + tokenData;
            fetch(API.RECEIVER_LOAD_PROCESSING_TYPE,{
                method: "GET",
                headers: headers
            }).then(function (response) {
                return response.json();
            }).then(function (data) {
                // console.log(data);
                self.setState({
                    processingType :data
                });
            });
        }
    }
    saveReceiver() {
        let self = this;
        self.setState({
            showWarningDialog: false
        });
        let date = new Date().getDate();
        let month = new Date().getMonth() + 1;
        let year = new Date().getFullYear();
        let jsonData =
            {
                "ReceiverType": this.senderCodeSelect.getSelection().toString(),
                "Receiver": this.inputCode.getValue(),
                "FileName": this.inputFileName.getValue(),
                "Subject": this.inputSubject.getValue(),
                "MethodId": this.processCodeSelect.getSelection().toString(),
                "CustomerCode": this.inputCustomerCode.getValue(),
                "CreatedDate": year + '-' + month + '-' + date,
                "CreatedBy": sessionStorage.getItem('userMail'),
                "UpdatedDate": year + '-' + month + '-' + date,
                "UpdatedBy": sessionStorage.getItem('userMail'),
                "isActive": true
            };
        let receivertSelected=this.senderCodeSelect.state.value;
        let methodSelected=this.processCodeSelect.state.value;
        this.setState({

            senderTypeSel:receivertSelected,
            methodIDSel:methodSelected
        })
       if(this.senderCodeSelect.getSelection().toString()==='Select' || this.processCodeSelect.getSelection().toString()=== 'Select'){

           self.setState({
               warningMsg: 'Mandatory Field cant be left blank',
               showWarningDialog: true,
           });

       }
       else {
           let inputSubject = false;
           let inputCustomerCode = false;
           let inputSenderEmail = false;
           if (this.senderCodeSelect.getSelection() === 'eMail' && this.inputSubject.getValue() === '') {
               inputSubject = true;
           }
           if (this.processCodeSelect.getSelection() === 1 && this.inputCustomerCode.getValue() === '') {
               inputCustomerCode = true;
           }
           const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;// eslint-disable-line
           if (this.senderCodeSelect.getSelection() === 'eMail') {
               if (reg.test(this.inputCode.getValue()) === true) {
                   inputSenderEmail = true;
               } else {
                   inputSenderEmail = false;
               }
           } else {
               inputSenderEmail = true;
           }
           if (inputSenderEmail === false || this.inputCode.getValue() === '' || this.inputFileName.getValue() === '' || inputSubject === true || inputCustomerCode === true) {
               if (inputCustomerCode === true) {
                   self.setState({
                       warningMsg: 'Please Enter Customer Code',
                       showWarningDialog: true,
                   });
               }
               if (inputSubject === true) {
                   self.setState({
                       warningMsg: 'Please Enter Subject',
                       showWarningDialog: true,
                   });
               }
               if (this.inputFileName.getValue() === '') {
                   self.setState({
                       warningMsg: 'Please Enter File Name',
                       showWarningDialog: true,
                   });
               }
               if (this.inputCode.getValue() === '') {
                   self.setState({
                       warningMsg: 'Please Enter Sender Details',
                       showWarningDialog: true,
                   });
               }
               if (this.senderCodeSelect.getSelection().toString() === 'eMail' && inputSenderEmail === false) {
                   self.setState({
                       warningMsg: 'Please Enter Valid Email Id',
                       showWarningDialog: true,
                   });
               }
           } else {
               this.setState({
                   loader: true
               });
               let tokenData = '';
               if (tokenData === '') {
                   const Aud = {
                       "Audience": API.AUDIENCE_ID
                   }
                   fetch(API.TOKEN_NUMBER_URL, {
                       method: 'POST',
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
                           fetch(API.RECEIVER_ADD, {
                               method: "POST",
                               body: JSON.stringify(jsonData),
                               headers: headers
                           }).then(function (response) {
                               if (response.status === 200) {
                                   self.setState({
                                       loader: false,
                                       showNewReceiverPage: false,
                                       showDialog: true,
                                       showExistsDialog: false
                                   });
                               } else if (response.status === 409) {
                                   self.setState({
                                       loader: false,
                                       showNewReceiverPage: false,
                                       showExistsDialog: true,
                                       showDialog: false
                                   });
                               }
                           }).then(function (data) {
                           })
                       }
                   });
               }
           }
       }
    }
    render() {
        let i;
        let processingTypeArray = [];
        if(this.state.processingType.length > 0){
            for(i = 0; i< this.state.processingType.length; i++) {
                let destinationObj = {value: this.state.processingType[i].Type, label: this.state.processingType[i].Type};
                processingTypeArray.push(destinationObj);
            }
        }
        let proceesingValue={
            value:"Select",
            label:"Select"
        }
        processingTypeArray.unshift( proceesingValue );
        let processingIDArray = [];
        if(this.state.processingType.length > 0){
            for(i = 0; i< this.state.processingType.length; i++) {
                let destinationObj = {value: this.state.processingType[i].ID, label: this.state.processingType[i].Type};
                processingIDArray.push(destinationObj);
            }
        }
        let proceesingIDValue={
            value:"Select",
            label:"Select"
        }
        processingIDArray.unshift( proceesingIDValue );
        let  ReceiverTypeArray = [{value:"Select", label:"Select"},{value:"sFTP", label:"sFTP"},{value:"eMail", label:"eMail"}];
        let filters = {
            defaultStateOpen: true,
            moreLess: true,
            inputs: [
                {id: 1, label: 'Sender Type', type: 'dropdown', placeholder:'Select', options: [{label: 'Select', value:'Select'},{label: 'sFTP', value:'sFTP'}, {label: 'eMail', value:'eMail'},{label: 'Application', value:'Application'}], isBaseFilter: true},
                {id: 2, label: 'Sender Details', type: 'text', placeholder: "Enter Sender Details", isBaseFilter: true},
                {id: 3, label: 'File Name', type: 'text', placeholder: "Enter File Name", isBaseFilter: true},
                {id: 4, label: 'Subject', type: 'text', placeholder: "Enter Subject", isBaseFilter: true},
                {id: 5, label: 'Processing Type', type: 'dropdown', placeholder:'Select', options: processingTypeArray, isBaseFilter: false},
                {id: 6, label: 'Customer Code', type: 'text', placeholder: "Enter Customer Code", isBaseFilter: false},
                {id: 7, label: 'Active',  type: 'dropdown',  placeholder:'Select', options: [{label: 'Select', value:'Select'},{label: 'True', value:'true'}, {label: 'False', value:'false'}], isBaseFilter: false},
                {id: 8, label: "Created From", type: 'date-mon-sun', noDateOption: false, isBaseFilter: false},
                {id: 9, label: "Created To", type: 'date-mon-sun', noDateOption: false, isBaseFilter: false},
                {id: 10, label: 'Created By', type: 'text', placeholder: "Enter Created By", isBaseFilter: false},
                {id: 11, label: 'Updated From', type: 'date-mon-sun', noDateOption: false, isBaseFilter: false},
                {id: 12, label: 'Updated To', type: 'date-mon-sun', noDateOption: false, isBaseFilter: false},
                {id: 13, label: "Update By",type: 'text', placeholder: "Enter Updated By", isBaseFilter: false}
            ]
        };
        const ExcelFile = ReactExport.ExcelFile;
        const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
        const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;
        if(this.state.dataForExport!==null && typeof this.state.dataForExport!== undefined){
            // console.log(this.state.dataForExport,'excel sheet table values')
        }
        let inputState = {
            warningInputText: "Warning text",
            errorInputText: "Error text",
            warning: false,
            error: false,
            complete: false
        };
        return (
            <div>
            {
                this.state.showNewReceiverPage === false ?
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
                                        <h1>Sender Configuration </h1>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <section className="page-container">
                            <div className="grid-wrapper">
                                <div className="col-100">
                                    <div>
                                        <FilterSection data={filters} applyAction={() => this.apply()}
                                                       clearAction={() => this.clear()}
                                                       ref={(filters) => this.filters = filters}/>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <br/>
                                <InPageDialog showDialog={this.state.showDialog} type={"success"} message={"Sender Configuration added successfully"} closeMethod={() => this.closeDialog()}/>
                                <InPageDialog showDialog={this.state.showExistsDialog} type={"warning"} message={"Record already exists"} closeMethod={() => this.closeDialog()}/>
                                <InPageDialog showDialog={this.state.showErrorExportDialog} type={"error"} message={"Returned result is more than " +Environment.defaultDownloadExcelLimit+ " records, Please add more filter and try again."} closeMethod={() => this.closeDialog()}/>
                                <br />
                            </div>
                            <div>
                            {this.state.dataForExport !== null ?
                            <ExcelFile filename="SenderConfig" element={<button type="button" className="button button-blue">Export to Excel</button>}>
                                <ExcelSheet data={this.state.dataForExport} name="Sender Config">
                                    <ExcelColumn label="Receiver Type" value="ReceiverType"/>
                                    <ExcelColumn label="Sender Details" value="Receiver"/>
                                    <ExcelColumn label="File Name" value="FileName"/>
                                    <ExcelColumn label="Subject" value="Subject"/>
                                    <ExcelColumn label="Processing Type" value="Type"/>
                                    <ExcelColumn label="Customer Code" value="CustomerCode"/>
                                    <ExcelColumn label="Active" value="IsActive"/>
                                    <ExcelColumn label="Created Time" value="CreatedDate"/>
                                    <ExcelColumn label="Created By" value="CreatedBy"/>
                                    <ExcelColumn label="Updated Time" value="UpdatedDate"/>
                                    <ExcelColumn label="Updated By" value="UpdatedBy"/>
                                </ExcelSheet>
                            </ExcelFile>:<div className="grid-wrapper"><button type="button" className="button button-blue" onClick={this.invalidExport}>Export to Excel</button></div>}
                            </div>
                            <br />
                            <div className="grid-wrapper">
                                <div className="col-100">
                                      <DataTable
                                        data={this.state.receiverTableContent}
                                        columns={[
                                            {
                                                headerClassName: 'data-table header ',
                                                accessor: "ReceiverType",
                                                editable: false,
                                                isHyperlink: true,
                                                fieldHeader: 'Sender Type',
                                                show: true
                                            },
                                            {
                                                headerClassName: 'data-table header ',
                                                accessor: "Receiver",
                                                editable: false,
                                                isLink: false,
                                                fieldHeader: 'Sender Details',
                                                show: true
                                            },
                                            {
                                                headerClassName: 'data-table header ',
                                                accessor: "FileName",
                                                editable: false,
                                                isLink: false,
                                                fieldHeader: 'File Name',
                                                show: true
                                            },
                                            {
                                                headerClassName: 'data-table header ',
                                                accessor: "Subject",
                                                editable: false,
                                                isLink: false,
                                                fieldHeader: 'Subject',
                                                show: true
                                            },
                                            {
                                                headerClassName: 'data-table header ',
                                                accessor: "Type",
                                                editable: false,
                                                isLink: false,
                                                fieldHeader: 'Processing Type',
                                                show: true
                                            },
                                            {
                                                headerClassName: 'data-table header ',
                                                accessor: "CustomerCode",
                                                editable: false,
                                                isLink: false,
                                                fieldHeader: 'Customer Code',
                                                show: true
                                            },
                                            {
                                                headerClassName: 'data-table header ',
                                                accessor: "IsActive",
                                                editable: false,
                                                isLink: false,
                                                fieldHeader: 'Active',
                                                show: true
                                            },
                                            {
                                                headerClassName: 'data-table header ',
                                                accessor: "CreatedDate",
                                                editable: false,
                                                isLink: false,
                                                fieldHeader: 'Created Time',
                                                show: true
                                            },
                                            {
                                                headerClassName: 'data-table header ',
                                                accessor: "CreatedBy",
                                                editable: false,
                                                isLink: false,
                                                fieldHeader: 'Created By',
                                                show: true
                                            },
                                            {
                                                headerClassName: 'data-table header ',
                                                accessor: "UpdatedDate",
                                                editable: false,
                                                isLink: false,
                                                fieldHeader: 'Updated Time',
                                                show: true
                                            },
                                            {
                                                headerClassName: 'data-table header ',
                                                accessor: "UpdatedBy",
                                                editable: false,
                                                isLink: false,
                                                fieldHeader: 'Updated By',
                                                show: true
                                            }

                                        ]}
                                        isSelectable={true}
                                        isSortable={false}
                                        isEditable={false}
                                        hasFooter={false}
                                        isExpandable={false}
                                        manualPagination={true}
                                        showPagination={true}
                                        showColumnOptions={true}
                                        pageCount={this.state.pageNumber}
                                        fetchData={this.fetchReceiverData.bind(this)}
                                        tableName={"ReceiverTable"}
                                        ref={(dataTable) => {
                                            this.dataTable = dataTable;
                                        }}
                                        statusOptions={this.state.statusOptions}
                                        actions={this.state.actions}
                                        height={400
                                        }/>
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
                                        <h1>Create Sender Configuration</h1>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <section className="page-container">
                            <div className="grid-wrapper">
                                <div className="button-group">
                                    <button type="button" className="button button-blue" onClick={this.saveReceiver}>SAVE</button>
                                    <button type="button" className="button button-transparent" onClick={this.cancelPage}>CANCEL</button>&nbsp;&nbsp;
                                </div>
                            </div>
                            <InPageDialog showDialog={this.state.showWarningDialog} type={"error"}
                                          message={this.state.warningMsg}
                                          closeMethod={() => this.closeWarningDialog()}/>
                            <div className="grid-wrapper">
                                <div className="col-25 form-group"><span className="small-body-text">Sender Type</span><span
                                    className="required-field"> *</span>
                                    <SelectionDropDownAdvanced options={ReceiverTypeArray}
                                                               isClearable={false}
                                                               isDisabled={false}
                                                               isSearchable={false}
                                                               onChange={this.onChangeSender}
                                                               isMulti={false}
                                                               ref={(selectBox) => this.senderCodeSelect = selectBox}
                                                               defaultValue={this.state.senderTypeSel}
                                    /></div>
                                <div className="col-25">
                                    <TextField disabled={false} readOnly={false} label={"Sender Details (email address for eMail)"}  state={inputState} required={true} ref={(input) => {this.inputCode = input}}/>
                                </div>
                                <div className="col-25">
                                    <TextField disabled={false} readOnly={false} label={"File Name"}  state={inputState} required={true} ref={(input) => {this.inputFileName = input}}/>
                                </div>
                            </div>
                            <div className="grid-wrapper">
                                <div className="col-25">
                                    <TextField disabled={false} readOnly={false} label={"Subject"}  state={inputState} required={false} ref={(input) => {this.inputSubject = input}}/>
                                </div>
                                <div className="col-25">
                                    <TextField disabled={false} readOnly={false} label={"Customer Code"}  state={inputState} required={false} ref={(input) => {this.inputCustomerCode = input}}/>
                                </div>
                                <div className="col-25 form-group"><span className="small-body-text">Method Id</span><span
                                    className="required-field"> *</span>
                                    <SelectionDropDownAdvanced options={processingIDArray}
                                                               isClearable={false}
                                                               isDisabled={false}
                                                               isSearchable={false}
                                                               onChange={this.onChangeSender}
                                                               isMulti={false}
                                                               ref={(selectBox) => this.processCodeSelect = selectBox}
                                                               defaultValue={this.state.methodIDSel}
                                    /></div>
                            </div>
                        </section>
                        <ModalMain modal={this.state.showAddReceiverError} title={"Error"} hideMethod={() => this.hideModal()} secondaryMethod={() => this.hideModal()}
                                   primaryMethod={() => this.hideModal()} btnTitle1={"OK"} btnTitle2={"Cancel"}>
                            Please Add the Mandatory fields<br />Receiver Email<br/> Receiver Type <br /> File Name<br />Customer Code<br />Subject<br />Method

                        </ModalMain>
                        <Loader loader={this.state.loader}/>
                    </div>
            }
            </div>
        )
    }
}

class ErrorSection extends Component {
    constructor(props) {
        super(props)
        this.state = {
            sortableError: true,
            subColumns: [],
            isExpanded: true,
        }
    }

    render() {
        return (
            <div></div>
        )
    }
}

class Receiver extends Component {
    constructor(props) {
        super(props)
        this.state = {
            platformTableErrorDetails: null,
            platformTableError: null,
            errorDetails: false,
            loader: false,
        }
    }


    render() {
        return (
            <div>
                <ReceiverSection dataSendToApiHeader={this.props.dataSendToApiHeader}
                                   showErrorDetails={this.showErrorDetails}/>
                {(this.state.errorDetails)
                    ?
                    <ErrorSection platformTableErrorDetails={this.state.platformTableErrorDetails}
                                  platformTableError={this.state.platformTableError}/>
                    : null
                }
                <Loader loader={this.state.loader}/>
            </div>
        )
    }
}

export default Receiver;