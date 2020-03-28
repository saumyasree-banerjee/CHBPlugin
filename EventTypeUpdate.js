import React, { Component } from 'react';
import Loader from '../Common/Loader';
import {InPageDialog, SelectionDropDownAdvanced} from "damco-components";
import {Link} from 'react-router-dom';
import API from "../../../Constants/API-config";
import {Environment} from "../../../Constants/Environment";

class EventTypeUpdate extends Component {
    constructor(props){
        super(props);

        this.state={
            userDataForApiHeader: {
                name: this.props.dataSendToApiHeader.name,
                email: this.props.dataSendToApiHeader.email,
                userType: this.props.dataSendToApiHeader.userType,
                defaultBeCode: this.props.dataSendToApiHeader.defaultBeCode,
                otherBeCodes: (this.props.dataSendToApiHeader.otherBeCodes)? this.props.dataSendToApiHeader.otherBeCodes.join(","):null,
                organizationName:this.props.dataSendToApiHeader.organizationName,
                applicationName:this.props.dataSendToApiHeader.applicationName,
            },
            tabValueNonAttached: 'CI',
            shipmentTypeSelect: '',
            isChecked: false,
            showUpdatePlatformError: false,
            showUpdateDialog: false,
            showDeleteDialog:false,
            showActivateDialog:false,
            showInactivateDialog:false,
            showDuplicateMsg:false,
            LineTableContent:null,
            identifiedTableContent:null,
            loader:false,
            speed:false,
            EventId:this.props.match.params.EventTypeId,
            customerResource: null,
            updatedPlatfornName: '',
            updatedPlatformCode: '',
            destinationPlatformOptions: '',
            EventTypeName:'',
            //this.props.match.params.EventTypeName,
            statusText:"",
            showStatusText: false,
            eventResource:null,
            selectBoxOptions:null,
            IsActive:false,
            eventTypeSel:null,
            update:false

        }
        this.updateCustomer = this.updateCustomer.bind(this);
        this.activateEventType = this.activateEventType.bind(this);
        this.deactivateEventType = this.deactivateEventType.bind(this);
        this.editPlatfornName = this.editPlatfornName.bind(this);
        this.editPlatformCode = this.editPlatformCode.bind(this);


        this.deleteEventType=this.deleteEventType.bind(this);

        this.fetchDestinationPlatform = this.fetchDestinationPlatform.bind(this);
        this.EventTypeName=this.EventTypeName.bind(this);
        this.getEventType=this.getEventType.bind(this);
        this.fetchSource=this.fetchSource.bind(this);
    }
    EventTypeName(evt) {
        this.setState({
            EventTypeName: evt.target.value
        });
    }
    onChangeEventType = (value) => {

    }
    componentDidMount = () => {
       // this.getCustomer();
        // console.log(this.props.match.params);
        this.setState({
            update:false,
            loader:true
        })
        this.getEventType();

    }
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
                    selectBoxOptions :data
                });
            });
        }
    }
    getEventType(){
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
                if(tokenData !== '')
                {
                    self.fetchSource(tokenData);
                }
                if (tokenData !== '') {
                    let headers=Environment.headerValues;
                    headers.Authorization='Bearer ' + tokenData;
                    fetch(API.RECEIVER_EVENT_TYPE_BY_ID + '/' + self.state.EventId, {
                        method: "GET",
                        headers: headers
                    }).then(function (response) {
                        return response.json();
                    }).then(function(json){
                        self.setState({
                            eventResource: json,
                            EventTypeName:json.EventTypeName,
                            loader:false

                        });
                        if(json.IsActive==="true"){
                            self.setState({
                                IsActive:true,
                                loader:false
                            })


                        }
                        else{
                            self.setState({
                                IsActive:false,
                                loader:false
                            })
                        }
                    }).then(function (data) {
                    });
                }
            });
        }
    }


    closeDialog(){
        this.setState({
            showUpdateDialog:false,
            showActivateDialog:false,
            showInactivateDialog:false,
            showDuplicateMsg:false,
            showDeleteDialog:false,
            showStatusText:false
        })
    }


    updateCustomer(){
        let self = this;
        console.log(this.eventTypeSelect, '1')


        self.setState({
            loader :true,
            showStatusText:false,
            eventTypeSel:this.eventTypeSelect.state.value,
            update:true


        });
        console.log(self.state.eventTypeSel, '2')
        console.log(self.eventTypeSelect.state.value, '3')
        console.log(self.eventTypeSelect.getSelection(), '4')
        console.log(self.eventTypeSelect.getSelection().toString(), '5')
        let eveType=null;
        if(self.state.eventTypeSel!==null) {
             eveType = this.state.eventTypeSel.value;


        }




        if(self.state.EventTypeName=== '' || this.eventTypeSelect.getSelection().toString() === 'Select' || eveType==='Select' ) {

            self.setState({
                statusText: "Mandatory Field cant be left blank"
            });
            self.setState({
                loader:false,
                showUpdateDialog:false,
                showActivateDialog:false,
                showInactivateDialog:false,
                showDeleteDialog:false,
                showStatusText:true
            });
            //this.showAddPlatformError();
        }else {
            self.setState({
                loader :true

            });
            let tokenData = '';
            let month = new Date().getMonth() + 1;
            let year = new Date().getFullYear();
            let updateEventTypeSelect= '';
            if(this.eventTypeSelect.getSelection().toString() === undefined || this.eventTypeSelect.getSelection().toString() === '') {
                updateEventTypeSelect = this.state.eventResource.ResponseSourceId;
            } else {
                updateEventTypeSelect = this.eventTypeSelect.getSelection().toString();
            }
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
                        loader :false
                    });
                    let date = new Date().getDate();
                    let jsonData =
                        {
                            "EventTypeName": self.state.EventTypeName,
                            "ResponseSourceId":updateEventTypeSelect,
                            "IsActive": true,
                            "UpdatedTime": year + '-' + month + '-' + date,
                            "UpdatedBy":  sessionStorage.getItem('userMail'),
                            "InsertedTime": "",
                            "InsertedBy": ""
                        };
                    if (tokenData !== '') {
                        let headers=Environment.headerValues;
                        headers.Authorization='Bearer ' + tokenData;
                        //+ sessionStorage.getItem('userMail')
                        fetch(API.RECEIVER_UPDATE_EVENT_TYPE + "/" + self.state.EventId, {
                            method: "PUT",
                            body: JSON.stringify(jsonData),
                            headers: headers
                        }).then(function (response) {
                            self.setState({
                                loader :false
                            });
                            if (response.status === 200) {
                                self.getEventType();
                                self.setState({
                                    loader:false,
                                    showUpdateDialog:true,
                                    showActivateDialog:false,
                                    showInactivateDialog:false,
                                    showDuplicateMsg:false,
                                    showStatusText:false
                                });
                            }
                            if (response.status === 500 || response.status === 409) {
                                self.setState({
                                    loader:false,
                                    showUpdateDialog:false,
                                    showActivateDialog:false,
                                    showInactivateDialog:false,
                                    showDuplicateMsg:false,
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
    deleteEventType(){

            let self = this;
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
                        fetch(API.RECEIVER_DELETE_EVENT_TYPE + '/' +self.state.EventId, {
                            method: "DELETE",
                            headers: headers
                        }).then(function (response) {
                            if (response.status === 200) {
                                self.setState({
                                    loader:false,
                                    showUpdateDialog:false,
                                    showActivateDialog:false,
                                    showInactivateDialog:false,
                                    showDeleteDialog:true

                                });
                            }
                            if(response.status === 500 || response.status === 409){


                                self.setState({
                                    loader:false,
                                    showUpdateDialog:false,
                                    showActivateDialog:false,
                                    showInactivateDialog:false,
                                    showDeleteDialog:false,
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

    deactivateEventType(){
        let self = this;
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
                    fetch(API.RECEIVER_DEACTIVATE_EVENT_TYPE + "/" + self.state.EventId + '?user=' + sessionStorage.getItem('userMail') , {
                        method: "GET",
                        headers: headers
                    }).then(function (response) {
                        if (response.status === 200) {
                            self.setState({
                                loader:false,
                                showUpdateDialog:false,
                                showActivateDialog:false,
                                showInactivateDialog:true,
                                deactivate:true,
                                IsActive:false

                            });
                        }
                        if(response.status === 500 || response.status === 409){

                            self.setState({
                                statusText:response.statusText
                            });
                            self.setState({
                                loader:false,
                                showUpdateDialog:false,
                                showActivateDialog:false,
                                showInactivateDialog:false,
                                showDeleteDialog:false,
                                showStatusText:true,
                                deactivate:false
                            });

                        }
                    }).then(function (data) {
                    })
                }
            });
        }
    }
    activateEventType(){
        let self = this;
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
                    fetch(API.RECEIVER_ACTIVATE_EVENT_TYPE+ '/' + self.state.EventId + '?user=' + sessionStorage.getItem('userMail'), {
                        method: "GET",
                        headers: headers
                    }).then(function (response) {
                        if (response.status === 200) {
                            self.setState({
                                loader:false,
                                showUpdateDialog:false,
                                showActivateDialog:true,
                                showInactivateDialog:false,
                                deactivate:false,
                                IsActive:true

                            });
                        }
                        else{
                            self.setState({
                                loader:false,
                                deactivate: true
                            })


                        }
                    }).then(function (data) {
                    })
                }
            });
        }
    }
    editPlatfornName(evt) {
        let self = this;
        self.setState({
            updatedPlatfornName: evt.target.value
        });
    }
    editPlatformCode(evt) {
        let self = this;
        self.setState({
            updatedPlatformCode: evt.target.value
        });
    }
    fetchDestinationPlatform(tokenData) {
        const self = this;
        if (tokenData !== "") {
            let headers=Environment.headerValues;
            headers.Authorization='Bearer ' + tokenData;
            fetch(API.CUSTOMER_TYPE,{
                method: "GET",
                headers: headers
            }).then(function (response) {
                return response.json();
            }).then(function (data) {
                self.setState({
                    destinationPlatformOptions :data
                });
            });
        }
    }

    render(){
        let self = this;
        let selectBoxOptions = [];
        let eventType=[];
        if(this.state.eventResource !== null) {
        }
        if(self.state.selectBoxOptions) {
            if (self.state.selectBoxOptions.length > 0) {
                for (var i = 0; i < this.state.selectBoxOptions.length; i++) {
                    let destinationObj = {
                        value: this.state.selectBoxOptions[i].ResponseSourceId,
                        label: this.state.selectBoxOptions[i].ResponseSourceName
                    };
                    selectBoxOptions.push(destinationObj);
                }
                let boxSelect={
                    value:"Select",
                    label:"Select"
                }
                selectBoxOptions.unshift( boxSelect );
            }
        }
        console.log(self.state.eventResource,"default")
        if(this.state.eventResource!==null && this.state.eventResource!=="") {
            eventType = {
                   label: this.state.eventResource.ResponseSource
               }
               console.log(eventType)
        }
        if(this.state.eventResource!==null && this.state.eventResource!=="" && this.state.eventTypeSel!==null ){
            if(this.state.eventTypeSel!==this.state.eventResource.ResponseSource){
             //   eventType = {
               //     label: this.state.eventTypeSel
                //}
                let evType =this.state.eventTypeSel
                eventType = {
                    label: evType.label
                }

                console.log(eventType)

        }
        }





        return(
            <div>
                <div className="grid-wrapper">
                    <div className="header-group profile-template">
                        <ul className="page-title-group">
                            <li>
                                <Link id="backConfigure" to="/Receiver">
                                    <button className=" button-large button-transparent back-btn">
                                        <i className="fa fa-angle-left" aria-hidden="true"/>
                                    </button>
                                </Link>
                            </li>
                            <li>
                                <h1>Edit Event Type</h1>
                            </li>
                        </ul>
                    </div>
                </div>
                {this.state && this.state.eventResource &&
                <section className="page-container">
                    <div className="grid-wrapper">
                        <div className="button-group">
                            <button type="button" className="button button-blue" onClick={this.updateCustomer}>UPDATE
                            </button>
                            <button type="button" className="button button-transparent"
                                    onClick={this.deleteEventType}>DELETE
                            </button>
                            {this.state.IsActive === false ?
                                <button type="button" className="button button-transparent"
                                        onClick={this.activateEventType}>ACTIVATE EVENT TYPE</button> :
                                <button type="button" className="button button-transparent"
                                        onClick={this.deactivateEventType}>DEACTIVATE EVENT TYPE</button>
                            }
                        </div>
                    </div>
                    <div>
                        <br/>
                        <InPageDialog showDialog={this.state.showUpdateDialog} type={"success"}
                                      message={"Event Type Updated Successfully"}
                                      closeMethod={() => this.closeDialog()}/>
                        <InPageDialog showDialog={this.state.showActivateDialog} type={"success"}
                                      message={"Event Type Activated Successfully"}
                                      closeMethod={() => this.closeDialog()}/>
                        <InPageDialog showDialog={this.state.showInactivateDialog} type={"success"}
                                      message={"Event Type Inactivated Successfully"}
                                      closeMethod={() => this.closeDialog()}/>

                        <InPageDialog showDialog={this.state.showStatusText} type={"error"}
                                      message={this.state.statusText}
                                      closeMethod={() => this.closeDialog()}/>
                        <InPageDialog showDialog={this.state.showDeleteDialog} type={"success"}
                                      message={"Event Type Deleted Successfully"}
                                      closeMethod={() => this.closeDialog()}/>


                        <br/>
                    </div>
                    <div className="grid-wrapper">
                        <div className="col-50 child-grid-wrapper">
                            <div className="col-50">
                                <div className="form-group"><label>Event Type Name</label><span
                                    className="required-field"> *</span>
                                    <input className="form-control" value={this.state.EventTypeName}
                                           onChange={this.EventTypeName}/></div>


                            </div>
                            <div className="col-50">
                                <div className="form-group"><span className="small-body-text">Response Source</span><span
                                    className="required-field"> *</span>
                                    <SelectionDropDownAdvanced
                                        options={selectBoxOptions}
                                        isDisabled={false}
                                        isSearchable={false}
                                        isMulti={false}
                                        isClearable={false}
                                        onChange={this.onChangeEventType}
                                        ref={(selectBox) => this.eventTypeSelect = selectBox}
                                        defaultValue={eventType}/>
                                </div>
                            </div>

                        </div>

                    </div>


                </section>
                }
                <Loader loader={this.state.loader} />

            </div>
        )
    }
}

export default EventTypeUpdate;