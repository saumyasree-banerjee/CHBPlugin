import React, { Component } from 'react';
import Loader from '../Common/Loader';
import {InPageDialog, ModalMain} from "damco-components";
import {Link} from 'react-router-dom';
import API from "../../../Constants/API-config";
import {Environment} from "../../../Constants/Environment";

class PlatformUpdate extends Component {
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
            showUpdatePlatformError: false,
            showUpdateDialog: false,
            showActivateDialog:false,
            showInactivateDialog:false,
            showWarningDialog:false,
            LineTableContent:null,
            identifiedTableContent:null,
            loader:false,
            speed:false,
            platformID:this.props.match.params.PlatformID,
            platformResource: null,
            updatedPlatfornName: '',
            updatedPlatformCode: '',
            updatePlatformFlag: false,
            updatePlatCodeFlag: false,
            platformActive:false,
            IsActive:false,
            showErrorfunction:false,
            showMandatoryField: false
        }
        this.updatePlatform = this.updatePlatform.bind(this);
        this.activatePlatform = this.activatePlatform.bind(this);
        this.inactivatePlatform = this.inactivatePlatform.bind(this);
        this.getPlatform = this.getPlatform.bind(this);
        this.editPlatfornName = this.editPlatfornName.bind(this);
        this.editPlatformCode = this.editPlatformCode.bind(this);
    }

    componentDidMount = () => {
        this.setState({
            showErrorfunction:false
        })
        this.getPlatform();
    }
    showUpdatePlatformError(){
        this.setState({
            showUpdatePlatformError: true
        })
    }
    closeDialog(){
        this.setState({
            showUpdateDialog:false,
            showActivateDialog:false,
            showInactivateDialog:false,
            showErrorfunction:false,
            showMandatoryField: false
        })
    }
    hideModal(){
        this.setState({
            showUpdatePlatformError: false
        })
    }
    getPlatform(){
        let self = this;
        self.setState({
            loader:true,
            showErrorfunction:false
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
                if (tokenData !== '') {
                    let headers=Environment.headerValues;
                    headers.Authorization='Bearer ' + tokenData;
                    fetch(API.PLATFORM_DETAILS_FROM_ID + '/' + self.state.platformID, {
                        method: "GET",
                        headers: headers
                    }).then(function (response) {
                        return response.json();
                    }).then(function(json){
                        self.setState({
                            platformResource: json,
                            loader:false,
                            showErrorfunction:false

                        });

                        //new

                        let activatedStatus=self.state.platformResource.IsActive;
                        self.setState({
                            translationActive:activatedStatus,
                            loader:false,

                        })
                        if(json.IsActive==="true"){
                            self.setState({
                                IsActive:true
                            })

                        }
                        else{
                            self.setState({
                                IsActive:false
                            })
                        }

                        ////


                    }).then(function (data) {
                    });
                }
            })

        }
    }
    updatePlatform(){
        let self = this;
        self.closeDialog();
        let platformName = this.state.updatedPlatfornName;
        let platformCode = this.state.updatedPlatformCode;
        if(platformCode === '' && this.state.updatePlatCodeFlag === false) {
            platformCode = this.state.platformResource.Platformcode;
        }
        if(platformName === ''&& this.state.updatePlatformFlag === false) {
            platformName = this.state.platformResource.PlatformName;
        }
        let jsonData =
            {
                "PlatformName": platformName,
                "PlatformCode": platformCode,
                "IsActive": true,
                "UpdatedBy": sessionStorage.getItem('userMail'),
                "TranslationCodes": [
                ]
            }
        if(platformName=== '' || platformCode === '' ) {
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
                        fetch(API.PLATFORM_UPDATE + '/' + self.state.platformID, {
                            method: "PUT",
                            body: JSON.stringify(jsonData),
                            headers: headers
                        }).then(function (response) {
                            if (response.status === 200) {
                                self.setState({
                                    loader:false,
                                    showUpdateDialog:true,
                                    showActivateDialog:false,
                                    showInactivateDialog:false,
                                    showWarningDialog:false,

                                });
                            } else if (response.status === 409) {
                                self.setState({
                                    loader:false,
                                    showUpdateDialog:false,
                                    showActivateDialog:false,
                                    showInactivateDialog:false,
                                    showWarningDialog:true
                                });

                            }
                            else if (response.status === 400) {
                                self.setState({
                                    loader:false,
                                    showUpdateDialog:false,
                                    showActivateDialog:false,
                                    showInactivateDialog:false,
                                    showWarningDialog:false,
                                    showErrorfunction:true
                                });

                            }

                        }).then(function (data) {
                        })
                    }
                }).catch(err => {
                    self.setState({
                        loader: false

                    });
                });
            }
        }
    }
    inactivatePlatform(){
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
                    fetch(API.PLATFORM_DEACTIVATE + '/' + self.state.platformID+ '?user=' + sessionStorage.getItem('userMail'), {
                        method: "GET",
                        headers: headers
                    }).then(function (response) {
                        if (response.status === 200 || response.status === 204) {
                            self.setState({
                                loader:false,
                                showUpdateDialog:false,
                                showActivateDialog:false,
                                showInactivateDialog:true,
                                platformActive:false,
                                IsActive:false
                            });
                        }
                       else
                           {
                               self.setState({
                                   loader:false,
                                   showUpdateDialog:false,
                                   showActivateDialog:false,
                                   showInactivateDialog:false,
                                   platformActive:false,
                                   IsActive:true

                               });

                        }
                    }).then(function (data) {
                    })
                }
            });
        }
    }
    activatePlatform(){
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

                    fetch(API.PLATFORM_ACTIVATE + '/' + self.state.platformID + '?user=' + sessionStorage.getItem('userMail'), {
                        method: "GET",
                        headers: headers
                    }).then(function (response) {
                        if (response.status === 200 || response.status === 204) {
                            self.setState({
                                loader:false,
                                showUpdateDialog:false,
                                showActivateDialog:true,
                                showInactivateDialog:false,
                                platformActive:true,
                                IsActive:true
                            });
                        }
                        else {
                            self.setState({
                                loader:false,
                                showUpdateDialog:false,
                                showActivateDialog:true,
                                showInactivateDialog:false,
                                platformActive:false,
                                IsActive:false

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
            updatePlatformFlag: true,
            updatedPlatfornName: evt.target.value
        });
    }
    editPlatformCode(evt) {
        let self = this;
        self.setState({
            updatePlatCodeFlag: true,
            updatedPlatformCode: evt.target.value
        });
    }
    render(){
        let platformName = '';
        let platformCode = '';
        if(this.state.platformResource !== null) {
            platformName = this.state.platformResource.PlatformName;
            platformCode = this.state.platformResource.Platformcode;
        }
        return(
            <div>
                <div className="grid-wrapper">
                    <div className="header-group profile-template">
                        <ul className="page-title-group">
                            <li>
                                <Link id="backPlatform" to="/Platform">
                                    <button className=" button-large button-transparent back-btn">
                                        <i className="fa fa-angle-left" aria-hidden="true"/>
                                    </button>
                                </Link>
                            </li>
                            <li>
                                <h1>Edit Platform</h1>
                            </li>
                        </ul>
                    </div>
                </div>
                <section className="page-container">
                    <div className="grid-wrapper">
                        <div className="button-group">
                            <button type="button" className="button button-blue" onClick={this.updatePlatform}>UPDATE</button>
                            {
                                (this.state.IsActive === false )?
                                <button type="button" className="button button-transparent"
                                        onClick={this.activatePlatform}>ACTIVATE PLATFORM</button> :
                                <button type="button" className="button button-transparent"
                                        onClick={this.inactivatePlatform}>INACTIVATE PLATFORM</button>
                            }
                        </div>
                    </div>
                    <div>
                        <br/>
                        <InPageDialog showDialog={this.state.showUpdateDialog} type={"success"} message={"Platform updated successfully"} closeMethod={() => this.closeDialog()}/>
                        <InPageDialog showDialog={this.state.showActivateDialog} type={"success"} message={"Platform activated successfully"} closeMethod={() => this.closeDialog()}/>
                        <InPageDialog showDialog={this.state.showInactivateDialog} type={"success"} message={"Platform inactivated successfully"} closeMethod={() => this.closeDialog()}/>
                        <InPageDialog showDialog={this.state.showWarningDialog} type={"warning"} message={"Platform Already Exist"} closeMethod={() => this.closeDialog()}/>
                        <InPageDialog showDialog={this.state.showErrorfunction} type={"warning"} message={"Not able to perform function "} closeMethod={() => this.closeDialog()}/>
                        <InPageDialog showDialog={this.state.showMandatoryField} type={"error"} message={"Mandatory Field cant be left blank"} closeMethod={() => this.closeDialog()}/>
                        <br />
                    </div>
                    <div className="grid-wrapper">
                        <div className="grid-wrapper">
                            <div className="col-50 child-grid-wrapper">
                                <div className="col-50">
                                    <span className="small-body-text">Platform Name</span><span className="required-field"> *</span>
                                </div>
                                <div className="col-50">
                                    <span className="small-body-text">Platform Code</span><span className="required-field"> *</span>
                                </div>
                            </div>
                        </div>
                        <div className="col-25">
                            <input className="form-control" onChange={this.editPlatfornName} onKeyUp={this.editPlatfornName} defaultValue={platformName} />
                        </div>
                        <div className="col-25">
                            <input className="form-control" onChange={this.editPlatformCode} onKeyUp={this.editPlatformCode} defaultValue={platformCode} />
                        </div>
                    </div>
                </section>
                <Loader loader={this.state.loader} />
                <ModalMain modal={this.state.showUpdatePlatformError} title={"Error"} hideMethod={() => this.hideModal()} secondaryMethod={() => this.hideModal()}
                           primaryMethod={() => this.hideModal()} btnTitle1={"OK"} btnTitle2={"Cancel"}>
                    Please add all the Mandatory fields

                </ModalMain>
            </div>
        )
    }
}

export default PlatformUpdate;