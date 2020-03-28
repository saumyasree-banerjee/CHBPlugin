import React, {Component} from 'react';
import Loader from '../Common/Loader';
import {FilterSection, InPageDialog, TextField} from 'damco-components';
import {DataTable, SelectionDropDownAdvanced} from 'damco-components';
import API from "../../../Constants/API-config";



class Source extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loader: false,
            columns: [],
            clicking: true,
            pageNumber: 1,
            columnDataObj: [],
            colObj: [],
            SearchPageSize: 10,
            showNewReceiverDestinationPage:false,
            warningMsg: '',
            showWarningDialog: false,
            showTechErrorDialog: false,
            eventType: ''
        }
        this.cancelPage = this.cancelPage.bind(this);
        this.saveReceiverDestination = this.saveReceiverDestination.bind(this);
        this.fetchEventType = this.fetchEventType.bind(this);
    }
    addReceiverDestination = () => {
        this.setState({
            showNewReceiverDestinationPage: true});
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
                self.fetchEventType(tokenData);
            });
        }
    };
    fetchEventType(tokenData) {
        const self = this;
        if (tokenData !== "") {
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
                // console.log(data);
                self.setState({
                    eventType :data
                });
            });
        }
    }
    searchDestinationType(tokenData, state, instance) {
        let self = this;
        let pagetotal = state.page + 1;
        let jsonObj;
        if(self.state.colObj === []){
            jsonObj = "[]";
        } else {
            jsonObj = self.state.colObj;
        }
        if (tokenData !== "") {
            fetch(API.RESPONSE_FILE_INFO_SEARCH + "?pageNumber=" + pagetotal + "&pageSize=" + state.pageSize,{
                method: "POST",
                body: jsonObj,
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

                if (data.ResponseFileInfoList !== null) {
                    data.ResponseFileInfoList.map(item => {
                        item.FileName = item.FileName.toString();
                        item.FileName = [item.FileName, "/ReceiverFileDetails/" + item.ResponseFileInfoId];
                        item.logDetails = ["Audit Details", "/ReceiverFileLogDetails/" + item.ResponseFileInfoId ];
                        if(item.InsertedTime !== null) {
                            item.InsertedTime = item.InsertedTime.slice(0, 4) + '-' + item.InsertedTime.slice(5, 7) + '-' + item.InsertedTime.slice(8, 10);
                        }
                        if(item.ReceivedTime !== null) {
                            item.ReceivedTime = item.ReceivedTime.slice(0, 4) + '-' + item.ReceivedTime.slice(5, 7) + '-' + item.ReceivedTime.slice(8, 10);
                        }
                        if(item.UpdatedTime !== null) {
                            item.UpdatedTime = item.UpdatedTime.slice(0, 4) + '-' + item.UpdatedTime.slice(5, 7) + '-' + item.UpdatedTime.slice(8, 10);
                        }
                        return null;
                    });
                }
                let record = data.TotalRecords % 10;
                if (record === 0) {
                    let pagenum = (data.TotalRecords) / 10;
                    self.setState({
                        pageNumber: pagenum
                    })
                } else {
                    let remain = data.TotalRecords % 10
                    self.setState({
                        pageNumber: (((data.TotalRecords) - remain) / 10) + 1
                    })
                }
                if(data.ResponseFileInfoList !== null) {
                    self.setState({
                        loader: false,
                        responseFileInfoTableContent: data.ResponseFileInfoList,
                    });
                }
            })
        }
    }

    applyReceiverFileDetails() {
        this.setState({
            loader:true,
            columnDataObj : []
        });
        let receiverFileFilterValues = this.filters.getFilterValues();
        console.log(receiverFileFilterValues);
        let customerCode = '';
        let customerName = '';
        let jobNumber = '';
        let fileName = '';
        let active = null;
        let insertedBy = '';
        let updatedBy = '';
        let receivedTime = '';
        let insertedTime = '';
        let updatedTime = '';
        let insertedTimeValue = '';
        let updatedTimeValue = '';
        let receivedTimeValue = '';
        let overallStatus = null;
        if(receiverFileFilterValues.length <= 4) {
            customerCode = receiverFileFilterValues[1].value;
            customerName = receiverFileFilterValues[2].value;
            jobNumber = receiverFileFilterValues[3].value;
            fileName = receiverFileFilterValues[0].value;
        } else {
            customerCode = receiverFileFilterValues[1].value;
            customerName = receiverFileFilterValues[2].value;
            jobNumber = receiverFileFilterValues[3].value;
            fileName = receiverFileFilterValues[0].value;
            insertedBy = receiverFileFilterValues[4].value;
            updatedBy = receiverFileFilterValues[5].value;
            active = receiverFileFilterValues[6].value;
            receivedTime = receiverFileFilterValues[8].value;
            insertedTime = receiverFileFilterValues[9].value;
            updatedTime = receiverFileFilterValues[10].value;
            overallStatus = receiverFileFilterValues[7].value;
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
        if(receivedTime !== ''){
            let yearConst = receivedTime.slice(6, 10);
            let monthConst = receivedTime.slice(3, 5);
            let daysConst = receivedTime.slice(0, 2);
            receivedTimeValue = yearConst + '-' + monthConst+'-'+daysConst;
        }else{
            receivedTimeValue='';
        }
        let columnDataObj = this.state.columnDataObj;
        let overallStatueItem = {
            "ColumnName": 'OverallStatus',
            "Operator": 'equal',
            "Value1": overallStatus,
            "Value2": ''
        };
        if(overallStatus !== null ) {
            columnDataObj.push(overallStatueItem);
        }
        let updatedTimeValueItem = {
            "ColumnName": 'UpdatedTime',
            "Operator": 'greaterthanequal',
            "Value1": updatedTimeValue,
            "Value2": ''
        };
        if(updatedTimeValue !== '' ) {
            columnDataObj.push(updatedTimeValueItem);
        }
        let receivedTimeValueItem = {
            "ColumnName": 'ReceivedTime',
            "Operator": 'greaterthanequal',
            "Value1": receivedTimeValue,
            "Value2": ''
        };
        if(receivedTimeValue !== '' ) {
            columnDataObj.push(receivedTimeValueItem);
        }
        let insertedTimeValueItem = {
            "ColumnName": 'InsertedTime',
            "Operator": 'greaterthanequal',
            "Value1": insertedTimeValue,
            "Value2": ''
        };
        if(insertedTimeValue !== '' ) {
            columnDataObj.push(insertedTimeValueItem);
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
        let customerNameItem = {
            "ColumnName": 'CustomerName',
            "Operator": 'contains',
            "Value1": customerName,
            "Value2": ''
        };
        if(customerName !== '' ) {
            columnDataObj.push(customerNameItem);
        }
        let jobNumberItem = {
            "ColumnName": 'JobNumber',
            "Operator": 'contains',
            "Value1": jobNumber,
            "Value2": ''
        };
        if(jobNumber !== '' ) {
            columnDataObj.push(jobNumberItem);
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
        if(active !== null ) {
            columnDataObj.push(activeItem);
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
        let pageSize=10;
        if(self.state.colObj===[]){
            obj="[]"
        }
        else {
            obj=self.state.colObj;
        }
        if (tokenData !== "") {
            fetch(API.RESPONSE_FILE_INFO_SEARCH + "?pageNumber=" + pagetotal + "&pageSize=" + pageSize, {
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
                if (data.ResponseFileInfoList !== null) {
                    data.ResponseFileInfoList.map(item => {
                        item.FileName = item.FileName.toString();
                        item.FileName = [item.FileName, "/ReceiverFileDetails/" + item.ResponseFileInfoId];
                        item.logDetails = ["Audit Details", "/ReceiverFileLogDetails/" + item.ResponseFileInfoId ];
                        if(item.InsertedTime !== null) {
                            item.InsertedTime = item.InsertedTime.slice(0, 4) + '-' + item.InsertedTime.slice(5, 7) + '-' + item.InsertedTime.slice(8, 10);
                        }
                        if(item.ReceivedTime !== null) {
                            item.ReceivedTime = item.ReceivedTime.slice(0, 4) + '-' + item.ReceivedTime.slice(5, 7) + '-' + item.ReceivedTime.slice(8, 10);
                        }
                        if(item.UpdatedTime !== null) {
                            item.UpdatedTime = item.UpdatedTime.slice(0, 4) + '-' + item.UpdatedTime.slice(5, 7) + '-' + item.UpdatedTime.slice(8, 10);
                        }
                        return null;
                    });
                }
                let record = data.TotalRecords % 10;
                if (record === 0) {
                    let pagenum = (data.TotalRecords) / 10;
                    self.setState({
                        pageNumber: pagenum
                    })
                } else {
                    let remain = data.TotalRecords % 10
                    self.setState({
                        pageNumber: (((data.TotalRecords) - remain) / 10) + 1
                    })
                }
                self.setState({
                    loader: false,
                    responseFileInfoTableContent: data.ResponseFileInfoList
                });
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
            colObj:[]
        })
        var instance=null;

        this.initializeToken(vals,instance);
    };

    cancelPage(e) {
        this.setState({
            showNewReceiverDestinationPage :false
        });
    }

    saveReceiverDestination(){
        let self = this;
        let receiverSourceName = this.inputSourceName.getValue();
        let receiverEventName = this.eventTypeSelect.getSelection();
        let date = new Date().getDate();
        let month = new Date().getMonth() + 1;
        let year = new Date().getFullYear();
        let jsonData = {
            "ResponseSourceName": receiverSourceName,
            "EventTypeId":receiverEventName,
            "IsActive": true,
            "InsertedBy":  sessionStorage.getItem('userMail'),
            "UpdatedBy": sessionStorage.getItem('userMail'),
            "InsertedTime": year + '-' + month + '-' + date,
            "UpdatedTime": year + '-' + month + '-' + date
        };
        if(receiverSourceName=== '' ) {
            self.setState({
                warningMsg: 'Please Enter Receiver Source Name',
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
                        fetch(API.RECEIVER_SOURCE_ADD , {
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
                                    showNewReceiverDestinationPage: false,
                                    showExistsDialog: false,
                                    showDialog: true
                                });
                            }else if(response.status === 500){
                                self.setState({
                                    loader:false,
                                    showNewReceiverDestinationPage: false,
                                    showTechErrorDialog: true,
                                    showDialog: false
                                });
                            }else if(response.status === 409){
                                self.setState({
                                    loader:false,
                                    showNewReceiverDestinationPage: false,
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
    render() {
        let eventTypeFilterArray = [];
        if(this.state.eventType.length > 0){
            for(let i = 0; i< this.state.eventType.length; i++) {
                let eventTypeObj = {value: this.state.eventType[i].EventTypeName, label: this.state.eventType[i].EventTypeName};
                eventTypeFilterArray.push(eventTypeObj);
            }
        }
        let filters = {
            defaultStateOpen: true,
            moreLess: true,
            inputs: [
                {id: 1, label: 'File Name', type: 'text', placeholder: "Enter File Name", isBaseFilter: true},
                {id: 2, label: 'Customer Code', type: 'text', placeholder: "Enter Customer Code", isBaseFilter: true},
                {id: 3, label: 'Customer Name', type: 'text', placeholder: "Enter Customer Name", isBaseFilter: true},
                {id: 4, label: 'Job Number', type: 'text', placeholder: "Enter Job Number", isBaseFilter: true},
                {id: 5, label: 'Active', type: 'advanced-dropdown', options: [{label: 'true', value:'true'}, {label: 'false', value:'false'}], isBaseFilter: false},
                {id: 6, label: "Received Time", type: 'date-mon-sun', noDateOption: false, isBaseFilter: false},
                {id: 7, label: "Inserted Time", type: 'date-mon-sun', noDateOption: false, isBaseFilter: false},
                {id: 8, label: 'Inserted By', type: 'text', placeholder: "Enter inserted by", isBaseFilter: false},
                {id: 9, label: 'Updated Time ', type: 'date-mon-sun', noDateOption: false, isBaseFilter: false},
                {id: 10, label: "Update By",type: 'text', placeholder: "Enter updated by", isBaseFilter: false},
                {id: 11, label: "Overall Status",type: 'advanced-dropdown', options: [{label: 'Success', value:'Success'}, {label: 'Fail', value:'Fail'}],  isBaseFilter: false}
            ]
        };
        let inputState = {
            warningInputText: "Warning text",
            errorInputText: "Error text",
            warning: false,
            error: false,
            complete: false
        };
        let eventTypeArray = [];
        if(this.state.eventType.length > 0){
            for(let i = 0; i< this.state.eventType.length; i++) {
                let eventTypeObj = {value: this.state.eventType[i].EventTypeId, label: this.state.eventType[i].EventTypeName};
                eventTypeArray.push(eventTypeObj);
            }
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
                                            <h1>Receiver Files</h1>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <section className="page-container">
                                <div className="grid-wrapper">
                                    <div className="col-100">
                                        <div>
                                            <FilterSection data={filters}
                                                           applyAction={() => this.applyReceiverFileDetails()}
                                                           clearAction={() => this.clear()}
                                                           ref={(filters) => this.filters = filters}/>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <br/>
                                    <InPageDialog showDialog={this.state.showDialog} type={"success"}
                                                  message={"Receiver Source added successfully"}
                                                  closeMethod={() => this.closeDialog()}/>
                                    <InPageDialog showDialog={this.state.showExistsDialog} type={"warning"}
                                                  message={"Record already exists"}
                                                  closeMethod={() => this.closeDialog()}/>
                                    <InPageDialog showDialog={this.state.showTechErrorDialog} type={"warning"}
                                                  message={"Technical Problem"}
                                                  closeMethod={() => this.closeDialog()}/>


                                    <br/>
                                </div>
                                <div className="grid-wrapper">
                                    <div className="col-100">
                                        <DataTable
                                            data={this.state.responseFileInfoTableContent}
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
                                                    accessor: "CustomerCode",
                                                    isStatus: false,
                                                    isLink: false,
                                                    fieldHeader: 'Customer Code',
                                                    show: true,
                                                    footer: null
                                                },
                                                {
                                                    headerClassName: 'data-table header',
                                                    accessor: "CustomerName",
                                                    isStatus: false,
                                                    isLink: false,
                                                    fieldHeader: 'Customer Name',
                                                    show: true,
                                                    footer: null
                                                },
                                                {
                                                    headerClassName: 'data-table header',
                                                    accessor: "JobNumber",
                                                    isStatus: false,
                                                    isLink: false,
                                                    fieldHeader: 'Job Number',
                                                    show: true,
                                                    footer: null
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
                                                    accessor: "ReceivedTime",
                                                    editable: false,
                                                    isLink: false,
                                                    fieldHeader: 'Received Time',
                                                    show: true
                                                },
                                                {
                                                    headerClassName: 'data-table header',
                                                    accessor: "InsertedBy",
                                                    editable: false,
                                                    isLink: false,
                                                    fieldHeader: 'Inserted By',
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
                                                    accessor: "InsertedTime",
                                                    editable: false,
                                                    isLink: false,
                                                    fieldHeader: 'Inserted Time',
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
                                                    accessor: "logDetails",
                                                    isStatus: false,
                                                    isLink: true,
                                                    fieldHeader: 'Log Details',
                                                    show: true
                                                },
                                                {
                                                    headerClassName: 'data-table header',
                                                    accessor: "OverallStatus",
                                                    isStatus: false,
                                                    isLink: false,
                                                    fieldHeader: 'Overall Status',
                                                    show: true,
                                                    footer: null
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
                                            <h1>Create New Receiver Source</h1>
                                        </li>
                                    </ul>
                                </div>
                            </div>


                                <section className="page-container">
                                    <div className="grid-wrapper">
                                        <div className="button-group">
                                            <button type="button" className="button button-blue"
                                                    onClick={this.saveReceiverDestination}>SAVE
                                            </button>
                                            <button type="button" className="button button-transparent"
                                                    onClick={this.cancelPage}>CANCEL
                                            </button>
                                            &nbsp;&nbsp;
                                        </div>
                                    </div>
                                    <InPageDialog showDialog={this.state.showWarningDialog} type={"warning"}
                                                  message={this.state.warningMsg}
                                                  closeMethod={() => this.closeWarningDialog()}/>
                                    <div className="grid-wrapper">
                                        <div className="col-25">
                                            <TextField disabled={false} readOnly={false} label={"Receiver Source Name"}
                                                       state={inputState} required={false} ref={(input) => {
                                                this.inputSourceName = input
                                            }}/>
                                        </div>
                                        <div className="col-25">
                                            <label>Event Type Name</label>
                                            <SelectionDropDownAdvanced options={eventTypeArray}
                                                                       isClearable={false}
                                                                       isDisabled={false}
                                                                       isSearchable={false}
                                                                       isMulti={false}
                                                                       ref={(selectBox) => this.eventTypeSelect = selectBox}
                                                                       defaultValue={eventTypeArray[0]}
                                            />
                                        </div>

                                    </div>
                                </section>

                        </div>
                }
            </div>
        )
    }
}
export default Source;