import React, {Component} from 'react';
import Loader from '../Common/Loader';
import {FilterSection, InPageDialog, TextField} from 'damco-components';
import API from "../../../Constants/API-config";
import {DataTable, SelectionDropDownAdvanced} from 'damco-components';
import {Environment} from "../../../Constants/Environment";
import ReactExport from "react-export-excel";


class ReceiverformSectionEvent extends Component {
    constructor(props) {
        super(props);
        let tableActions = {
            primaryActionIsMoreBtn: false,
            primaryActionLabel: "Create New Event",
            primaryAction: () => this.addPlatform(),

        }
        this.state = {

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
            IsActive:'',
            UpdatedBy:'',
            InsertedBy:'',
            showErrorValidate:false,
            responseSource:null,
            showStatusText:false,
            statusText:'',
            SearchPageSize: 10,
            pageSize:0,
            receiverSourceSel:null,
            errorEventTypeName: false,
            errorResponseSource: false

        }
        this.saveNewReceiverEvent = this.saveNewReceiverEvent.bind(this);
        this.cancelPage = this.cancelPage.bind(this);
        this.IsActive=this.IsActive.bind(this);
        this.InsertedBy=this.InsertedBy.bind(this);
        this.UpdatedBy=this.UpdatedBy.bind(this);
        this.clearPage=this.clearPage.bind(this);
        this.fetchSource=this.fetchSource.bind(this);
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
        let selectDefault={
            value:"Select",
            label:"Select"
        }
        this.setState({
            showNewPlatformPage: true,
             showDialog:false,
            showErrorValidate:false,
            showExistsDialog:false,
            receiverSourceSel:selectDefault

        });
    }
    onTabChange = (id) => {
        this.setState({
            tabValueNonAttached:id
        })
    }
    exportToExcelSenderConfigTable(tokenData,state,datalength) {
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
    clearPage() {
        this.setState({
            showDialog: false,
            showExistsDialog: false,
            showErrorValidate: false,
            EventTypeName: '',
            IsActive: '',
            InsertedBy: '',
            UpdatedBy: ''
        });
    }
        closeDialog(){
            this.setState({
                showDialog:false,
                loader:false,
                showExistsDialog:false,
                showErrorValidate:false
            })

        this.setState({
            showExistsDialog:false
        })

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
        this.setState({loader: false});
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
    onChangeEventType = (value) => {

    }
    exportToExcelEventType(tokenData,state,datalength) {
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
        fetch(API.EVENT_SEARCH + "?pageNumber=" + pagetotal + "&pageSize=" + datalength, {
            method: "POST",
            body: JSON.stringify(obj),
            headers: headers,
            signal: signal
        }).then(function (response) {
            return response.json();
        }).then(function (data) {
            const results = data.EventTypeList.map((_arrayElement) => Object.assign({}, _arrayElement));
            self.setState({
                dataForExport: results
            })
        });
    }
    fetchConfigureData(state, instance) {
        this.setState({
            loader:true
        })

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
                "Audience":  API.AUDIENCE_ID
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
              self.fetchSource(tokenData);
            });
        }
    };


    fetchSource(tokenData) {
        const self = this;
        if (tokenData !== "") {
            fetch(API.RECEIVER_SOURCE_LOAD_SOURCE,{
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
                    responseSource :data,
                    loader:false
                });
            });
        }
    }
    searchPlatformService(tokenData, state, instance) {
        // console.log(state, ' State');
        let self = this;
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
        // console.log(jsonObj, ' :JSON OBJ');
        if (tokenData !== "") {
            fetch(API.EVENT_SEARCH + "?pageNumber=" + pagetotal + "&pageSize=" + state.pageSize,{
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
                let dataLength = data.TotalRecords;
                if (data.EventTypeList != null) {

                    data.EventTypeList.map(item => {
                        item.ResponseSource = item.ResponseSource.toString();
                        item.ResponseSource = [item.ResponseSource, "/EventType/" + item.EventTypeId + "/EventTypeDetail"];
                        if(item.InsertedTime !== null) {
                            item.InsertedTime = item.InsertedTime.slice(0, 4) + '-' + item.InsertedTime.slice(5, 7) + '-' + item.InsertedTime.slice(8, 10)+ " " + item.InsertedTime.slice(11, 19);
                        }
                        if(item.UpdatedTime !== null) {
                            item.UpdatedTime = item.UpdatedTime.slice(0, 4) + '-' + item.UpdatedTime.slice(5, 7) + '-' + item.UpdatedTime.slice(8, 10) + " " + item.UpdatedTime.slice(11, 19);
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

                if(data.EventTypeList !== null) {
                    self.setState({
                        loader: false,
                        platformTableContent: data.EventTypeList
                    });
                }
                self.exportToExcelEventType(tokenData,state,dataLength);
            })
        }
    }
    apply(){
        this.setState({
            columnDataObj : [],
            showStatusText:false,
            loader:true
        });
        let EventTypeFilterValues = this.filters.getFilterValues();
        this.dataTable.table.state.page=0;
        this.setState({loader: true,});
        let EventTypeName='';
        let active = '';
        let InsertedTime = '';
        let InsertedChange='';
        let insertedTimeEventTo ='';
        let UpdatedChange='';
        let updatedTimeEventTo ='';
        let InsertedBy = '';
        let UpdatedBy = '';
        let receiversource='';
        let UpdatedTime = '';
        let updatedTimeTo = '';
        let insertedTimeTo = '';
        if(EventTypeFilterValues.length <= 4) {
            EventTypeName = EventTypeFilterValues[0].value;
            active = EventTypeFilterValues[1].value;
            InsertedTime = EventTypeFilterValues[2].value;
            insertedTimeTo = EventTypeFilterValues[3].value;
        } else {
            EventTypeName = EventTypeFilterValues[0].value;
            active = EventTypeFilterValues[1].value;
            InsertedBy = EventTypeFilterValues[2].value;
            UpdatedBy=EventTypeFilterValues[3].value;
            receiversource=EventTypeFilterValues[4].value;
            InsertedTime = EventTypeFilterValues[5].value;
            insertedTimeTo = EventTypeFilterValues[6].value;
            UpdatedTime=EventTypeFilterValues[7].value;
            updatedTimeTo = EventTypeFilterValues[8].value;
        }
        if(active==null){
            active='';
        }



        if(InsertedTime !== ''){
            let yearConst = InsertedTime.slice(6, 10);
            let monthConst = InsertedTime.slice(3, 5);
            let daysConst = InsertedTime.slice(0, 2);
            InsertedChange = yearConst + '-' + monthConst+'-'+daysConst;
        }else{
            InsertedChange='';
        }
        if(insertedTimeTo !== ''){
            let yearConst = insertedTimeTo.slice(6, 10);
            let monthConst = insertedTimeTo.slice(3, 5);
            let daysConst = insertedTimeTo.slice(0, 2);
            insertedTimeEventTo = yearConst + '-' + monthConst+'-'+daysConst;
        }else{
            insertedTimeEventTo='';
        }
        if(UpdatedTime !== ''){
            let yearConst = UpdatedTime.slice(6, 10);
            let monthConst = UpdatedTime.slice(3, 5);
            let daysConst = UpdatedTime.slice(0, 2);
            UpdatedChange = yearConst + '-' + monthConst+'-'+daysConst;
        }else{
            UpdatedChange='';
        }
        if(updatedTimeTo !== ''){
            let yearConst = updatedTimeTo.slice(6, 10);
            let monthConst = updatedTimeTo.slice(3, 5);
            let daysConst = updatedTimeTo.slice(0, 2);
            updatedTimeEventTo = yearConst + '-' + monthConst+'-'+daysConst;
        }else{
            updatedTimeEventTo='';
        }


        this.setState({
            columnDataObj : []
        });
        let columnDataObj = this.state.columnDataObj;






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
        if(active !== '' && active !=='Select' ) {
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
            "ColumnName": 'UpdatedBy',
            "Operator": 'contains',
            "Value1": UpdatedBy.trim(),
            "Value2": ''
        };
        if(UpdatedBy !== '' ) {
            columnDataObj.push(updateBys);
        }



        let InsertedTimes = {
            "ColumnName": 'InsertedTime',
            "Operator": 'range',
            "Value1": InsertedChange,
            "Value2": insertedTimeEventTo
        };
        if(InsertedTime !== '' ) {
            columnDataObj.push(InsertedTimes);
        }
        let updatedTimes = {
            "ColumnName": 'UpdatedTime',
            "Operator": 'range',
            "Value1": UpdatedChange,
            "Value2": updatedTimeEventTo
        };
        if(UpdatedTime !== '' ) {
            columnDataObj.push(updatedTimes);
        }
if(receiversource===null){
    receiversource='';
}
        let receiversources = {
            "ColumnName": 'ResponseSource',
            "Operator": 'equal',
            "Value1": receiversource,
            "Value2": ''
        };
        if(receiversource !== '' && receiversource!=='Select') {
            columnDataObj.push(receiversources);
        }
        this.setState({
            colObj:columnDataObj
        })
        this.useTokenForPlatformSearch(columnDataObj);
    }
    useTokenForPlatformSearch(obj) {
        let self = this;
        let tokenData = '';
        if (tokenData === '') {
            const Aud = {
                "Audience":  API.AUDIENCE_ID
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
        if(self.state.pageSize>=0){
            pageSize=self.state.pageSize
        }

        if (tokenData !== "") {
            fetch(API.EVENT_SEARCH + "?pageNumber=" + pagetotal + "&pageSize=" + pageSize, {
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
                let record = data.TotalRecords % self.state.SearchPageSize;
                let dataLength = data.TotalRecords;
                if (record === 0) {
                    let pagenum = (data.TotalRecords) / self.state.SearchPageSize;
                    self.setState({
                        pageNumber: pagenum,
                        loader:false
                    })
                } else {
                    let remain = data.TotalRecords %  self.state.SearchPageSize
                    self.setState({
                        pageNumber: (((data.TotalRecords) - remain) / self.state.SearchPageSize) + 1,
                        loader:false
                    })
                }
              if(data.EventTypeList!==null) {
                  data.EventTypeList.map(item => {
                      item.ResponseSource = item.ResponseSource.toString();
                      item.ResponseSource = [item.ResponseSource, "/EventType/" + item.EventTypeId + "/EventTypeDetail"];
                      if(item.InsertedTime !== null) {
                          item.InsertedTime = item.InsertedTime.slice(0, 4) + '-' + item.InsertedTime.slice(5, 7) + '-' + item.InsertedTime.slice(8, 10)+ " " + item.InsertedTime.slice(11, 19);
                      }
                      if(item.UpdatedTime !== null) {
                          item.UpdatedTime = item.UpdatedTime.slice(0, 4) + '-' + item.UpdatedTime.slice(5, 7) + '-' + item.UpdatedTime.slice(8, 10)+ " " + item.UpdatedTime.slice(11, 19);
                      }

                      return null;
                  });
                  self.setState({
                      loader: false,
                      platformTableContent: data.EventTypeList
                  });
              }
                self.exportToExcelEventType(tokenData,self.state,dataLength);
            })
        }
    };
    clear() {
        this.setState({loader: true});
        let values={
            page:0,
            pageSize:10
        }
        let instance=null;
        this.dataTable.table.state.page=0;
      //  this.clear()
        this.closeDialog()

        this.setState({
            colObj:[]
        })
        this.initializeToken(values, instance);

    }
    cancelPage(e) {
        this.setState({
            showNewPlatformPage :false,
            showStatusText:false,
        });
    }
    saveNewReceiverEvent(){
        let self = this;

        self.setState({
            loader :true

        });
        let eventSelected=this.eventtypesource.state.value;
        self.setState({
            receiverSourceSel:eventSelected
        })
        if(self.eventTypeName.getValue() === '') {
            self.setState({
                loader :false,
                showErrorValidate:true
            });
        } else if( self.eventtypesource.getSelection().toString() === 'Select') {
            self.setState({
                loader :false,
                showErrorValidate:true
            });
        } else {
            self.setState({
                loader :true,
                showErrorValidate:false
            });
            let tokenData = '';
            let date = new Date().getDate();
            let month = new Date().getMonth() + 1;
            let year = new Date().getFullYear();
            let sourceEventSelect = self.eventtypesource.getSelection().toString();
            if (tokenData === '') {
                const Aud = {
                    "Audience":  API.AUDIENCE_ID
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
                        loader :false
                    });

                    let jsonData =
                        {
                            "EventTypeName": self.eventTypeName.getValue(),
                            "IsActive": true,
                            "ResponseSourceId":sourceEventSelect,
                            "UpdatedTime": "",
                            "UpdatedBy": "",
                            "InsertedTime": year + '-' + month + '-' + date,
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
                                    showErrorValidate:false,
                                    showStatusText:false
                                });
                            }
                            if(response.status === 409 || response.status === 500 ){
                                self.setState({
                                    loader:false,
                                    showNewPlatformPage: false,
                                    showDialog: false,
                                    showExistsDialog:false,
                                    showErrorValidate:false,
                                    showStatusText:true,
                                    statusText:response.statusText
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

        let i;
        let sourceArray = [];
        let sourceArrayVal=[];
        if(this.state.responseSource) {
            if (this.state.responseSource.length > 0) {
                if (this.state.showNewPlatformPage === true) {
                    for (i = 0; i < this.state.responseSource.length; i++) {
                        let destinationObj = {

                            value: this.state.responseSource[i].ResponseSourceId,
                            label: this.state.responseSource[i].ResponseSourceName


                        };

                        sourceArrayVal.push(destinationObj);
                    }
                    let secValue={
                        value:"Select",
                        label:"Select"
                    }
                    sourceArrayVal.unshift( secValue );
                }

                if (this.state.showNewPlatformPage !== true) {
                    for (i = 0; i < this.state.responseSource.length; i++) {
                        let destinationObj={
                            value: this.state.responseSource[i].ResponseSourceName,
                            label: this.state.responseSource[i].ResponseSourceName
                        }

                        sourceArray.push(destinationObj);
                    }
                    let firstValue={
                        value:"Select",
                        label:"Select"
                    }
                    sourceArray.unshift( firstValue );
                }

            }

        }
        let filters = {
            defaultStateOpen: true,
            moreLess: true,
            inputs: [
                {id: 1, label: 'Event Type Name', type: 'text', placeholder: "Enter Event Type Name ", isBaseFilter: true},
                {id: 2, label: 'Active', type: 'dropdown', placeholder:'Select', options: [{label: 'Select', value:'Select'}, {label: 'True', value:'true'}, {label: 'False', value:'false'}], isBaseFilter: true},
                {id: 3, label: "Created From", type: 'date-mon-sun', noDateOption: false, isBaseFilter: true},
                {id: 4, label: "Created To", type: 'date-mon-sun', noDateOption: false, isBaseFilter: true},
                {id: 5, label: 'Created By', type: 'text', placeholder: "Enter Created By", isBaseFilter: false},
                {id: 6, label: 'Updated From ', type: 'date-mon-sun', noDateOption: false, isBaseFilter: false},
                {id: 7, label: 'Updated To ', type: 'date-mon-sun', noDateOption: false, isBaseFilter: false},
                {id: 8, label: "Update By",type: 'text', placeholder: "Enter Updated By", isBaseFilter: false},
                {id: 9, label: 'Response Source', type: 'dropdown', placeholder:'Select', options: sourceArray, isBaseFilter: false},
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
                    this.state.showNewPlatformPage === true ?
                        <div>

                            <div className="grid-wrapper">
                                <div className="col-100">


                                        <div>
                                       <div className="grid-wrapper">
                                           <div className="header-group profile-template">
                                               <ul className="page-title-group">
                                                   <li>
                                                       <button className=" button-large button-transparent back-btn" onClick={this.cancelPage}>
                                                           <i className="fa fa-angle-left" aria-hidden="true"/>
                                                       </button>
                                                   </li>
                                                   <li>
                                                       <h1>Create Event</h1>
                                                   </li>
                                               </ul>
                                           </div>
                                       </div>
                                       <div className="grid-wrapper">
                                           <div className="button-group">
                                                <button type="button" className="button button-blue" onClick={this.saveNewReceiverEvent} >SAVE</button>
                                               <button type="button" className="button button-transparent" onClick={this.cancelPage}>CANCEL</button>

                                           </div>
                                       </div>
                                       <div className="grid-wrapper">
                                           <InPageDialog showDialog={this.state.showErrorValidate} type={"error"} message={"Mandatory Field cant be left blank"} closeMethod={() => this.closeDialog()}/>
                                       </div>
                                       <section className="page-container">
                                       <div className="grid-wrapper">
                                           <div className="col-25">
                                               <TextField disabled={false} readOnly={false} label={"Event Type Name"}  state={inputState} required={true} ref={(input) => {this.eventTypeName = input}}/>
                                                   {
                                                       this.state.errorEventTypeName === true?
                                                           <span className="field-label-incomplete"><i className="fas fa-times-circle text-missing-error"></i>  Event Type Name is Mandatory Field</span> : null
                                                   }
                                           </div>


                                           <div className="col-25"><span className="small-body-text">Response Source</span><span
                                               className="required-field"> *</span>
                                               <SelectionDropDownAdvanced
                                                   options={sourceArrayVal}
                                                   isDisabled={false}
                                                   isSearchable={true}
                                                   isMulti={false}
                                                   isClearable={false}
                                                   onChange={this.onChangeEventType}
                                                   ref={(selectBox) => this.eventtypesource = selectBox}
                                                   defaultValue={this.state.receiverSourceSel}/>
                                               {
                                                   this.state.errorResponseSource === true?
                                                       <span className="field-label-incomplete"><i className="fas fa-times-circle text-missing-error"></i>  Response Source is Mandatory Field</span> : null
                                               }
                                           </div>

                                       </div>




                                       </section>
                                   </div>


                                </div>
                            </div>


                            <Loader loader={this.state.loader}/>
                        </div>
                        :
                        <div>


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
                                            <h1>Event Type</h1>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <section className="page-container">
                                <div className="grid-wrapper">
                                    <div className="col-100">
                                        <div>
                                            <FilterSection data={filters} applyAction={() => this.apply()} clearAction={() => this.clear()} ref={(filters) => this.filters = filters}/>
                                        </div>
                                    </div>
                                </div>
                                <ExcelFile filename="eventType" element={<button type="button" className="button button-blue">Export to Excel</button>}>
                                    <ExcelSheet data={this.state.dataForExport} name="Receiver Event Type">
                                        <ExcelColumn label="Response Source" value="ResponseSource"/>
                                        <ExcelColumn label="Event Type Name" value="EventTypeName"/>
                                        <ExcelColumn label="Active" value="IsActive"/>
                                        <ExcelColumn label="Created Time" value="InsertedTime"/>
                                        <ExcelColumn label="Created By" value="InsertedBy"/>
                                        <ExcelColumn label="Updated Time" value="UpdatedTime"/>
                                        <ExcelColumn label="Updated By" value="UpdatedBy"/>
                                    </ExcelSheet>
                                </ExcelFile>
                                <div>
                                    <br/>
                                    <InPageDialog showDialog={this.state.showDialog} type={"success"} message={"Event Type Added Successfully"}  closeMethod={() => this.closeDialog()}/>
                                    <InPageDialog showDialog={this.state.showStatusText} type={"warning"} message={this.state.statusText} closeMethod={() => this.closeDialog()}/>
                                    <br />
                                </div>
                                <div className="grid-wrapper">
                                    <div className="col-100">
                                        <DataTable
                                            data={this.state.platformTableContent}
                                            columns={[
                                                {
                                                    headerClassName: 'data-table header',
                                                    accessor: "ResponseSource",
                                                    isStatus: false,
                                                    isHyperlink: true,
                                                    fieldHeader: "Response Source Name",
                                                    show: true

                                                },
                                                {
                                                    headerClassName: 'data-table header',
                                                    accessor: "EventTypeName",
                                                    isStatus: false,
                                                    isLink: false,
                                                    fieldHeader: "Event Type Name",
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
                                            fetchData={this.fetchConfigureData.bind(this)}
                                            tableName={"Event1ConfigureTable"}
                                            ref={(dataTable) => { this.dataTable = dataTable; }}

                                            actions={this.state.actions}
                                            height={"auto"}/>
                                    </div>
                                </div>
                            </section>
                            <Loader loader={this.state.loader}/>
                        </div>



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

class ReceiverEvent extends Component {
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
                <ReceiverformSectionEvent dataSendToApiHeader={this.props.dataSendToApiHeader}
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

export default ReceiverEvent;