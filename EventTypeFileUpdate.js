import React, { Component } from 'react';
import Loader from '../Common/Loader';
import {InPageDialog, SelectionDropDownAdvanced} from "damco-components";
import {Link} from 'react-router-dom';
import API from "../../../Constants/API-config";
import {Environment} from "../../../Constants/Environment";


class EventTypeFileUpdate extends Component {
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
            EventId:this.props.match.params.EventTypeFileId,
            customerResource: null,
            updatedPlatfornName: '',
            updatedPlatformCode: '',
            destinationPlatformOptions: '',
            EventTypeName:this.props.match.params.FileName,
            statusText:"",
            showStatusText: false,
            eventResource:"",
            selectBoxOptions:null,
            eventTypeFilesById:null,
            FileName:this.props.match.params.FileName,
            EventType:null,
            IsActive:false,
            ResponseSource:null,
            eventTypeSel:null,
            update:false,
            fileNameBackUp:this.props.match.params.FileName

        };
        this.updateCustomer = this.updateCustomer.bind(this);
        this.activateEventType = this.activateEventType.bind(this);
        this.deactivateEventType = this.deactivateEventType.bind(this);
        this.editPlatfornName = this.editPlatfornName.bind(this);
        this.editPlatformCode = this.editPlatformCode.bind(this);


        this.deleteEventType=this.deleteEventType.bind(this);

        this.fetchDestinationPlatform = this.fetchDestinationPlatform.bind(this);
        this.FileName=this.FileName.bind(this);
        this.getEventType=this.getEventType.bind(this);
        this.getEventTypeFile=this.getEventTypeFile.bind(this);
    }
    FileName(evt) {
        this.setState({
            FileName: evt.target.value
        });

    }

    EventType(evt){
        this.setState({
            EventType: evt.target.value
        });
    }
    onChangeEventTypeFile = (value) => {

    }
    componentDidMount = () => {
        // this.getCustomer();
        // console.log(this.props.match.params);
        this.getEventType();
    };
    getEventType(){
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
                tokenData = data;
                self.getEventTypeFile(tokenData)
            });
        }
    }
    getEventTypeFile(tokenData){
        let self = this;
        let headers=Environment.headerValues;
        headers.Authorization='Bearer ' + tokenData;
        fetch(API.EVENTYPELOAD,{
            method: "GET",
            headers: headers
        }).then(function (response) {
            return response.json()
        }).then(function (data) {
            self.setState({
                selectBoxOptions:data
            });
            if (tokenData !== '') {
                let headers=Environment.headerValues;
                headers.Authorization='Bearer ' + tokenData;
                fetch(API.GETEVENTTYPEFILE + '/' + self.state.EventId, {
                    method: "GET",
                    headers: headers
                }).then(function (response) {
                    return response.json();
                }).then(function (data) {
                    self.setState({
                        eventResource:data,
                        EventType:data.EventType,
                        loader:false,
                        IsActive:data.IsActive,
                        ResponseSource:data.ResponseSource

                    });
                    if(data.IsActive==="true"){
                        self.setState({
                            IsActive:true
                        })
                    }
                    else{
                        self.setState({
                            IsActive:false
                        })
                    }
                });
            }

        });

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

        self.setState({
            loader :true,
            showUpdateDialog:false,
            showActivateDialog:false,
            showInactivateDialog:false,
            showDeleteDialog:false,
            showStatusText:false,
            showDuplicateMsg:false,
            eventTypeSel:this.eventTypeSelect.state.value,
            update:true


        });
        if(self.state.FileName){
            self.setState({
                fileNameBackUp:self.state.FileName
            })
        }
        else {
            self.setState({
                FileName:self.state.fileNameBackUp
            })
        }


        let eveType=null;
        if(self.state.eventTypeSel!==null) {
            eveType = this.state.eventTypeSel.value;


        }
        let updateEventTypeSelect= '';
        if(this.eventTypeSelect.getSelection().toString() === undefined || this.eventTypeSelect.getSelection().toString() === '') {
            updateEventTypeSelect = this.state.eventResource.EventTypeId;
        } else {
            updateEventTypeSelect = this.eventTypeSelect.getSelection().toString();
        }
        if(self.state.EventType=== '' || self.state.FileName===null || self.state.FileName==='' ||  this.eventTypeSelect.getSelection().toString()=== 'Select' || eveType==='Select'  ) {

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


                    let jsonData =
                        {
                            "EventTypeId": updateEventTypeSelect,
                            "FileName": self.state.FileName,
                            "UpdatedBy": sessionStorage.getItem('userMail'),
                            //sessionStorage.getItem('userMail'),
                            "UpdatedTime": year + '-' + month + '-' + date,
                        };
                    if (tokenData !== '') {
                        let headers=Environment.headerValues;
                        headers.Authorization='Bearer ' + tokenData;
                        //+ sessionStorage.getItem('userMail')
                        fetch(API.RECEIVER_UPDATE_EVENT_TYPE_FILE + "/"+self.state.EventId, {
                            method: "PUT",
                            body:JSON.stringify(jsonData),

                            headers: headers
                        }).then(function (response) {
                            self.setState({
                                loader :false
                            });
                            return response;



                        }).then(function (data) {

                            if(data.status===200){
                                self.setState({
                                    FileName: data.FileName,
                                    showUpdateDialog: true,
                                    loader:true,
                                    showDuplicateMsg:false,
                                    showInactivateDialog:false,
                                    showStatusText:false
                                });
                                self.getEventType();
                                self.setState({
                                    loader:false
                                })
                            }
                            if(data.status === 409 || data.status === 500){

                                self.setState({
                                    statusText:data.statusText
                                });
                                self.setState({
                                    loader:false,
                                    showUpdateDialog:false,
                                    showActivateDialog:false,
                                    showInactivateDialog:false,
                                    showDeleteDialog:false,
                                    showStatusText:true,
                                    showDuplicateMsg:false

                                });

                            }
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
                if (tokenData !== '') {
                    let headers=Environment.headerValues;
                    headers.Authorization='Bearer ' + tokenData;
                    fetch(API.DELETEEVENTFILE +'/'+ self.state.EventId, {
                        method: "DELETE",
                        headers: headers
                    }).then(function (response) {
                        if (response.status === 200) {
                            self.setState({
                                loader:false,
                                showUpdateDialog:false,
                                showActivateDialog:false,
                                showInactivateDialog:false,
                                showDeleteDialog:true,
                                showStatusText:false
                            });
                        }
                        if(response.status === 500 || response.status === 409 ){

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
                                showDuplicateMsg:false
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
            loader :true,
            showStatusText:false
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
                if (tokenData !== '') {
                    let headers=Environment.headerValues;
                    headers.Authorization='Bearer ' + tokenData;
                    fetch(API.DEACTIVATEFILE + '/' + self.state.EventId + '?user=' + sessionStorage.getItem('userMail'), {
                        method: "GET",
                        headers: headers
                    }).then(function (response) {
                        if (response.status === 200) {
                            self.setState({
                                loader:false,
                                showUpdateDialog:false,
                                showActivateDialog:false,
                                showInactivateDialog:true,
                                IsActive:false,
                                showStatusText:false
                            });
                        }
                        if(response.status === 409 || response.status === 500){

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
                                showDuplicateMsg:false,

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
                if (tokenData !== '') {
                    let headers=Environment.headerValues;
                    headers.Authorization='Bearer ' + tokenData;
                    fetch(API.ACTIVATEFILE +'/'+ self.state.EventId + '?user=' + sessionStorage.getItem('userMail'), {
                        method: "GET",
                        headers: headers
                    }).then(function (response) {
                        if (response.status === 200) {
                            self.setState({
                                loader:false,
                                showUpdateDialog:false,
                                showActivateDialog:true,
                                showInactivateDialog:false,
                                IsActive:true
                            });
                        }
                        if(response.status === 409 || response.status === 500){

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
                                showDuplicateMsg:false

                            });

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
        let eventType='';
        if(self.state.selectBoxOptions) {
            if (self.state.selectBoxOptions.length > 0) {
                for (var i = 0; i < this.state.selectBoxOptions.length; i++) {
                    let destinationObj = {
                        value: this.state.selectBoxOptions[i].EventTypeId,
                        label: this.state.selectBoxOptions[i].EventTypeName
                    };
                    selectBoxOptions.push(destinationObj);
                }
                let boxSelect={
                    value:"Select",
                    label:"Select"
                };
                selectBoxOptions.unshift( boxSelect );
            }
        }
        if(this.state.eventResource!==null && this.state.eventResource!=="") {
            eventType = {
                label: this.state.eventResource.EventType
            };
        }
        if(this.state.eventResource!==null && this.state.eventResource!=="" && this.state.eventTypeSel!==null ){
            if(this.state.eventTypeSel!==this.state.eventResource.EventType){
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
                                <h1>Edit Event Type File</h1>
                            </li>
                        </ul>
                    </div>
                </div>
                { this.state && this.state.eventResource &&

                <section className="page-container">
                    <div className="grid-wrapper">
                        <div className="button-group">
                            <button type="button" className="button button-blue" onClick={this.updateCustomer}>UPDATE
                            </button>
                            <button type="button" className="button button-transparent"
                                    onClick={this.deleteEventType}>DELETE</button>
                            {this.state.IsActive === false ?
                                <button type="button" className="button button-transparent"
                                        onClick={this.activateEventType}>ACTIVATE EVENT TYPE FILE</button> :
                                <button type="button" className="button button-transparent"
                                        onClick={this.deactivateEventType}>DEACTIVATE EVENT TYPE FILE</button>
                            }
                        </div>
                    </div>
                    <div>
                        <br/>
                        <InPageDialog showDialog={this.state.showUpdateDialog} type={"success"}
                                      message={"Event Type File Updated Successfully"} closeMethod={() => this.closeDialog()}/>
                        <InPageDialog showDialog={this.state.showActivateDialog} type={"success"}
                                      message={"Event Type File Activated Successfully"}
                                      closeMethod={() => this.closeDialog()}/>
                        <InPageDialog showDialog={this.state.showInactivateDialog} type={"success"}
                                      message={"Event Type File Inactivated Successfully"}
                                      closeMethod={() => this.closeDialog()}/>

                        <InPageDialog showDialog={this.state.showDuplicateMsg} type={"warning"}
                                      message={"Event Type File Already Exist"}
                                      closeMethod={() => this.closeDialog()}/>
                        <InPageDialog showDialog={this.state.showStatusText} type={"error"}
                                      message={this.state.statusText}
                                      closeMethod={() => this.closeDialog()}/>
                        <InPageDialog showDialog={this.state.showDeleteDialog} type={"success"}
                                      message={"Event Type File Deleted Successfully"}
                                      closeMethod={() => this.closeDialog()}/>
                        <br/>
                    </div>
                    <div className="grid-wrapper">
                        <div className="col-50 child-grid-wrapper">
                            <div className="col-50">
                                <div className="form-group"><label>File Name</label><span
                                    className="required-field"> *</span>
                                    <input className="form-control"  value={this.state.FileName} onChange={this.FileName} /> </div>


                            </div>

                            <div className="col-50">
                                <div className="form-group"><label>Resource Source </label><span
                                    className="required-field"> *</span>
                                    <input disabled={true} className="form-control"  value={this.state.ResponseSource}  /> </div>


                            </div>
                            <div className="col-50">
                                <div className="form-group"><span className="small-body-text">Event Type Name</span><span
                                    className="required-field"> *</span>
                                <SelectionDropDownAdvanced
                                    options={selectBoxOptions}
                                    isDisabled={false}
                                    isSearchable={false}
                                    isMulti={false}
                                    isClearable={false}
                                    onChange={this.onChangeEventTypeFile}
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

export default EventTypeFileUpdate;