import React, {Component} from 'react';
import Loader from '../Common/Loader';
import {FilterSection, InPageDialog, TextField} from 'damco-components';
import {DataTable} from 'damco-components';
import API from "../../../Constants/API-config";
import {Environment} from "../../../Constants/Environment";
import ReactExport from "react-export-excel";

class DestinationType extends Component {
    constructor(props) {
        super(props);
        let tableActions = {
            primaryActionIsMoreBtn: false,
            primaryActionLabel: "Add New Destination Type",
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
            pageSize:0
        }
        this.cancelPage = this.cancelPage.bind(this);
        this.saveReceiverDestination = this.saveReceiverDestination.bind(this);
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
    exportToExcelReceiverDestination(tokenData,state,datalength) {
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
        fetch(API.DESTINATION_SEARCH + "?pageNumber=" + pagetotal + "&pageSize=" + datalength, {
            method: "POST",
            body: JSON.stringify(obj),
            headers: headers,
            signal: signal
        }).then(function (response) {
            return response.json();
        }).then(function (data) {
            const results = data.DestinationTypeList.map((_arrayElement) => Object.assign({}, _arrayElement));
            self.setState({
                dataForExport: results
            })
        });
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
            });
        }
    };
    closeDialog() {
        this.setState({
            loader: false,
            showExistsDialog: false,
            showDialog: false,
            showWarningDialog: false
        })
    }
    searchDestinationType(tokenData, state, instance) {
        let self = this;
        let pagetotal = state.page + 1;
        let jsonObj;
        self.setState({
            pageSize:state.pageSize,
            SearchPageSize:state.pageSize
        })
        if(self.state.colObj === []){
            jsonObj = "[]";
        } else {
            jsonObj = self.state.colObj;
        }
        if (tokenData !== "") {
            fetch(API.DESTINATION_SEARCH + "?pageNumber=" + pagetotal + "&pageSize=" + state.pageSize,{
                method: "POST",
                body:JSON.stringify(jsonObj),
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

                if (data.DestinationTypeList != null) {
                    data.DestinationTypeList.map(item => {
                        item.DestinationTypeName = item.DestinationTypeName.toString();
                        item.DestinationTypeName = [item.DestinationTypeName, "/DestinationType/" + item.DestinationTypeId];
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
                if(data.DestinationTypeList !== null) {
                    self.setState({
                        loader: false,
                        destinationTableContent: data.DestinationTypeList,
                    });
                }
                self.exportToExcelReceiverDestination(tokenData,state,data.TotalRecords);
            })
        }
    }

    applyDestinationType() {
        this.setState({
            loader:true,
            columnDataObj : [],
            showNewReceiverDestinationPage: false,
            showExistsDialog: false,
            showDialog: false,
        });

        let destinationTypeFilterValues = this.filters.getFilterValues();
        this.dataTable.table.state.page=0;
        let destinationTypeName = '';
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
        if(destinationTypeFilterValues.length <= 4) {
            destinationTypeName = destinationTypeFilterValues[0].value;
            active = destinationTypeFilterValues[1].value;
            insertedTime = destinationTypeFilterValues[2].value;
            insertedTimeTo = destinationTypeFilterValues[3].value;
        } else {
            destinationTypeName = destinationTypeFilterValues[0].value;
            insertedBy = destinationTypeFilterValues[2].value;
            updatedBy = destinationTypeFilterValues[3].value;
            active = destinationTypeFilterValues[1].value;
            insertedTime = destinationTypeFilterValues[4].value;
            insertedTimeTo = destinationTypeFilterValues[5].value;
            updatedTime = destinationTypeFilterValues[6].value;
            updatedTimeTo = destinationTypeFilterValues[7].value;
        }
        if(insertedTime !== ''){
            let yearConst = insertedTime.slice(6, 10);
            let monthConst = insertedTime.slice(3, 5);
            let daysConst = insertedTime.slice(0, 2);
            insertedTimeValue = yearConst + '-' + monthConst+'-'+daysConst;
        }else{
            insertedTimeValue ='';
        }
        if(insertedTimeTo !== ''){
            let yearConst = insertedTimeTo.slice(6, 10);
            let monthConst = insertedTimeTo.slice(3, 5);
            let daysConst = insertedTimeTo.slice(0, 2);
            insertedTimeValueTo = yearConst + '-' + monthConst+'-'+daysConst;
        }else{
            insertedTimeValueTo ='';
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
        let destinationTypeNameItem = {
            "ColumnName": 'DestinationTypeName',
            "Operator": 'contains',
            "Value1": destinationTypeName,
            "Value2": ''
        };
        if(destinationTypeName !== '' ) {
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
        if(active !== null && active !=='Select') {
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
            fetch(API.DESTINATION_SEARCH + "?pageNumber=" + pagetotal + "&pageSize=" + pageSize, {
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
                if (data.DestinationTypeList != null) {
                    data.DestinationTypeList.map(item => {
                        item.DestinationTypeName = item.DestinationTypeName.toString();
                        item.DestinationTypeName = [item.DestinationTypeName, "/DestinationType/" + item.DestinationTypeId];
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
                self.setState({
                    loader: false,
                    destinationTableContent: data.DestinationTypeList
                });
                self.exportToExcelReceiverDestination(tokenData,self.state,data.TotalRecords);
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
        this.dataTable.table.state.page=0;
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
        let destinationName = this.inputName.getValue();
        let date = new Date().getDate();
        let month = new Date().getMonth() + 1;
        let year = new Date().getFullYear();
        let jsonData = {
            "DestinationTypeName": destinationName,
            "IsActive": true,
            "InsertedBy":  sessionStorage.getItem('userMail'),
            "UpdatedBy": sessionStorage.getItem('userMail'),
            "InsertedTime": year + '-' + month + '-' + date,
            "UpdatedTime": year + '-' + month + '-' + date
        };
        if(destinationName=== '' ) {
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
                        fetch(API.DESTINATION_ADD , {
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
                                    showDialog: true,

                                });
                            }else if(response.status === 409 || response.status === 500){
                                self.setState({
                                    loader:false,
                                    showNewReceiverDestinationPage: false,
                                    showExistsDialog: true,
                                    showDialog: false,
                                    warningMsg:response.statusText

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

        let filters = {
            defaultStateOpen: true,
            moreLess: true,
            inputs: [
                {id: 41, label: 'Destination Type Name', type: 'text', placeholder: "Enter Destination Type Name ", isBaseFilter: true},
                {id: 42, label: 'Active', type: 'dropdown', placeholder:'Select', options: [{label: 'Select', value:'Select'},{label: 'True', value:'true'}, {label: 'False', value:'false'}], isBaseFilter: true},
                {id: 43, label: "Created From", type: 'date-mon-sun', noDateOption: false, isBaseFilter: true},
                {id: 44, label: "Created To", type: 'date-mon-sun', noDateOption: false, isBaseFilter: true},
                {id: 45, label: 'Created By', type: 'text', placeholder: "Enter Created By", isBaseFilter: false},
                {id: 46, label: 'Updated From ', type: 'date-mon-sun', noDateOption: false, isBaseFilter: false},
                {id: 47, label: 'Updated To ', type: 'date-mon-sun', noDateOption: false, isBaseFilter: false},
                {id: 48, label: "Update By",type: 'text', placeholder: "Enter Updated By", isBaseFilter: false}
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
                                            <h1>Destination Type</h1>
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
                                <ExcelFile filename="destinationType" element={<button type="button" className="button button-blue">Export to Excel</button>}>
                                    <ExcelSheet data={this.state.dataForExport} name="Receiver Destination Type">
                                        <ExcelColumn label="File Name" value="DestinationTypeName"/>
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
                                                  message={"Destination Type Added Successfully"}
                                                  closeMethod={() => this.closeDialog()}/>
                                    <InPageDialog showDialog={this.state.showExistsDialog} type={"warning"}
                                                  message={this.state.warningMsg}
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
                                                    accessor: "DestinationTypeName",
                                                    isStatus: false,
                                                    isHyperlink: true,
                                                    fieldHeader: 'Destination Type Name',
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
                                            <h1>Create New Destination Type</h1>
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
                                              closeMethod={() => this.closeDialog()}/>
                                <div className="grid-wrapper">
                                    <div className="col-25">
                                        <TextField disabled={false} readOnly={false} label={"Destination Type Name"}  state={inputState} required={true} ref={(input) => {this.inputName = input}}/>
                                    </div>

                                </div>
                            </section>
                        </div>
                }

            </div>
        )
    }
}
export default DestinationType;