import React, { Component } from 'react';
import Loader from '../Common/Loader';
import {InPageDialog, ModalMain} from "damco-components";
import {Link} from 'react-router-dom';
import API from "../../../Constants/API-config";

class DestinationTypeUpdate extends Component {
    constructor(props){
        super(props);

        this.state={
            showEditTranslationError: false,
            showUpdateDialog: false,
            showActivateDialog:false,
            showInactivateDialog:false,
            showDeleteDialog:false,
            showDeleteErrorDialog: false,
            LineTableContent:null,
            identifiedTableContent:null,
            loader:false,
            speed:false,
            DestinationTypeId:this.props.match.params.DestinationTypeId,
            destinationPlatformOptions: '',
            categoryOptions: '',
            translationResource: null,
            updateDestinationTypeFlag: false,
            updatedDestinationTypeValue: '',
            showDeactivateErrorDialog: false,
            showNotUpdated:false,
            notUpdateText:"",
            IsActive:false,
            translationActive:false,
            showMandatoryField: false
        }
        this.updateDestinationType = this.updateDestinationType.bind(this);
        this.activateDestinationType = this.activateDestinationType.bind(this);
        this.inactivateDestinationType = this.inactivateDestinationType.bind(this);
        this.getDestinationType = this.getDestinationType.bind(this);
        this.editDestinationTypeName = this.editDestinationTypeName.bind(this);
        this.deleteDestinationType = this.deleteDestinationType.bind(this);
    }

    componentDidMount = () => {
        this.getDestinationType();
    }
    showEditTranslationError(){
        this.setState({
            showEditTranslationError: true
        })
    }
    closeDialog(){
        this.setState({
            showUpdateDialog:false,
            showActivateDialog:false,
            showInactivateDialog:false,
            showDeleteDialog:false,
            showDeleteErrorDialog:false,
            showNotUpdated:false,
            showDeactivateErrorDialog:false,
            showMandatoryField: false


        })
    }
    hideModal(){
        this.setState({
            showEditTranslationError: false
        })
    }
    getDestinationType(){
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
                    if (tokenData !== '') {
                        fetch(API.DESTINATION_DETAILS_FROM_ID + '/' + self.state.DestinationTypeId, {
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
                        }).then(function(json){
                            self.setState({translationResource: json});
                            if(json.IsActive==="true"){
                                self.setState({
                                    IsActive:true,
                                    translationActive:true
                                })

                            }
                            else{
                                self.setState({
                                    IsActive:false,
                                    translationActive:false
                                })
                            }
                        }).then(function (data) {
                        });
                    }
                });
            }
    }
    updateDestinationType(){
        let self = this;
        self.setState({
            showNotUpdated:false,
            showMandatoryField: false
        });
        let destinationTypeName = this.state.updatedDestinationTypeValue;
        /*if(destinationTypeName === ''){
            destinationTypeName = this.state.translationResource.DestinationTypeName;
        }*/
        let date = new Date().getDate();
        let month = new Date().getMonth() + 1;
        let year = new Date().getFullYear();
        let jsonData =
            {
                "DestinationTypeId": self.state.DestinationTypeId,
                "DestinationTypeName": destinationTypeName,
                "IsActive": true,
                "InsertedBy": sessionStorage.getItem('userMail'),
                "UpdatedBy": sessionStorage.getItem('userMail'),
                "InsertedTime": year + '-' + month + '-' + date,
                "UpdatedTime": year + '-' + month + '-' + date
            }
        if(destinationTypeName=== '' ) {
            this.setState({
                loader :false,
                showMandatoryField: true
            });

        }else {
            this.setState({
                loader :true,
                showMandatoryField: false
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
                        fetch(API.DESTINATION_UPDATE + '/' + self.state.DestinationTypeId , {
                            method: "PUT",
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
                                    showUpdateDialog:true,
                                    showActivateDialog:false,
                                    showInactivateDialog:false,
                                    showNotUpdated:false,
                                    showDeactivateErrorDialog:false

                                });
                            }
                            if (response.status === 409 || response.status === 500) {
                                self.setState({
                                    loader:false,
                                    showUpdateDialog:false,
                                    showActivateDialog:false,
                                    showInactivateDialog:false,
                                    showNotUpdated:true,
                                    notUpdateText:response.statusText,
                                    showDeactivateErrorDialog:false



                                });
                            }
                        }).then(function (data) {
                        })
                    }
                });
            }
        }
    }
    inactivateDestinationType(){
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
                        fetch(API.DESTINATION_DEACTIVATE + '/' + self.state.DestinationTypeId + '?user=' + sessionStorage.getItem('userMail'), {
                            method: "GET",
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
                                    showUpdateDialog:false,
                                    showActivateDialog:false,
                                    showInactivateDialog:true,
                                    showDeleteDialog: false,
                                    showDeactivateErrorDialog:false,
                                    showNotUpdated:false,
                                    showDeleteErrorDialog:false,
                                    IsActive:false,
                                    translationActive:false

                                });
                            }else if (response.status === 409 || response.status===500) {
                                self.setState({
                                    loader:false,
                                    showUpdateDialog:false,
                                    showActivateDialog:false,
                                    showInactivateDialog:false,
                                    showDeleteDialog: false,
                                    showDeactivateErrorDialog:true,
                                    notUpdateText:response.statusText,
                                    showDeleteErrorDialog:false,
                                    showNotUpdated:false,
                                    translationActive:true
                                });
                            } else  {
                                self.setState({
                                    loader:false,
                                    showUpdateDialog:false,
                                    showActivateDialog:false,
                                    showInactivateDialog:false,
                                    showDeleteDialog: false,
                                    showDeactivateErrorDialog:false,
                                    notUpdateText:response.statusText,
                                    showDeleteErrorDialog:false,
                                    showNotUpdated:false
                                });
                            }
                        }).then(function (data) {
                        })
                    }
                });
            }
    }
    activateDestinationType(){
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
                    fetch(API.DESTINATION_ACTIVATE + '/' + self.state.DestinationTypeId + '?user=' + sessionStorage.getItem('userMail'), {
                        method: "GET",
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
                                showUpdateDialog:false,
                                showActivateDialog:true,
                                showInactivateDialog:false,
                                showDeleteDialog: false,
                                showNotUpdated:false,
                                notUpdateText:response.statusText,
                                IsActive:true,
                                translationActive:true

                            });
                        }
                        else {
                            self.setState({
                                showNotUpdated:false,
                                loader:false,
                                showUpdateDialog:false,
                                showActivateDialog:false,
                                showInactivateDialog:false,
                                showDeleteDialog: false,
                                showDeactivateErrorDialog:true,
                                notUpdateText:response.statusText,
                                showDeleteErrorDialog:false,
                                translationActive:false

                            })
                        }
                    }).then(function (data) {
                    })
                }
            });
        }
    }
    deleteDestinationType(){
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
                    fetch(API.DESTINATION_DELETE + '/' + self.state.DestinationTypeId, {
                        method: "DELETE",
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
                                showUpdateDialog:false,
                                showActivateDialog:false,
                                showInactivateDialog:false,
                                showDeleteDialog: true,
                                showNotUpdated:false,
                                showDeactivateErrorDialog:false,


                            });
                        }else{
                            self.setState({
                                loader:false,
                                showDeleteErrorDialog: true,
                                showUpdateDialog:false,
                                showActivateDialog:false,
                                showInactivateDialog:false,
                                showDeleteDialog: false,
                                notUpdateText:response.statusText,
                                showDeactivateErrorDialog:false

                            });
                        }
                    }).then(function (data) {
                    })
                }
            });
        }
    }
    editDestinationTypeName(evt) {
        let self = this;
        self.setState({
            updateDestinationTypeFlag: true,
            updatedDestinationTypeValue: evt.target.value
        });
    }

    render(){
        let destinationTypeNameValue = '';
        if(this.state.translationResource !== null) {
            destinationTypeNameValue = this.state.translationResource.DestinationTypeName;
        }

        return(
            <div>
                <div className="grid-wrapper">
                    <div className="header-group profile-template">
                        <ul className="page-title-group">
                            <li>
                                <Link id="backTranslation" to="/Receiver">
                                    <button className=" button-large button-transparent back-btn">
                                        <i className="fa fa-angle-left" aria-hidden="true"/>
                                    </button>
                                </Link>
                            </li>
                            <li>
                                <h1>Edit Destination Type</h1>
                            </li>
                        </ul>
                    </div>
                </div>
                {this.state && this.state.translationResource &&
                <section className="page-container">
                    <div className="grid-wrapper">
                        <div className="button-group">
                            <button type="button" className="button button-blue" onClick={this.updateDestinationType}>UPDATE
                            </button>
                            {this.state.translationActive === false ?
                                <button type="button" className="button button-transparent"
                                        onClick={this.activateDestinationType}>ACTIVATE DESTINATION TYPE</button> :
                                <button type="button" className="button button-transparent"
                                        onClick={this.inactivateDestinationType}>INACTIVATE DESTINATION TYPE</button>
                            }
                            <button type="button" className="button button-transparent"
                                    onClick={this.deleteDestinationType}>DELETE</button>
                        </div>
                    </div>
                    <div>
                        <br/>
                        <InPageDialog showDialog={this.state.showUpdateDialog} type={"success"}
                                      message={"Destination Type Updated Successfully"}
                                      closeMethod={() => this.closeDialog()}/>
                        <InPageDialog showDialog={this.state.showActivateDialog} type={"success"}
                                      message={"Destination Type Activated Successfully"}
                                      closeMethod={() => this.closeDialog()}/>
                        <InPageDialog showDialog={this.state.showInactivateDialog} type={"success"}
                                      message={"Destination Type Inactivated Successfully"}
                                      closeMethod={() => this.closeDialog()}/>
                        <InPageDialog showDialog={this.state.showDeleteDialog} type={"warning"}
                                      message={"Destination Type Deleted Successfully"}
                                      closeMethod={() => this.closeDialog()}/>
                        <InPageDialog showDialog={this.state.showDeleteErrorDialog} type={"error"}
                                      message={this.state.notUpdateText}
                                      closeMethod={() => this.closeDialog()}/>
                        <InPageDialog showDialog={this.state.showDeactivateErrorDialog} type={"error"}
                                      message={this.state.notUpdateText}
                                      closeMethod={() => this.closeDialog()}/>
                        <InPageDialog showDialog={this.state.showMandatoryField} type={"error"} message={"Mandatory Field cant be left blank"} closeMethod={() => this.closeDialog()}/>
                        <InPageDialog showDialog={this.state.showNotUpdated} type={"warning"}
                                      message={this.state.notUpdateText}
                                      closeMethod={() => this.closeDialog()}/>
                        <br/>
                    </div>
                    <div className="grid-wrapper">
                        <div className="col-50 child-grid-wrapper">
                            <div className="col-50">
                                <div className="form-group"><label>Destination Type Name</label><span
                                    className="required-field"> *</span>
                                    <input className="form-control" onChange={this.editDestinationTypeName} onKeyUp={this.editDestinationTypeName} defaultValue={destinationTypeNameValue}/></div>
                            </div>
                        </div>
                    </div>
                </section>
                }
                <Loader loader={this.state.loader} />
                <ModalMain modal={this.state.showEditTranslationError} title={"Error"} hideMethod={() => this.hideModal()} secondaryMethod={() => this.hideModal()}
                           primaryMethod={() => this.hideModal()} btnTitle1={"OK"} btnTitle2={"Cancel"}>
                    Please Add the Mandatory fields<br />Output Value<br/> CHB Value

                </ModalMain>
            </div>
        )
    }
}

export default DestinationTypeUpdate;