import React, {Component} from 'react';
import Loader from '../Common/Loader';
import API from "../../../Constants/API-config";
import {HorizontalTabs} from 'damco-components';
import ReceiverDestination from '../Configure/receiverDestinationType';
import ReceiverSource from '../Configure/receiverSource';
import ReceiverEventTypeFile from '../Configure/ReceiverEventTypeFile.js';
import ResponseDestination from '../Configure/receiverResponseDestination.js';
import ReceiverEvent from '../Configure/receiverEventType.js';
import {Environment} from "../../../Constants/Environment";


class ReceiverformSection extends Component {
    constructor(props) {
        super(props);
        let tableActions = {
            primaryActionIsMoreBtn: false,
            primaryActionLabel: "Create New Event",
            primaryAction: () => this.addPlatform(),

        };
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
            showExistsDialog:false,
            loader: false,
            showAddPlatformError: false,
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
            showNewCustomerPage :false,
            EventTypeName:'',
            IsActive:'',
            UpdatedBy:'',
            InsertedBy:'',
            showErrorValidate:false,
            responseSource:null,
            pageSize:0,
            SearchPageSize: 10,
            tabeState:0

        };
        this.savePlatform = this.savePlatform.bind(this);
        this.cancelPage = this.cancelPage.bind(this);
        this.EventTypeName=this.EventTypeName.bind(this);
        this.IsActive=this.IsActive.bind(this);
        this.InsertedBy=this.InsertedBy.bind(this);
        this.UpdatedBy=this.UpdatedBy.bind(this);
        this.clearPage=this.clearPage.bind(this);
        this.fetchSource=this.fetchSource.bind(this);
    }
    EventTypeName(evt) {
        this.setState({
            EventTypeName: evt.target.value
        });
    }
    IsActive(evt) {
        this.setState({
            IsActive: evt.target.value
        });
    }
    InsertedBy(evt) {
        this.setState({
            InsertedBy: evt.target.value
        });
    }
    UpdatedBy(evt) {
        this.setState({
            UpdatedBy: evt.target.value
        });
    }

    addPlatform = () => {
        this.setState({
            showNewPlatformPage: true,
            showDialog:false,
            showErrorValidate:false,
            showExistsDialog:false

        });
    };
    onTabChange = (id) => {
        this.setState({
            loader:false
        });
        if(id === 1) {
            this.setState({tabeState: 0});
            sessionStorage.setItem('tabeState', 0);
        }else if(id === 2){
            this.setState({tabeState: 1});
            sessionStorage.setItem('tabeState', 1);
        }else if(id === 3){
            this.setState({tabeState: 2});
            sessionStorage.setItem('tabeState', 2);
        }else if(id === 4) {
            this.setState({tabeState: 3});
            sessionStorage.setItem('tabeState', 3);
        }
        else if(id === 5){
                this.setState({tabeState: 4});
                sessionStorage.setItem('tabeState', 4);
            }

    };
    clearPage() {
        this.setState({
            showDialog: false,
            showExistsDialog:false,
            showErrorValidate:false,
            EventTypeName:"",
            IsActive:"",
            InsertedBy:'',
            UpdatedBy:""
        })
    }
    closeDialog(){
        this.setState({
            showDialog:false
        });

        this.setState({
            showExistsDialog:false
        });

        this.setState({
            showErrorValidate:false
        })
    }
    showAddPlatformError(){
        this.setState({
            showAddPlatformError: true
        })
    }

    componentWillMount = () => {
        let self=this;
        this.setState({loader: false});
        let sessionValue= parseInt(sessionStorage.getItem('tabeState'));

        self.setState({
            tabeState:sessionValue
        });
        if(sessionStorage.getItem('tabeState') !==  null) {
            self.onTabChange(parseInt(sessionStorage.getItem('tabeState')) + 1);
            }
            else{
            self.onTabChange(1)
        }
        };


    componentDidMount = () => {
        // let self = this;
        //this.loadPlatformData();

    };

    componentWillUnmount = () => {
        clearTimeout(this.fetchDataTimeOut);
        clearInterval(this.fetchDataInterval);
    };

    signOut = () => {
        this.props.signOut();
    };


    initializeToken(state, instance) {
        let self = this;
        var tokenData = '';
        self.setState({
            loader:true
        });
        if (tokenData === '') {
            const Aud = {
                "Audience": API.AUDIENCE_ID
            };
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
                });
                self.searchPlatformService(tokenData, state, instance);
                self.fetchSource(tokenData);
            }).catch(err => {
                self.setState({
                    loader: false

                })
            });
        }
    };


    fetchSource(tokenData) {
        const self = this;
        if (tokenData !== "") {
            let headers=Environment.headerValues;
            headers.Authorization='Bearer ' + tokenData;

            fetch(API.RECEIVER_SOURCE_LOAD_SOURCE,{
                method: "GET",
                headers: headers
            }).then(function (response) {
                return response.json();
            }).then(function (data) {
                // console.log(data);
                self.setState({
                    responseSource :data
                });
            }).catch(err => {
                self.setState({
                    loader: false

                })
            });
        }
    }
    searchPlatformService(tokenData, state, instance) {
        // console.log(state, ' State');
        let self = this;
        let pagetotal = state.page + 1;
        let jsonObj;
        self.setState({
            pageSize:state.pageSize,
            SearchPageSize: state.pageSize,
            loader:false
        });
        if(self.state.columnDataObj === []){
            jsonObj = "[]";
        } else {
            jsonObj = self.state.columnDataObj;
        }
        // console.log(jsonObj, ' :JSON OBJ');
        if (tokenData !== "") {
            let headers=Environment.headerValues;
            headers.Authorization='Bearer ' + tokenData;
            fetch(API.EVENT_SEARCH + "?pageNumber=" + pagetotal + "&pageSize=" + state.pageSize,{
                method: "POST",
                body: jsonObj,
                headers: headers
            }).then(function (response) {
                return response.json();
            }).then(function (data) {

                if (data.EventTypeList != null) {

                    data.EventTypeList.map(item => {
                        item.EventTypeName = item.EventTypeName.toString();
                        item.EventTypeName = [item.EventTypeName, "/"+item.EventTypeName+"/" + item.EventTypeId];
                        if(item.InsertedTime !== null) {
                            item.InsertedTime = item.InsertedTime.slice(0, 4) + '-' + item.InsertedTime.slice(5, 7) + '-' + item.InsertedTime.slice(8, 10);
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
                    let remain = data.TotalRecords % 10;
                    self.setState({
                        pageNumber: (((data.TotalRecords) - remain) / 10) + 1
                    })
                }
                if(data.EventTypeList !== null) {
                    self.setState({
                        loader: false,
                        platformTableContent: data.EventTypeList,
                    });
                }
            }).catch(err => {
                self.setState({
                    loader: false

                })
            });
        }
    }
    apply(){
        this.setState({
            columnDataObj : []
        });
        this.dataTable.table.state.page=0;
        let EventTypeFilterValues = this.filters.getFilterValues();
        this.setState({loader: true,});
        let EventTypeId = '';
        let EventTypeName='';
        let active = '';
        let InsertedTime = '';
        let InsertedChange='';
        let UpdatedChange='';
        let InsertedBy = '';
        let updateBy = '';
        let receiversource='';

        let updatedTime = '';
        if(EventTypeFilterValues.length <= 4) {
            EventTypeId = EventTypeFilterValues[0].value;
            EventTypeName = EventTypeFilterValues[1].value;
            active = EventTypeFilterValues[2].value;
            InsertedTime = EventTypeFilterValues[3].value;
        } else {
            EventTypeId = EventTypeFilterValues[0].value;
            EventTypeName = EventTypeFilterValues[1].value;
            active = EventTypeFilterValues[2].value;
            InsertedBy = EventTypeFilterValues[3].value;
            updateBy=EventTypeFilterValues[4].value;
            receiversource=EventTypeFilterValues[5].value;
            InsertedTime = EventTypeFilterValues[6].value;
            updatedTime=EventTypeFilterValues[7].value;
        }



        if(InsertedTime !== ''){
            let yearConst = InsertedTime.slice(6, 10);
            let monthConst = InsertedTime.slice(3, 5);
            let daysConst = InsertedTime.slice(0, 2);
            InsertedChange = yearConst + '-' + monthConst+'-'+daysConst;
        }else{
            InsertedChange='';
        }
        if(updatedTime !== ''){
            let yearConst = updatedTime.slice(6, 10);
            let monthConst = updatedTime.slice(3, 5);
            let daysConst = updatedTime.slice(0, 2);
            UpdatedChange = yearConst + '-' + monthConst+'-'+daysConst;
        }else{
            UpdatedChange='';
        }
        this.setState({
            columnDataObj : []
        });
        let columnDataObj = this.state.columnDataObj;





        let EventTypeIds = {
            "ColumnName": 'EventTypeId',
            "Operator": 'contains',
            "Value1": EventTypeId,
            "Value2": ''
        };
        if(EventTypeId !== '' ) {
            columnDataObj.push(EventTypeIds);
        }
        let EventTypeNames = {
            "ColumnName": 'EventTypeName',
            "Operator": 'contains',
            "Value1": EventTypeName,
            "Value2": ''
        };
        if(EventTypeName !== '' ) {
            columnDataObj.push(EventTypeNames);
        }
        let actives = {
            "ColumnName": 'IsActive',
            "Operator": 'contains',
            "Value1": active,
            "Value2": ''
        };
        if(active !== '' ) {
            columnDataObj.push(actives);
        }
        let InsertedBys = {
            "ColumnName": 'InsertedBy',
            "Operator": 'contains',
            "Value1": InsertedBy,
            "Value2": ''
        };
        if(InsertedBy !== '' ) {
            columnDataObj.push(InsertedBys);
        }

        let updateBys = {
            "ColumnName": 'updateBy',
            "Operator": 'greaterthan',
            "Value1": updateBy,
            "Value2": ''
        };
        if(updateBy !== '' ) {
            columnDataObj.push(updateBys);
        }



        let InsertedTimes = {
            "ColumnName": 'InsertedTime',
            "Operator": 'greaterthan',
            "Value1": InsertedChange,
            "Value2": ''
        };
        if(InsertedTime !== '' ) {
            columnDataObj.push(InsertedTimes);
        }
        let updatedTimes = {
            "ColumnName": 'InsertedTime',
            "Operator": 'greaterthan',
            "Value1": UpdatedChange,
            "Value2": ''
        };
        if(updatedTime !== '' ) {
            columnDataObj.push(updatedTimes);
        }

        let receiversources = {
            "ColumnName": 'ResponseSourceName',
            "Operator": 'contains',
            "Value1": receiversource,
            "Value2": ''
        };
        if(receiversource !== '' ) {
            columnDataObj.push(receiversources);
        }
        this.useTokenForPlatformSearch(columnDataObj);
    }
    useTokenForPlatformSearch(obj) {
        let self = this;
        let tokenData = '';
        if (tokenData === '') {
            const Aud = {
                "Audience": API.AUDIENCE_ID
            };
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
        if(self.state.pageSize>=0){
            pageSize=self.state.pageSize
        }
        self.setState({
            loader:false
        });

        if (tokenData !== "") {
            let headers=Environment.headerValues;
            headers.Authorization='Bearer ' + tokenData;
            fetch(API.EVENT_SEARCH + "?pageNumber=" + pagetotal + "&pageSize=" + pageSize, {
                method: "POST", // *GET, POST, PUT, DELETE, etc.
                body: JSON.stringify(obj),
                headers: headers
            }).then(function (response) {
                return response.json();
            }).then(function (data) {
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
                if(data.EventTypeList!==null) {
                    data.EventTypeList.map(item => {
                        item.EventTypeName = item.EventTypeName.toString();
                        item.EventTypeName = [item.EventTypeName, "/" + item.EventTypeName + "/" + item.EventTypeId];

                        return null;
                    });
                    self.setState({
                        loader: false,
                        platformTableContent: data.EventTypeList
                    });
                }
            })
        }
    };
    clear() {
        this.setState({loader: true});
        let values={
            page:0,
            pageSize:10
        };
        let instance=null;
        this.dataTable.table.state.page=0;
        this.initializeToken(values, instance);

    }
    cancelPage(e) {
        this.setState({
            showNewPlatformPage :false
        });
    }
    savePlatform(){
        let self = this;

        self.setState({
            loader :true

        });

        if(self.state.EventTypeName=== '') {
            self.setState({
                loader :false,
                showErrorValidate:true
            });
            //this.showAddPlatformError();
        }else {
            self.setState({
                loader :true,
                showErrorValidate:false
            });
            let tokenData = '';
            if (tokenData === '') {
                const Aud = {
                    "Audience": API.AUDIENCE_ID
                };
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
                        loader :false
                    });
                    let date = new Date().getDate();
                    let month = new Date().getMonth() + 1;
                    let year = new Date().getFullYear();

                    let selection = self.eventtypesource.getSelection();
                    let jsonData =
                        {
                            "EventTypeName": self.state.EventTypeName,
                            "IsActive": true,
                            "ResponseSourceId":selection,

                            "UpdatedTime": "",
                            "UpdatedBy": "",
                            "InsertedTime": year + '-' + month + '-' + date,
                            //sessionStorage.getItem('userMail')
                            "InsertedBy": sessionStorage.getItem('userMail')



                        };
                    if (tokenData !== '') {
                        fetch(API.RECEIVER_EVENT_TYPE_ADD, {
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
                            self.setState({
                                loader :false
                            });
                            if (response.status === 200) {
                                self.setState({
                                    loader:false,
                                    showNewPlatformPage: false,
                                    showDialog: true,
                                    showExistsDialog:false,
                                    showErrorValidate:false
                                });
                            }
                            if(response.status === 409){
                                self.setState({
                                    loader:false,
                                    showNewPlatformPage: false,
                                    showDialog: false,
                                    showExistsDialog:true,
                                    showErrorValidate:false
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

        let sourceArray = [];
        if(this.state.responseSource) {
            if (this.state.responseSource.length > 0) {
                for (var i = 0; i < this.state.responseSource.length; i++) {
                    let destinationObj = {
                        value: this.state.responseSource[i].ResponseSourceId,
                        label: this.state.responseSource[i].ResponseSourceName
                    };
                    sourceArray.push(destinationObj);
                }
            }
        }
        const SampleData = [
            {
                "id": 1,
                "title": "Source",
                "count": "0",
            },
            {
                "id": 2,
                "title": "Event Type",
                "count": "0",
            },
            {
                "id": 3,
                "title": "Event Type File",
                "count": "0",
            },
            {
                "id": 4,
                "title": "Destination Type",
                "count": "0",
            },

            {
                "id": 5,
                "title": "Response Destination",
                "count": "0",
            }

        ];
        return (

                        <div>
                            {
                                this.state.tabeState >= 0 ?
                                <HorizontalTabs name={"horizontal-tabs"} count={false} onChange={this.onTabChange}
                                                tabData={SampleData}
                                                selectedTab={this.state.tabeState}>
                                    {
                                        (this.state.tabeState === 0) ?
                                            <div><ReceiverSource/></div> : <div></div>

                                    }
                                    {
                                        (this.state.tabeState === 1) ?
                                            <div><ReceiverEvent/></div> : <div></div>

                                    }
                                    {
                                        (this.state.tabeState === 2) ?
                                            <div><ReceiverEventTypeFile/></div> : <div></div>

                                    }
                                    {
                                        (this.state.tabeState === 3) ?
                                            <div><ReceiverDestination/></div> : <div></div>

                                    }
                                    {
                                        (this.state.tabeState === 4) ?
                                            <div><ResponseDestination/></div> : <div></div>

                                    }


                                </HorizontalTabs>:null
                            }
                        </div>


        )
    }
}

class ErrorSection extends Component {
    constructor(props) {
        super(props);
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
        super(props);
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
                <ReceiverformSection dataSendToApiHeader={this.props.dataSendToApiHeader}
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