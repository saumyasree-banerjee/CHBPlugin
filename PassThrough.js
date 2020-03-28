import React, {Component} from 'react';
import Loader from '../Common/Loader';
import ModalError from '../Common/Error';
import {FilterSection} from 'damco-components';
import {DataTable, HorizontalTabs, SelectionDropDownAdvanced} from 'damco-components';
import API from "../../../Constants/API-config";
import {Environment} from "../../../Constants/Environment";



class PassThrough extends Component {
    constructor(props) {
        super(props);


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
            loader: false,
            modalerror: false,
            modalerrorMSG: "Unexpected error occured! Please try after some time.",
            loaderupload: false,
            hideuccessState: false,
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

            passThroughContent: [],

            columns: [],
            clicking: true,
            pageNumber: 1,

            columnDataObj: [],
            colObj: [],
            SearchPageSize: 10,
            pageSize:0

        }
        //this.loadIdentifiedTableData=this.loadIdentifiedTableData.bind(this);
        //this.tokenDataService=this.tokenDataService.bind(this);
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


    loadIdentifiedTableData(state, instance) {
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
                // console.log('Created :', data);
                sessionStorage.setItem("tokenDataFromAud", JSON.stringify(data));
                tokenData = data;
                self.tokenDataService(tokenData, state, instance);
            });
        }
    };

    tokenDataService(tokenData, state, instance) {

        let self = this;

        //  this.tokenData=tokenData;
        if (state.pageSize !== undefined && state.pageSize !== null)
            self.setState(
                {
                    SearchPageSize: state.pageSize,
                    pageSize:state.pageSize
                }
            )
        if (state.clear !== undefined) {
            self.setState({
                colObj: []
            })
        }

        let pagetotal = state.page + 1;
        if (self.state.colObj === []) {
            var obj = "[]"
        } else
            obj = self.state.colObj;

        if (tokenData !== "") {
            let headers=Environment.headerValues;
            headers.Authorization='Bearer ' + tokenData;
            fetch(API.PASS_THROUGH + "?pageNumber=" + pagetotal + "&pageSize=" + state.pageSize, {
                method: "POST",

                body: JSON.stringify(obj),

                headers:headers


            }).then(function (response) {

                // console.log('SecondAPICreated :', response);
                return response.json();
            }).then(function (data) {
                //console.log('Created :', data);
                //console.log('SecondAPI :', data);
                self.setState({
                    loader:false
                })

                if (data.PluginPassThrough != null && data.PluginPassThrough !== []) {

                    data.PluginPassThrough.map(item => {

                        item.PassThroughMessageId = item.PassThroughMessageId.toString();
                        if (item.CreationDate !== '') {
                            let yearConst = item.CreationDate.slice(0, 4);
                            let monthConst = item.CreationDate.slice(5, 7);
                            let daysConst = item.CreationDate.slice(8, 10);
                            item.CreationDate = yearConst + '-' + monthConst + '-' + daysConst;

                        }
                        if (item.UpdatedDate !== '') {

                            let yearConst = item.UpdatedDate.slice(0, 4);
                            let monthConst = item.UpdatedDate.slice(5, 7);
                            let daysConst = item.UpdatedDate.slice(8, 10);
                            item.UpdatedDate = yearConst + '-' + monthConst + '-' + daysConst;

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
                    let remain = data.TotalRecords % state.pageSize

                    self.setState({
                        pageNumber: (((data.TotalRecords) - remain) / state.pageSize) + 1

                    })
                }

                // console.log(data)
                // console.log(self.state)
                if (data.PluginPassThrough != null) {
                    self.setState({
                        loader: false,
                        passThroughContent: data.PluginPassThrough,


                    });
                }


            })
        }
    };

    fetchData(state, instance) {
        this.setState({
            loader: true
        });
        this.loadIdentifiedTableData(state, instance);
    }

    searchIdentifiedTableData(obj) {
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
                console.log('Created :', data);
                sessionStorage.setItem("tokenDataFromAud", JSON.stringify(data));
                tokenData = data;
                self.searchCI(tokenData, obj);
            });
        }
    };

    searchCI(tokenData, obj) {
        let self = this;
        //  this.tokenData=tokenData;
        let pagetotal = 1;

        if(self.state.pageSize>=0){
           var pageSize=self.state.pageSize
        }
        else
        {
            var pageSize=10
        }


        if (tokenData !== "") {
            let headers=Environment.headerValues;
            headers.Authorization='Bearer ' + tokenData;
            fetch(API.PASS_THROUGH + "?pageNumber=" + pagetotal + "&pageSize=" + pageSize, {
                method: "POST", // *GET, POST, PUT, DELETE, etc.

                body: JSON.stringify(obj),

                headers: headers


            }).then(function (response) {

                console.log('SecondAPICreated :', response);
                return response.json();
            }).then(function (data) {
                //console.log('Created :', data);
                //console.log('SecondAPI :', data);
                if (data.PluginPassThrough != null && data.PluginPassThrough !== []) {
                    if (data.PluginPassThrough.length > 1) {
                        data.PluginPassThrough.map(item => {
                            // let temp = Object.assign({}, item);

                            //  self.state.identifiedTableContent.push(item);
                            if (item.CreationDate !== '') {
                                let yearConst = item.CreationDate.slice(0, 4);
                                let monthConst = item.CreationDate.slice(5, 7);
                                let daysConst = item.CreationDate.slice(8, 10);
                                item.CreationDate = yearConst + '-' + monthConst + '-' + daysConst;

                            }
                            if (item.UpdatedDate !== '') {


                                let yearConst = item.UpdatedDate.slice(0, 4);
                                let monthConst = item.UpdatedDate.slice(5, 7);
                                let daysConst = item.UpdatedDate.slice(8, 10);
                                item.UpdatedDate = yearConst + '-' + monthConst + '-' + daysConst;

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
                    let remain = data.TotalRecords % self.state.SearchPageSize;

                    self.setState({
                        pageNumber: (((data.TotalRecords) - remain) / self.state.SearchPageSize) + 1

                    })
                }

                console.log(data)
                console.log(self.state)
                if (data.PluginPassThrough != null) {
                    self.setState({
                        loader: false,
                        passThroughContent: data.PluginPassThrough,


                    });
                } else {
                    self.setState({
                        loader: false,


                    });

                }


            })
        }
    }

    apply() {
        this.setState({
            passThroughContent: [],
            loader:true
        })


        let values = this.filters.getFilterValues();
        console.log(values,' -- PASS val');
        let CustomerCode = values[0].value;
        let FromAddress = values[1].value;
        let FileName = values[2].value;
        let ImportType;
        let Status = '';

        if (Status === null) {
            Status = "";
        }
        if (values[3].label === "Import Type") {
            ImportType = values[3].value;
        }


        let DocumentId = "";
        let CreatedBy = "";
        let UpdatedBy = "";
        let DocId = "";


        let lastUpdated = "";


        let CreationDate = '';
        let UpdatedDate = "";


        let dateToConstEvent = '';
        let upddate = "";

        let dateToConstEventValue = "";

        if (values.length > 4) {

            DocumentId = values[4].value;
            CreatedBy = values[5].value;
            UpdatedBy = values[6].value;
            Status = values[7].value;
            CreationDate = values[8].value;
            UpdatedDate = values[9].value;


            dateToConstEvent = CreationDate;
            upddate = UpdatedDate;


            if (dateToConstEvent !== '' && dateToConstEvent !== null) {
                let yearConst = dateToConstEvent.slice(6, 10);
                let monthConst = dateToConstEvent.slice(3, 5);
                let daysConst = dateToConstEvent.slice(0, 2);
                dateToConstEvent = yearConst + '-' + monthConst + '-' + daysConst;

            } else {
                dateToConstEvent = "";
            }
            if (upddate !== '' && upddate !== null) {
                let yearConst = upddate.slice(6, 10);
                let monthConst = upddate.slice(3, 5);
                let daysConst = upddate.slice(0, 2);
                upddate = yearConst + '-' + monthConst + '-' + daysConst;

            }

        }


        this.setState({
            columnDataObj: []
        });
        let columnDataObj = this.state.columnDataObj;


        let customerCodeVal = {
            "ColumnName": 'CustomerCode',
            "Operator": 'contains',
            "Value1": CustomerCode,
            "Value2": ''
        }


        let Address = {
            "ColumnName": 'FromAddress',
            "Operator": 'contains',
            "Value1": FromAddress,
            "Value2": ''
        }

        let fileNameVal = {
            "ColumnName": 'FileName',
            "Operator": 'contains',
            "Value1": FileName,
            "Value2": ''
        }


        let impTyp = {
            "ColumnName": 'ImportType',
            "Operator": 'contains',
            "Value1": ImportType,
            "Value2": ''
        }


        let creaBy = {
            "ColumnName": 'CreatedBy',
            "Operator": 'contains',
            "Value1": CreatedBy,
            "Value2": ''
        }
        let upBy = {
            "ColumnName": 'UpdatedBy',
            "Operator": 'contains',
            "Value1": UpdatedBy,
            "Value2": ''
        }

        let Stat = {
            "ColumnName": 'Status',
            "Operator": 'contains',
            "Value1": Status,
            "Value2": ''
        }

        let createDate = {
            "ColumnName": 'Create Date',
            "Operator": 'greaterthan',
            "Value1": dateToConstEvent,
            "Value2": ''
        }
        let updateDate = {
            "ColumnName": 'Update Date',
            "Operator": 'greaterthan',
            "Value1": upddate,
            "Value2": ''
        }

        let DocumentValueID = {
            "ColumnName": 'DocId',
            "Operator": 'equal',
            "Value1": DocumentId,
            "Value2": ''
        }
        if (DocumentId !== '') {
            columnDataObj.push(DocumentValueID);
        }


        if (CustomerCode !== '') {
            columnDataObj.push(customerCodeVal);
        }

        if (FromAddress !== '') {
            columnDataObj.push(Address);
        }
        if (FileName !== '') {
            columnDataObj.push(fileNameVal);
        }

        if (ImportType !== '') {
            columnDataObj.push(impTyp);
        }
        if (CreatedBy !== '') {
            columnDataObj.push(creaBy);
        }


        if (UpdatedBy !== '') {
            columnDataObj.push(upBy);
        }
        if (Status== null) {
            Status = "";
        }
        if (Status !== '') {
            columnDataObj.push(Stat);
        }

        if (dateToConstEvent !== '') {
            columnDataObj.push(createDate);
        }
        if (upddate !== '') {
            columnDataObj.push(updateDate);
        }


        this.setState({
            colObj: columnDataObj
        })
        console.log(columnDataObj);

        this.searchIdentifiedTableData(columnDataObj);

    }
    clear() {
        // Filters cleared
        let self=this;
        var vals={

            pageSize:10,
            page: 0,
            clear:true
        }
        self.setState({
            loader:true
        })
        var instance=null;

        this.loadIdentifiedTableData(vals,instance);
    }


    render() {
        let filters = {
            defaultStateOpen: false,
            moreLess: true,
            inputs: [
                {id: 42, label: 'Customer Code', type: 'text', placeholder: "Enter text", isBaseFilter: true},
                {id: 43, label: "Address", type: 'text', placeholder: "Enter text", isBaseFilter: true},
                {id: 44, label: 'File Name', type: 'text', placeholder: "Enter text", isBaseFilter: true},
                {id: 45, label: 'Import Type', type: 'text', placeholder: "Enter text", isBaseFilter: true},
                {id: 46, label: 'Document Id', type: 'text', placeholder: "Enter text", isBaseFilter: false},
                {id: 47, label: 'Created From Date', type: 'date-mon-sun', noDateOption: false, isBaseFilter: false},
                {id: 48, label: 'Created To Date', type: 'date-mon-sun', noDateOption: false, isBaseFilter: false},
                {id: 49, label: 'Created By', type: 'text', placeholder: "Enter text", isBaseFilter: false},
                {id: 50, label: 'Updated From Date', type: 'date-mon-sun', noDateOption: false, isBaseFilter: false},
                {id: 51, label: 'Updated To Date', type: 'date-mon-sun', noDateOption: false, isBaseFilter: false},
                {id: 52, label: 'Updated By', type: 'text', placeholder: "Enter text", isBaseFilter: false},
                {
                    id: 53,
                    label: 'Status',
                    type: 'advanced-dropdown',
                    options: [{label: 'Completed', value: 'Completed'}, {




                        label: 'Rejected',
                        value: 'Rejected'
                    }, {label: 'Delivered', value: 'Delivered'}, {
                        label: 'Inserted',
                        value: 'Inserted'
                    }, {label: 'Failed To Deliver', value: 'FailedToDeliver'}],
                    isMulti: false,
                    isSearchable: true,
                    isBaseFilter: false
                }



            ]
        }
        return (
            <div>
                <div className="header-group profile-template">
                    <ul className="page-title-group">
                        <li className="no-margin"/>
                        <li>
                            <h2>Pass Through data</h2>
                        </li>
                    </ul>
                </div>
                <div className="grid-wrapper">
                    <div className="col-100">


                            <section className="page-container">
                                <div className="grid-wrapper">
                                    <div className="col-100">
                                        <FilterSection data={filters} applyAction={() => this.apply()}
                                                       clearAction={() => this.clear()}
                                                       ref={(filters) => this.filters = filters}/>

                                    </div>

                                </div>
                            </section>
                            <section className="page-container">
                                <div className="grid-wrapper">


                                    <DataTable
                                        data={this.state.passThroughContent}
                                        columns={[


                                            {

                                                headerClassName: 'data-table header ',
                                                accessor: "CustomerCode",
                                                editable: false,
                                                isLink: false,

                                                fieldHeader: 'Customer Code ',
                                                show: true,


                                            },
                                            {
                                                headerClassName: 'data-table header',
                                                accessor: "FromAddress",

                                                isStatus: false,
                                                isLink: false,
                                                fieldHeader: 'Address ',
                                                show: true,

                                                footer: null
                                            },
                                            {
                                                headerClassName: 'data-table header',

                                                accessor: "FileName",

                                                isStatus: false,
                                                isLink: false,
                                                fieldHeader: "File Name",
                                                show: true


                                            },
                                            {
                                                headerClassName: 'data-table header',
                                                accessor: "ImportType",
                                                editType: "text",
                                                isStatus: false,
                                                isLink: false,
                                                fieldHeader: " Import Type",
                                                show: true

                                            },
                                            {
                                                headerClassName: 'data-table header ',

                                                accessor: "DocId",
                                                editable: false,
                                                isLink: false,
                                                fieldHeader: 'Document Id',
                                                show: true,

                                            },
                                            {
                                                headerClassName: 'data-table header',
                                                accessor: "CreationDate",
                                                editable: false,

                                                isLink: false,
                                                fieldHeader: 'Creation Date',
                                                show: true,

                                            },
                                            {
                                                headerClassName: 'data-table header ',

                                                accessor: "CreatedBy",
                                                editable: false,
                                                isLink: false,
                                                fieldHeader: 'Created By',
                                                show: true,

                                            },
                                            {
                                                headerClassName: 'data-table header',
                                                accessor: "UpdatedDate",
                                                editable: false,

                                                isLink: false,
                                                fieldHeader: 'Updated Date',
                                                show: true,

                                            },
                                            {
                                                headerClassName: 'data-table header',
                                                accessor: "UpdatedBy",
                                                editable: false,

                                                isLink: false,
                                                fieldHeader: 'Updated By',
                                                show: true,

                                            },
                                            {
                                                headerClassName: 'data-table header',
                                                accessor: "Status",
                                                isStatus: false,
                                                isLink: false,
                                                fieldHeader: 'Status',
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
                                        fetchData={this.fetchData.bind(this)}
                                        tableName={"PassThroughTable"}
                                        ref={(dataTable) => {
                                            this.dataTable = dataTable;
                                        }}


                                        height={"auto"}
                                    />


                                </div>
                            </section>




                    </div>
                </div>


                <Loader loader={this.state.loader}/>

            </div>
        )
    }
}











export default PassThrough;