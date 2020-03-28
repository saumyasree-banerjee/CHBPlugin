import React, {Component} from 'react';
import Loader from '../Common/Loader';
import {FilterSection, ModalMain} from 'damco-components';
import {DataTable} from 'damco-components';
import API from "../../../Constants/API-config";
import {TextField} from 'damco-components';
import {InPageDialog} from 'damco-components';
import {Environment} from "../../../Constants/Environment";
import ReactExport from "react-export-excel";

class PlatformSection extends Component {
    constructor(props) {
        super(props);
        let tableActions = {
            primaryActionIsMoreBtn: false,
            primaryActionLabel: "Add New Platform",
            primaryAction: () => this.addPlatform(),

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
            showDialog: false,
            showExistsDialog: false,
            loader: false,
            showAddPlatformError: false,
            modalerrorMSG: "Unexpected error occured! Please try after some time.",
            loaderupload: false,
            hideuccessState: false,
            showNewPlatformPage: false,
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
            platformTableContent: [],
            columns: [],
            clicking: true,
            pageNumber: 1,
            actions:tableActions,
            columnDataObj:[],
            colObj:[],
            pageSize:0,
            dataForExport: null,
            SearchPageSize: 10,
            showPlatfromErrorDialog:false,
            ErroMsges:"",
            pending:true,
            existingPageSize:0,
            showMandatoryField: false,
            showErrorExportDialog: false,
            callExportExcel:true

        }
        this.savePlatform = this.savePlatform.bind(this);
        this.cancelPage = this.cancelPage.bind(this);
        this.invalidExport = this.invalidExport.bind(this);
    }
    addPlatform = () => {
        this.setState({
            showNewPlatformPage: true});
    }
    invalidExport(){
        let self = this;
        self.setState({
            showErrorExportDialog:true
        })
    }
    closeDialog(){
        this.setState({
            showDialog:false,
            showExistsDialog: false,
            showPlatfromErrorDialog:false,
            showMandatoryField: false,
            showErrorExportDialog: false
        })
    }
    showAddPlatformError(){
        this.setState({
            showAddPlatformError: true
        })
    }
    hideModal(){
        this.setState({
            showAddPlatformError: false
        })
    }
    componentWillMount = () => {
        this.setState({loader: true,});
    }

    componentDidMount = () => {
        // let self = this;
        //this.loadPlatformData();
    }

    componentWillUnmount = () => {
        clearTimeout(this.fetchDataTimeOut);
        clearInterval(this.fetchDataInterval);
    }

    signOut = () => {
        this.props.signOut();
    }
    exportToExcelPlatformTable(tokenData,state,datalength) {
        let self = this;
        this.setState({
            showCIErrorDialog:false
        });

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
        fetch(API.PLATFORM_SEARCH + "?pageNumber=" + pagetotal + "&pageSize=" + datalength, {
            method: "POST",
            body: JSON.stringify(obj),
            headers: headers,
            signal: signal
        }).then(function (response) {
            return response.json();
        }).then(function (data) {
            const results = data.PluginPlatformFiles.map((_arrayElement) => Object.assign({}, _arrayElement));
            self.setState({
                dataForExport: results
            })
        });
    }
    checkin(pending,pgSize,pageSize,controller){
        if(pending=== true){
            console.log("Pending state")
            controller.abort()
            this.setState({
                pending:false,
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



        };
        self.setState({
            loader:true,
            pending:true,
            callExportExcel:true,
            showModal:false,
            showErrorExportDialog:false,



        });
        const instance = null;
        this.initializeToken(vals, instance);
      //  this.loadIdentifiedTableData(vals,instance);
    }

    fetchPlatformData(state, instance) {
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
                self.searchPlatformService(tokenData, state, instance);
            });
        }
    };
    searchPlatformService(tokenData, state, instance) {
        let self = this;
        let pagetotal = state.page + 1;
        let jsonObj;
        var a;
        self.setState({
            SearchPageSize:state.pageSize,
            pageSize:state.pageSize,
            loader:true,
            pending:true,
            showErrorExportDialog: false
        })
        if(self.state.colObj === []){
            jsonObj = "[]";
        } else {
            jsonObj = self.state.colObj;
        }
        if (tokenData !== "") {
            let headers=Environment.headerValues;
            headers.Authorization='Bearer ' + tokenData;

            let controller = new AbortController();
            let signal = controller.signal;
            fetch(API.PLATFORM_SEARCH + "?pageNumber=" + pagetotal + "&pageSize=" + state.pageSize,{
                method: "POST",
                body: JSON.stringify(jsonObj),
                headers: headers,
                signal:signal
            }).then(function (response) {
                return response.json();
            }).then(function (data) {
                clearTimeout(a)
                let dataLength = data.TotalRecords;
                if (data.PluginPlatformFiles !== null) {
                    self.setState({
                        loader:false,
                        pending:false

                    })
                    data.PluginPlatformFiles.map(item => {
                        item.PlatformName = item.PlatformName.toString();
                        item.PlatformName = [item.PlatformName, "/Platform/" + item.ID];
                        if(item.AddedDatetime!== null && item.AddedDatetime !=='') {
                            item.AddedDatetime = item.AddedDatetime.slice(0, 4) + '-' + item.AddedDatetime.slice(5, 7) + '-' + item.AddedDatetime.slice(8, 10) + ' ' + item.AddedDatetime.slice(11, 19);
                        }
                        if(item.UpdatedDatetime!== null && item.UpdatedDatetime !=='') {

                            item.UpdatedDatetime = item.UpdatedDatetime.slice(0, 4) + '-' + item.UpdatedDatetime.slice(5, 7) + '-' + item.UpdatedDatetime.slice(8, 10) + ' ' + item.UpdatedDatetime.slice(11, 19);
                        }
                        return null;
                    });
                }else{
                    self.setState({
                        loader: false
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
                if(data.PluginPlatformFiles !== null) {
                    self.setState({
                        loader: false,
                        platformTableContent: data.PluginPlatformFiles,
                    });
                }
                console.log(Environment);

                if(dataLength <= Environment.defaultDownloadExcelLimit) {
                    if (self.state.callExportExcel === true) {

                        self.exportToExcelPlatformTable(tokenData, state, dataLength);
                    }

                }

            })

               // controller.abort();
            let pgsize=state.page + 1
             a=setTimeout(() => this.checkin(self.state.pending,pgsize,state.pageSize,controller), 10000);
        }
    }
    apply(){
        let platformFilterValues = this.filters.getFilterValues();
        this.closeDialog();
        this.setState({loader: true,showExistsDialog: false,
            showDialog: false,
            dataForExport:null,
            showErrorExportDialog: false});

        this.dataTable.table.state.page=0;
        let platformName = '';
        let platformCode = '';
        let active = '';
        let addedDateTime = '';
        let updatedDateTime = '';
        let addedDateTimeTo = '';
        let updatedDateTimeTo = '';
        let addedBy = '';
        let updateBy = '';
        let addDateTimeValue = '';
        let updatedDateTimeValue = '';
        let addDateTimeValueTo = '';
        let updatedDateTimeValueTo = '';
        if(platformFilterValues.length <= 4) {
            platformName = platformFilterValues[0].value;
            platformCode = platformFilterValues[1].value;
            active = platformFilterValues[2].value;
            addedDateTime = platformFilterValues[3].value;
        } else {
            platformName = platformFilterValues[0].value;
            platformCode = platformFilterValues[1].value;
            active = platformFilterValues[2].value;
            addedBy = platformFilterValues[3].value;
            updateBy = platformFilterValues[4].value;
            addedDateTime = platformFilterValues[5].value;
            addedDateTimeTo = platformFilterValues[6].value;
            updatedDateTime = platformFilterValues[7].value;
            updatedDateTimeTo = platformFilterValues[8].value;
        }
        if(addedDateTime !== ''){
            let yearConst = addedDateTime.slice(6, 10);
            let monthConst = addedDateTime.slice(3, 5);
            let daysConst = addedDateTime.slice(0, 2);
            addDateTimeValue = yearConst + '-' + monthConst+'-'+daysConst;
        }else{
            addDateTimeValue='';
        }
        if(addedDateTimeTo !== ''){
            let yearConst = addedDateTimeTo.slice(6, 10);
            let monthConst = addedDateTimeTo.slice(3, 5);
            let daysConst = addedDateTimeTo.slice(0, 2);
            addDateTimeValueTo = yearConst + '-' + monthConst+'-'+daysConst;
        }else{
            addDateTimeValueTo='';
        }
        if(updatedDateTime !== ''){
            let yearConst = updatedDateTime.slice(6, 10);
            let monthConst = updatedDateTime.slice(3, 5);
            let daysConst = updatedDateTime.slice(0, 2);
            updatedDateTimeValue = yearConst + '-' + monthConst+'-'+daysConst;
        }else{
            updatedDateTimeValue ='';
        }
        if(updatedDateTimeTo !== ''){
            let yearConst = updatedDateTimeTo.slice(6, 10);
            let monthConst = updatedDateTimeTo.slice(3, 5);
            let daysConst = updatedDateTimeTo.slice(0, 2);
            updatedDateTimeValueTo = yearConst + '-' + monthConst+'-'+daysConst;
        }else{
            updatedDateTimeValueTo ='';
        }
        this.setState({
            columnDataObj : []
        });
        let columnDataObj = this.state.columnDataObj;
        let platformNameItem = {
            "ColumnName": 'PlatformName',
            "Operator": 'contains',
            "Value1": platformName,
            "Value2": ''
        };
        if(platformName !== '' ) {
            columnDataObj.push(platformNameItem);
        }
        let platformCodeItem = {
            "ColumnName": 'Platformcode',
            "Operator": 'contains',
            "Value1": platformCode,
            "Value2": ''
        };
        if(platformCode !== '' ) {
            columnDataObj.push(platformCodeItem);
        }
        let activeItem = {
            "ColumnName": 'IsActive',
            "Operator": 'contains',
            "Value1": active,
            "Value2": ''
        };
        if(active !== '' ) {
            columnDataObj.push(activeItem);
        }
        let addedByItem = {
            "ColumnName": 'AddedBy',
            "Operator": 'contains',
            "Value1": addedBy,
            "Value2": ''
        };
        if(addedBy !== '' ) {
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
            "ColumnName": 'AddedDatetime',
            "Operator": 'range',
            "Value1": addDateTimeValue,
            "Value2": addDateTimeValueTo
        };
        if(addDateTimeValue !== '' ) {
            columnDataObj.push(addedDateTimeItem);
        }
        let updatedDateTimeItem = {
            "ColumnName": 'UpdatedDatetime',
            "Operator": 'range',
            "Value1": updatedDateTimeValue,
            "Value2": updatedDateTimeValueTo
        };
        if(updatedDateTimeValue !== '' ) {
            columnDataObj.push(updatedDateTimeItem);
        }
        this.setState({
            colObj:columnDataObj,
            loader:true
        });
        this.useTokenForPlatformSearch(columnDataObj);
    }
    useTokenForPlatformSearch(obj) {
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
                self.searchPlatform(tokenData,obj);
            });
        }
    };
    searchPlatform(tokenData, obj){

        let self = this;
        let pagetotal = 1;
        var pageSize=10;
        var a;
        self.setState({
            loader:false,
            pending:true
        })
        if(self.state.pageSize>=0){
            pageSize=self.state.pageSize;
        }
        if(self.state.colObj===[]){
            obj="[]"
        }
        else {
            obj=self.state.colObj;
        }
        if (tokenData !== "") {
            self.setState({
                loader:false
            })
            let headers=Environment.headerValues;
            headers.Authorization='Bearer ' + tokenData;

            let controller = new AbortController();
            let signal = controller.signal;
            fetch(API.PLATFORM_SEARCH + "?pageNumber=" + pagetotal + "&pageSize=" + pageSize, {
                method: "POST", // *GET, POST, PUT, DELETE, etc.
                body: JSON.stringify(obj),
                headers: headers,
                signal:signal
            }).then(function (response) {
                return response.json();
            }).then(function (data) {
                clearTimeout(a)
                let dataLength = data.TotalRecords;
                if (data.PluginPlatformFiles != null) {
                    data.PluginPlatformFiles.map(item => {
                        item.PlatformName = item.PlatformName.toString();
                        item.PlatformName = [item.PlatformName, "/Platform/" + item.ID];
                        if(item.AddedDatetime!==null) {
                            item.AddedDatetime = item.AddedDatetime.slice(0, 4) + '-' + item.AddedDatetime.slice(5, 7) + '-' + item.AddedDatetime.slice(8, 10) + ' ' + item.AddedDatetime.slice(11, 19);
                        }
                        if(item.UpdatedDatetime!==null) {

                            item.UpdatedDatetime = item.UpdatedDatetime.slice(0, 4) + '-' + item.UpdatedDatetime.slice(5, 7) + '-' + item.UpdatedDatetime.slice(8, 10) + ' ' + item.UpdatedDatetime.slice(11, 19);
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
                    platformTableContent: data.PluginPlatformFiles,
                    pending:false
                });
                console.log(Environment);

                if(dataLength <= Environment.defaultDownloadExcelLimit) {
                    self.exportToExcelPlatformTable(tokenData,self.state,dataLength);
                } else {
                    self.setState({
                        dataForExport:null
                    })
                }

            })
            let pgsize= pagetotal;
             a=setTimeout(() => this.checkin(self.state.pending,pgsize,pageSize,controller), 10000);
        }
    };
    clear() {
        this.setState({loader: true,
            colObj:[],
            showErrorExportDialog:false,
            callExportExcel:true,
            showPlatfromErrorDialog:false


        });
        this.dataTable.table.state.page=0;
        let values={
            page:0,
            pageSize:10,

        }
        let instance=null;
        this.fetchPlatformData(values,instance);
    }
    cancelPage(e) {
        this.setState({
            showNewPlatformPage :false,
            showPlatfromErrorDialog:false
        });
    }
    savePlatform(){
        let self = this;
        let platformName = this.inputName.getValue();
        let platformCode = this.inputCode.getValue();
        if(platformName=== '' || platformCode === '' ) {
            // this.showAddPlatformError();
            this.setState({
                showMandatoryField: true,
                loader: false
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
                        fetch(API.PLATFORM_ADD + '?platformcode=' + platformCode + '&platformname=' + platformName + '&user=' + sessionStorage.getItem('userMail'), {
                            method: "POST",
                            headers: headers
                        }).then(function (response) {
                            if (response.status === 200) {
                                self.setState({
                                    loader:false,
                                    showNewPlatformPage: false,
                                    showExistsDialog: false,
                                    showDialog: true,
                                    showPlatfromErrorDialog:false
                                });
                            }else if(response.status === 409 || response.status === 500){
                                self.setState({
                                    loader:false,
                                    showNewPlatformPage: false,
                                    showExistsDialog: true,
                                    showDialog: false,
                                    showPlatfromErrorDialog:false
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
                {id: 1, label: 'Platform Name', type: 'text', placeholder: "Enter Platform Name", isBaseFilter: true},
                {id: 2, label: 'Platform Code', type: 'text', placeholder: "Enter Platform Code", isBaseFilter: true},
                {id: 3, label: 'Active', type: 'text', placeholder: "Enter text", isBaseFilter: true},
                {id: 4, label: "Created From", type: 'date-mon-sun', noDateOption: false, isBaseFilter: true},
                {id: 5, label: "Created To", type: 'date-mon-sun', noDateOption: false, isBaseFilter: false},
                {id: 6, label: 'Created By', type: 'text', placeholder: "Enter Created By", isBaseFilter: false},
                {id: 7, label: 'Updated From', type: 'date-mon-sun', noDateOption: false, isBaseFilter: false},
                {id: 8, label: 'Updated To', type: 'date-mon-sun', noDateOption: false, isBaseFilter: false},
                {id: 9, label: "Update By",type: 'text', placeholder: "Enter Updated By", isBaseFilter: false}
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
                    this.state.showNewPlatformPage === false ?
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
                                            <h1>Platform Configuration </h1>
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
                                {this.state.dataForExport !== null ?
                                <ExcelFile filename="PlatformConfig" element={<button type="button" className="button button-blue">Export to Excel</button>}>
                                    <ExcelSheet data={this.state.dataForExport} name="Platform Config">
                                        <ExcelColumn label="Platform Name" value="PlatformName"/>
                                        <ExcelColumn label="Platform Code" value="Platformcode"/>
                                        <ExcelColumn label="Active" value="IsActive"/>
                                        <ExcelColumn label="Created Time" value="AddedDatetime"/>
                                        <ExcelColumn label="Created By" value="AddedBy"/>
                                        <ExcelColumn label="Updated Time" value="UpdatedDatetime"/>
                                        <ExcelColumn label="Updated By" value="UpdatedBy"/>
                                    </ExcelSheet>
                                </ExcelFile>:<div className="grid-wrapper"><button type="button" className="button button-blue" onClick={this.invalidExport}>Export to Excel</button></div>}
                                <div>
                                    <br/>
                                    <InPageDialog showDialog={this.state.showDialog} type={"success"} message={"Platform added successfully"} closeMethod={() => this.closeDialog()}/>
                                    <InPageDialog showDialog={this.state.showExistsDialog} type={"warning"} message={"Record already exists"} closeMethod={() => this.closeDialog()}/>
                                    <InPageDialog showDialog={this.state.showPlatfromErrorDialog} type={"error"} message={this.state.ErroMsges} closeMethod={() => this.closeDialog()}/>
                                    <InPageDialog showDialog={this.state.showErrorExportDialog} type={"error"} message={"Returned result is more than " +Environment.defaultDownloadExcelLimit+ " records, Please add more filter and try again."} closeMethod={() => this.closeDialog()}/>

                                    <br />
                                </div>
                                <div className="grid-wrapper">
                                    <div className="col-100">
                                        <DataTable
                                            data={this.state.platformTableContent}
                                            columns={[
                                                {
                                                    headerClassName: 'data-table header ',
                                                    accessor: "PlatformName",
                                                    editable: false,
                                                    isHyperlink: true,
                                                    fieldHeader: 'Platform Name',
                                                    show: true
                                                },
                                                {
                                                    headerClassName: 'data-table header ',
                                                    accessor: "Platformcode",
                                                    editable: false,
                                                    isLink: false,
                                                    fieldHeader: 'Platform Code',
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
                                                    accessor: "AddedDatetime",
                                                    editable: false,
                                                    isLink: false,
                                                    fieldHeader: 'Created Time',
                                                    show: true
                                                },
                                                {
                                                    headerClassName: 'data-table header ',
                                                    accessor: "AddedBy",
                                                    editable: false,
                                                    isLink: false,
                                                    fieldHeader: 'Created By',
                                                    show: true
                                                },
                                                {
                                                    headerClassName: 'data-table header ',
                                                    accessor: "UpdatedDatetime",
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
                                            fetchData={this.fetchPlatformData.bind(this)}
                                            tableName={"PlatformTable"}
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
                                            <h1>Create New Platform</h1>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <section className="page-container">
                                <div className="grid-wrapper">
                                    <div className="button-group">
                                        <button type="button" className="button button-blue" onClick={this.savePlatform}>SAVE</button>
                                        <button type="button" className="button button-transparent" onClick={this.cancelPage}>CANCEL</button>&nbsp;&nbsp;
                                    </div>
                                </div>
                                <InPageDialog showDialog={this.state.showMandatoryField} type={"error"} message={"Mandatory Field cant be left blank"} closeMethod={() => this.closeDialog()}/>
                                <div className="grid-wrapper">
                                    <div className="col-25">
                                        <TextField disabled={false} readOnly={false} label={"Platform Name"}  state={inputState} required={true} ref={(input) => {this.inputName = input}}/>
                                    </div>
                                    <div className="col-25">
                                        <TextField disabled={false} readOnly={false} label={"Platform Code"}  state={inputState} required={true} ref={(input) => {this.inputCode = input}}/>
                                    </div>
                                </div>
                            </section>
                            <ModalMain modal={this.state.showAddPlatformError} title={"Error"} hideMethod={() => this.hideModal()} secondaryMethod={() => this.hideModal()}
                                       primaryMethod={() => this.hideModal()} btnTitle1={"OK"} btnTitle2={"Cancel"}>
                                Please add all the Mandatory fields
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

class Platform extends Component {
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
                <PlatformSection dataSendToApiHeader={this.props.dataSendToApiHeader}
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

export default Platform;