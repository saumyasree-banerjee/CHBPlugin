import React, {Component} from 'react';
import Loader from '../Common/Loader';
import {FilterSection, InPageDialog, TextField} from 'damco-components';
import {DataTable,SelectionDropDownAdvanced} from 'damco-components';
import API from "../../../Constants/API-config";
import {Environment} from "../../../Constants/Environment";
import ReactExport from "react-export-excel";
class ReceiverEventTypeFile extends Component {
    constructor(props) {
        super(props);
        let tableActions = {
            primaryActionIsMoreBtn: false,
            primaryActionLabel: "Add New Event Type File ",
            primaryAction: () => this.addReceiverEventFile(),

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
            showNewReceiverEventFilePage:false,
            warningMsg: '',
            showWarningDialog: false,
            EventtypefileMultiple:null,
            showAddError:false,
            addErrorMsg:'',
            pageSize:0,
            defaultValues:'',
            EventTypeFileSel:null,
            errorEventTypeFile: false,
            errorEventTypeName: false,
            showModal:false,
            pending:true,
            existingPageSize:0,
            pendingLoadEvent:true,
            pendingBrainToken:true
        }
        this.cancelPage = this.cancelPage.bind(this);
        this.saveReceiverEventFile = this.saveReceiverEventFile.bind(this);
    }
    addReceiverEventFile = () => {
        let selectDefault={
            value:"Select",
            label:"Select"
        }
        this.setState({
            showNewReceiverEventFilePage: true,
            EventTypeFileSel:selectDefault,
            showWarningDialog:false,
            showAddError: false
        });
    }
    onChangeEventTypeFile = (value) => {

    }
    exportToExcelReceiverEventTypeFile(tokenData,state,datalength) {
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
        fetch(API.EVENTTYPEFILE_SEARCH + "?pageNumber=" + pagetotal + "&pageSize=" + datalength, {
            method: "POST",
            body: JSON.stringify(obj),
            headers: headers,
            signal: signal
        }).then(function (response) {
            return response.json();
        }).then(function (data) {
            const results = data.EventTypeFileList.map((_arrayElement) => Object.assign({}, _arrayElement));
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
    checkin(pending,pgSize,pageSize){
        if(pending=== true){
            console.log("Pending state")

            this.setState({
                pending:false,
                loader:false,
                showModal:false,

            })
            this.reloading(pgSize,pageSize)
        }

    }
    loadEvent(pendingLoadEvent,pgSize,pageSize){
        if(pendingLoadEvent=== true){
            console.log("Pending state")

            this.setState({
                pendingLoadEvent:false,
                loader:false,
                showModal:false,

            })
            this.reloading(pgSize,pageSize)
        }

    }
    loadToken(pendingBrainToken,pgSize,pageSize){
        if(pendingBrainToken=== true){
            console.log("Pending state")

            this.setState({
                pendingBrainToken:false,
                loader:false,
                showModal:false,

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
            pendingLoadEvent:true,
            pendingBrainToken:true


        });
        const instance = null;
        this.initializeToken(vals, instance);

        //  this.loadIdentifiedTableData(vals,instance);
    }
    closeDialog(){
        this.setState({
            showDialog:false,
            showExistsDialog:false,
            addErrorMsg:false,
            showWarningDialog:false,
            showAddError: false

        })
    }


    fetchEventFileTypeTable(state, instance) {
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
                    loader:true,
                    pendingBrainToken:false
                });
                self.getEventTypeFile(tokenData,state,instance);
            })

            let pgsize=state.page + 1
            setTimeout(() => this.loadToken(self.state.pendingBrainToken,pgsize,state.pageSize), 5000);
        }
    };
    getEventTypeFile(tokenData,state,instance){
        let self = this;
        fetch(API.RECEIVER_EVENT_TYPE,{
            method: "GET",
            headers: {
                'pragma': 'no-cache',
                "Content-Type": "application/json",
                "Accept": "text/html",
                'Authorization': 'Bearer ' + tokenData,
                'Access-Control-Allow-Origin': '*',
            }
        }).then(function (response) {
            return response.json();
        }).then(function (data) {
            self.setState({
                EventtypefileMultiple: data,
                pendingLoadEvent:false
            });
            self.searchDestinationType(tokenData, state, instance);
        }).catch(err => {
            self.setState({
                loader: false

            })
        })
        let pgsize=state.page + 1
        setTimeout(() => this.loadEvent(self.state.pendingLoadEvent,pgsize,state.pageSize), 5000);

    }
    searchDestinationType(tokenData, state, instance) {
        let self = this;
        var aClear;


        if(state.pageSize!==undefined && state.pageSize!==null )
            self.setState(
                {
                    SearchPageSize:state.pageSize,
                    pageSize:state.pageSize
                }
            )

        let pagetotal = state.page + 1;
        let jsonObj;
        if(self.state.colObj === []){
            jsonObj = "[]";
        } else {
            jsonObj = self.state.colObj;
        }
        if (tokenData !== "") {
            fetch(API.EVENTTYPEFILE_SEARCH +"?pageNumber=" + pagetotal +"&pageSize="+state.pageSize ,{
                method: "POST",
                body: JSON.stringify(jsonObj),
                headers: {
                    'pragma': 'no-cache',
                    "Content-Type": "application/json",
                    "Accept": "text/html",
                    'Authorization': 'Bearer ' + tokenData,
                    'Access-Control-Allow-Origin': '*',
                }
            }).then(function (response) {
                return response.json();
            }).then(function (data) {
                clearTimeout(aClear);

                if (data.EventTypeFileList !== null) {
                    self.setState({
                        pending:false
                    })
                    data.EventTypeFileList.map(item => {
                        item.FileName = item.FileName.toString();
                        item.FileName = [item.FileName, "/EventFileName/" +item.FileName+"/" + item.EventTypeFileId];
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
                if(data.EventTypeFileList !== null) {
                    self.setState({
                        loader: false,
                        EventTypeFileList: data.EventTypeFileList,
                        pending:false
                    });
                }
                self.exportToExcelReceiverEventTypeFile(tokenData,state,data.TotalRecords);
            }).catch(err => {
                self.setState({
                    loader: false


                });
            })
            let pgsize=state.page + 1
            aClear=setTimeout(() => this.checkin(self.state.pending,pgsize,state.pageSize), 10000);
        }
    }

    applyEventTypeFile() {
        this.setState({
            loader:true,
            columnDataObj : [],
            showAddError:false
        });
        this.dataTable.table.state.page=0;

        let eventTypefileFilterValues = this.filters.getFilterValues();
        // console.log(eventTypefileFilterValues, ' - eventTypefileFilterValues');
        // let eventTypeName = '';
        // let method = '';
        // let details = '';
        let active = '';
        let insertedBy = '';
        let updatedBy = '';
        let insertedByTo = '';
        let updatedByTo = '';
        let insertedTime = '';
        let updatedTime = '';
        let insertedTimeTo = '';
        let updatedTimeTo = '';
        let insertedTimeValue = '';
        let updatedTimeValue = '';
        let insertedTimeValueTo = '';
        let updatedTimeValueTo = '';
        let FileName="";
        let EventType='';
        let ResponseSource='';
        if(eventTypefileFilterValues.length <= 4) {
            if(eventTypefileFilterValues[1].value===null){
                eventTypefileFilterValues[1].value=""
            }
            if(eventTypefileFilterValues[2].value===null){
                eventTypefileFilterValues[2].value=""
            }

            FileName = eventTypefileFilterValues[0].value;
            EventType=eventTypefileFilterValues[1].value;
            insertedTime = eventTypefileFilterValues[2].value;
            insertedTimeTo = eventTypefileFilterValues[3].value;

        } else {
            if(eventTypefileFilterValues[2].value===null){
                eventTypefileFilterValues[2].value=""
            }
            if(eventTypefileFilterValues[3].value===null){
                eventTypefileFilterValues[3].value=""
            }
            FileName = eventTypefileFilterValues[0].value;
            active = eventTypefileFilterValues[5].value;
            ResponseSource=eventTypefileFilterValues[4].value;
            EventType=eventTypefileFilterValues[1].value;
            insertedTime = eventTypefileFilterValues[6].value;
            insertedTimeTo = eventTypefileFilterValues[7].value;
            insertedBy = eventTypefileFilterValues[2].value;
            updatedBy = eventTypefileFilterValues[3].value;
            updatedTime = eventTypefileFilterValues[8].value;
            updatedTimeTo = eventTypefileFilterValues[9].value;
        }
        if(insertedTime !== ''){
            let yearConst = insertedTime.slice(6, 10);
            let monthConst = insertedTime.slice(3, 5);
            let daysConst = insertedTime.slice(0, 2);
            insertedTimeValue = yearConst + '-' + monthConst+'-'+daysConst;
        }else{
            insertedTimeValue='';
        }
        if(insertedTimeTo !== ''){
            let yearConst = insertedTimeTo.slice(6, 10);
            let monthConst = insertedTimeTo.slice(3, 5);
            let daysConst = insertedTimeTo.slice(0, 2);
            insertedTimeValueTo = yearConst + '-' + monthConst+'-'+daysConst;
        }else{
            insertedTimeValueTo='';
        }
        if(updatedTime !== ''){
            let yearConst = updatedTime.slice(6, 10);
            let monthConst = updatedTime.slice(3, 5);
            let daysConst = updatedTime.slice(0, 2);
            updatedTimeValue = yearConst + '-' + monthConst+'-'+daysConst;
        }else{
            updatedTimeValue='';
        }
        if(updatedTimeTo !== ''){
            let yearConst = updatedTimeTo.slice(6, 10);
            let monthConst = updatedTimeTo.slice(3, 5);
            let daysConst = updatedTimeTo.slice(0, 2);
            updatedTimeValueTo = yearConst + '-' + monthConst+'-'+daysConst;
        }else{
            updatedTimeValueTo ='';
        }
        let columnDataObj = this.state.columnDataObj;

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


        let FileNames = {
            "ColumnName": 'FileName',
            "Operator": 'contains',
            "Value1": FileName,
            "Value2": ''
        };
        if(FileName !== '' ) {
            columnDataObj.push(FileNames);
        }

        let EventTypes = {
            "ColumnName": 'EventType',
            "Operator": 'contains',
            "Value1": EventType,
            "Value2": ''
        };
        if(EventType !== '' && EventType !=='Select' ) {
            columnDataObj.push(EventTypes);
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
            "Operator": 'contains',
            "Value1": active,
            "Value2": ''
        };
        if(active !== '' && active !== 'Select' ) {
            columnDataObj.push(activeItem);
        }
        let ResponseSources = {
            "ColumnName": 'ResponseSource',
            "Operator": 'contains',
            "Value1": ResponseSource,
            "Value2": ''
        };
        if(ResponseSource !== '' ) {
            columnDataObj.push(ResponseSources);
        }
        this.setState({
            colObj:columnDataObj
        });
        this.useTokenForEventFileTypeSearch(columnDataObj);
    }
    useTokenForEventFileTypeSearch(obj) {
        let self = this;
        self.setState({
            pendingBrainToken:true
        })
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
                self.setState({
                    pendingBrainToken:false
                })
                self.searchEventTypeFileTypeFromFilter(tokenData,obj);
            }).catch(err => {
                self.setState({
                    loader: false

                });
            })
            let pgsize= 1;
            setTimeout(() => this.loadToken(self.state.pendingBrainToken,pgsize,self.state.pageSize), 5000);
        }
    };
    searchEventTypeFileTypeFromFilter(tokenData, obj){
        let self = this;
        let pagetotal = 1;
        var pageSize=10;
        var aClear;
        if(self.state.pageSize>=0){
            pageSize=self.state.pageSize


                self.state.loader=false
        }
        if(self.state.colObj===[]){
            obj="[]"
        }
        else {
            obj=self.state.colObj;
        }
        if (tokenData !== "") {
            fetch(API.EVENTTYPEFILE_SEARCH + "?pageNumber=" + pagetotal + "&pageSize=" + pageSize, {
                method: "POST", // *GET, POST, PUT, DELETE, etc.
                body: JSON.stringify(obj),
                headers: {
                    'pragma': 'no-cache',
                    "Content-Type": "application/json",
                    "Accept": "text/html",
                    'Authorization': 'Bearer ' + tokenData,
                    'Access-Control-Allow-Origin': '*',
                }
            }).then(function (response) {
                return response.json();
            }).then(function (data) {
                self.setState({
                    pending:false,
                    showModal:false
                })
                clearTimeout(aClear);
                if (data.EventTypeFileList != null) {
                    if(data.EventTypeFileList.length>0) {
                        data.EventTypeFileList.map(item => {
                            item.FileName = item.FileName.toString();
                            item.FileName = [item.FileName, "/" + item.FileName + "/" + item.EventTypeFileId];
                            if (item.InsertedTime !== null) {
                                item.InsertedTime = item.InsertedTime.slice(0, 4) + '-' + item.InsertedTime.slice(5, 7) + '-' + item.InsertedTime.slice(8, 10)+ " " + item.InsertedTime.slice(11, 19);
                            }
                            if (item.UpdatedTime !== null) {
                                item.UpdatedTime = item.UpdatedTime.slice(0, 4) + '-' + item.UpdatedTime.slice(5, 7) + '-' + item.UpdatedTime.slice(8, 10)+ " " + item.UpdatedTime.slice(11, 19);
                            }
                            return null;
                        });
                    }

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
                self.setState({
                    loader: false,
                    EventTypeFileList: data.EventTypeFileList,
                    pending:false
                });
                self.exportToExcelReceiverEventTypeFile(tokenData,self.state,data.TotalRecords);
            })
            let pgSize=1;
            var aClear=setTimeout(() => this.checkin(self.state.pending,pgSize,self.state.pageSize), 10000);
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
            colObj:[]
        })
        this.dataTable.table.state.page=0;
        var instance=null;

        this.initializeToken(vals,instance);
    };

    cancelPage(e) {
        this.setState({
            showNewReceiverEventFilePage :false
        });
    }

    saveReceiverEventFile(){
        let self = this;
        self.closeDialog();
        let fileName = this.inputName.getValue();
        let selection = this.selectBox.getSelection().toString();
        let date = new Date().getDate();
        let month = new Date().getMonth() + 1;
        let year = new Date().getFullYear();
        let jsonData = {
            "FileName": fileName,
            "EventTypeId":selection,
            "IsActive": true,
            "InsertedBy": sessionStorage.getItem('userMail'),
            "InsertedTime": year + '-' + month + '-' + date
        };
        let eventFilesSelected=this.selectBox.state.value;
        self.setState({
            EventTypeFileSel:eventFilesSelected,
            loader:true
        });
        if(fileName=== '') {
            self.setState({
                showWarningDialog: true,
                loader :false
            });
        } else if(selection==='Select') {
            self.setState({
                showWarningDialog: true,
                loader :false
            });
        } else {
            this.setState({
                showWarningDialog: false,
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
                        fetch(API.EVENTTYPEFILE_ADD , {
                            method: "POST",
                            body: JSON.stringify(jsonData),
                            headers: {
                                'pragma': 'no-cache',
                                "Content-Type": "application/json",
                                "Accept": "text/html",
                                'Authorization': 'Bearer ' + tokenData,
                                'Access-Control-Allow-Origin': '*',
                            }
                        }).then(function (response) {
                            if (response.status === 200) {
                                self.setState({
                                    loader:false,
                                    showNewReceiverEventFilePage: false,
                                    showExistsDialog: false,
                                    showDialog: true,
                                    showAddError:false,
                                });
                            }else if(response.status === 409){
                                self.setState({
                                    loader:false,
                                    showNewReceiverEventFilePage: false,
                                    showExistsDialog: true,
                                    showDialog: false,
                                    showAddError:false
                                });
                            }


                        else if(response.status === 500){
                                self.setState({
                                    loader:false,
                                    showNewReceiverEventFilePage: false,
                                    showExistsDialog: false,
                                    showDialog: false,
                                    showAddError:true,
                                    addErrorMsg:response.statusText
                                });
                            }
                        }).then(function (data) {
                        })
                    }
                });
            }
        }
    }
    render() {

        let eventTypeFileArray = [];
        let eventTypeFile=[];
        if(this.state.EventtypefileMultiple) {
            if (this.state.EventtypefileMultiple.length > 0) {
                for (var i = 0; i < this.state.EventtypefileMultiple.length; i++) {
                    let destinationObj = {
                        value: this.state.EventtypefileMultiple[i].EventTypeId,
                        label: this.state.EventtypefileMultiple[i].EventTypeName
                    };
                    eventTypeFileArray.push(destinationObj);
                }

                let eventTypefileSelect={
                    value:"Select",
                    label:"Select"
                }
                eventTypeFileArray.unshift( eventTypefileSelect );

                for (let j = 0; j < this.state.EventtypefileMultiple.length; j++) {
                    let destinationObj = {
                        value: this.state.EventtypefileMultiple[j].EventTypeName,
                        label: this.state.EventtypefileMultiple[j].EventTypeName
                    };
                    eventTypeFile.push(destinationObj);
                }
                let firstValue={
                    value:"Select",
                    label:"Select"
                }
                eventTypeFile.unshift( firstValue );
            }
        }
        let filters = {
            defaultStateOpen: true,
            moreLess: true,
            inputs: [
                {id: 81, label: 'File Name', type: 'text', placeholder: "Enter File Name", isBaseFilter: true},
                {id: 82, label: 'Event Type', type: 'dropdown', placeholder:'Select', options: eventTypeFile, isBaseFilter: true},
                {id: 83, label: "Created From", type: 'date-mon-sun', noDateOption: false, isBaseFilter: true},
                {id: 84, label: "Created To", type: 'date-mon-sun', noDateOption: false, isBaseFilter: true},
                {id: 85, label: 'Created By', type: 'text', placeholder: "Enter Created By", isBaseFilter: false},
                {id: 86, label: 'Updated From', type: 'date-mon-sun', noDateOption: false, isBaseFilter: false},
                {id: 87, label: 'Updated To', type: 'date-mon-sun', noDateOption: false, isBaseFilter: false},
                {id: 88, label: "Update By",type: 'text', placeholder: "Enter Updated By", isBaseFilter: false},
                {id: 89, label: 'Response Source', type: 'text', placeholder: "Enter Response Source", isBaseFilter: false},
                {id: 90, label: 'Active', type: 'dropdown', placeholder:'Select', options: [{label: 'Select', value:'Select'},{label: 'True', value:'true'}, {label: 'False', value:'false'}], isBaseFilter: false}
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
                    this.state.showNewReceiverEventFilePage !== true ?
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
                                            <h1>Event Type File</h1>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <section className="page-container">
                                <div className="grid-wrapper">
                                    <div className="col-100">
                                        <div>
                                            <FilterSection data={filters}
                                                           applyAction={() => this.applyEventTypeFile()}
                                                           clearAction={() => this.clear()}
                                                           ref={(filters) => this.filters = filters}/>
                                        </div>
                                    </div>

                                </div>
                                <ExcelFile filename="receiverEventTypeFile" element={<button type="button" className="button button-blue">Export to Excel</button>}>
                                    <ExcelSheet data={this.state.dataForExport} name="Receiver Event Type File">
                                        <ExcelColumn label="File Name" value="FileName"/>
                                        <ExcelColumn label="Response Source" value="ResponseSource"/>
                                        <ExcelColumn label="Event Type" value="EventType"/>
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
                                                  message={"Event Type File Added Successfully"}
                                                  closeMethod={() => this.closeDialog()}/>
                                    <InPageDialog showDialog={this.state.showExistsDialog} type={"warning"}
                                                  message={" Event Type File Already Exists"}
                                                  closeMethod={() => this.closeDialog()}/>

                                    <InPageDialog showDialog={this.state.showAddError} type={"warning"}
                                                  message={this.state.addErrorMsg}
                                                  closeMethod={() => this.closeDialog()}/>


                                    <br/>
                                </div>
                                <div className="grid-wrapper">
                                    <div className="col-100">
                                        <DataTable
                                            data={this.state.EventTypeFileList}
                                            columns={[
                                                {
                                                    headerClassName: 'data-table header',
                                                    accessor: "FileName",
                                                    isStatus: false,
                                                    isHyperlink: true,
                                                    fieldHeader: 'File Name',
                                                    show: true,
                                                    footer: null
                                                },

                                                {
                                                    headerClassName: 'data-table header',
                                                    accessor: "ResponseSource",
                                                    isStatus: false,
                                                    isLink: false,
                                                    fieldHeader: 'Response Source',
                                                    show: true,
                                                    footer: null
                                                },
                                                {
                                                    headerClassName: 'data-table header',
                                                    accessor: "EventType",
                                                    editable: false,
                                                    isLink: false,
                                                    fieldHeader: 'Event Type',
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
                                                },
                                                {
                                                    headerClassName: 'data-table header',
                                                    accessor: "IsActive",
                                                    editable: false,
                                                    isLink: false,
                                                    fieldHeader: 'Active',
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
                                            fetchData={this.fetchEventFileTypeTable.bind(this)}
                                            tableName={"EventtypefileTypeTable"}
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
                                            <h1>Create New Event File Type</h1>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <section className="page-container">
                                <div className="grid-wrapper">
                                    <div className="button-group">
                                        <button type="button" className="button button-blue" onClick={this.saveReceiverEventFile}>SAVE</button>
                                        <button type="button" className="button button-transparent" onClick={this.cancelPage}>CANCEL</button>&nbsp;&nbsp;
                                    </div>
                                </div>
                                <InPageDialog showDialog={this.state.showWarningDialog} type={"error"}
                                              message={'Mandatory Field cant be left blank'}
                                              closeMethod={() => this.closeDialog()}/>
                                <div className="grid-wrapper">
                                    <div className="col-25">
                                        <TextField disabled={false} readOnly={false} label={"Event Type File  Name"}  state={inputState} required={true} ref={(input) => {this.inputName = input}}/>
                                        {
                                            this.state.errorEventTypeFile === true?
                                                <span className="field-label-incomplete"><i className="fas fa-times-circle text-missing-error"></i>  Event Type File Name is Mandatory Field</span> : null
                                        }
                                    </div>   <div className="col-25">

                                    <div className="form-group"><span className="small-body-text">Event Type Name</span><span
                                        className="required-field"> *</span>
                                        <SelectionDropDownAdvanced
                                            options={eventTypeFileArray}
                                            isDisabled={false}
                                            isSearchable={false}
                                            isMulti={false}
                                            isClearable={false}
                                            onChange={this.onChangeEventTypeFile}
                                            ref={(selectBox) => this.selectBox = selectBox}
                                            defaultValue={this.state.EventTypeFileSel}/>
                                        {
                                            this.state.errorEventTypeName === true?
                                                <span className="field-label-incomplete"><i className="fas fa-times-circle text-missing-error"></i>  Event Type Name is Mandatory Field</span> : null
                                        }
                                    </div>
                                </div>



                                </div>
                            </section>
                        </div>
                }
            </div>
        )
    }
}
export default ReceiverEventTypeFile;