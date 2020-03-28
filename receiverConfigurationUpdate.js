import React, { Component } from 'react';
import Loader from '../Common/Loader';
import {InPageDialog, ModalMain, SelectionDropDownAdvanced} from "damco-components";
import {Link} from 'react-router-dom';
import API from "../../../Constants/API-config";
import {Environment} from "../../../Constants/Environment";

class ReceiverConfigurationUpdate extends Component {
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
            showEditTranslationError: false,
            showUpdateDialog: false,
            showWarningDialog: false,
            showActivateDialog:false,
            showInactivateDialog:false,
            LineTableContent:null,
            identifiedTableContent:null,
            loader:false,
            speed:false,
            ReceiverConfigurationID:this.props.match.params.ReceiverConfigurationID,
            methodOptions: '',
            receiverResource: null,
            updatedFileNameValue: '',
            updatedFileNameFlag: false,
            updatedCustomerCodeValue: '',
            updatedCustomerCodeFlag: false,
            updatedReceiverValue: '',
            updateReceiverFlag: false,
            updatedReceiverEmailValue: '',
            updateEmailValueFlag: false,
            updatedSubjectValue: '',
            updateSubjectFlag: false,
            receiverActive:false,
            showError:false,
            textVals:"",
            showUpdateSection:true,
            senderTypeSel:null,
            methodIDSel:null,
            pageSize:0,
            showModal:false,
            pending:true,
            existingPageSize:0

        }
        this.updateReceiver = this.updateReceiver.bind(this);
        this.activateReceiver = this.activateReceiver.bind(this);
        this.inactivateReceiver = this.inactivateReceiver.bind(this);
        this.getTranslation = this.getTranslation.bind(this);
        this.editReceiverType = this.editReceiverType.bind(this);
        this.editReceiverEmail = this.editReceiverEmail.bind(this);
        this.editCustomerCode = this.editCustomerCode.bind(this);
        this.editFileName = this.editFileName.bind(this);
        this.editSubject = this.editSubject.bind(this);
    }

    componentDidMount = () => {
        this.setState({
            showUpdateSection:true
        })

        this.getTranslation();
    }

    checkin(pending) {
        if (pending === true) {
            console.log("Pending state")
            this.setState({
                pending: false,
                loader: false,
                showModal: false,
                showUpdateSection: true
            })
            this.getTranslation();
        }
    }
    onChangeSender = (value) => {

    }

        closeDialog(){
        this.setState({
            showUpdateDialog:false,
            showActivateDialog:false,
            showInactivateDialog:false
        })
    }
    closeWarningDialog(){
        this.setState({
            showWarningDialog:false,
            showError:false

        })
    }
    hideModal(){
        this.setState({
            showEditTranslationError: false
        })
    }
    getTranslation(){
        let self = this;
        self.setState({
            loader :true,
            showUpdateSection:false

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
                        fetch(API.RECEIVER_DETAILS_FROM_ID + '/' + self.state.ReceiverConfigurationID, {
                            method: "GET",
                            headers: headers
                        }).then(function (response) {
                            return response.json();
                        }).then(function(json){
                            clearTimeout(a);
                            self.setState({receiverResource: json,
                            receiverActive:json.IsActive});
                            if(json.IsActive==="true"){
                                self.setState({
                                    receiverActive:true,
                                    loader:false,
                                    showUpdateSection:true
                                })

                            }
                            else{
                                self.setState({
                                    receiverActive:false
                                })
                            }
                            self.fetchMethodId(tokenData);
                        }).then(function (data) {
                        });
                        var a=setTimeout(() => this.checkin(self.state.pending), 10000);

                    }
                });
            }
    }
    updateReceiver(){
        let self = this;
        self.setState({
            showUpdateDialog: false,
            showActivateDialog: false,
            showInactivateDialog: false,
            showWarningDialog: false,
            loader:true
        });
        self.setState({
            senderTypeSel:this.senderCodeSelect.state.value,
            methodIDSel:this.methodIdValue.state.value

        })
        let senderType=null;
        let methodType=null
        if(self.state.senderTypeSel!==null) {
            senderType = this.state.senderTypeSel.value;
        }
        if(self.state.methodIDSel!==null) {
            methodType = this.state.methodIDSel.value;
        }
        let receiverValue = '';
        let receiverEmailValue = this.state.updatedReceiverEmailValue;
        let updatedMethodID = '';
        let updateReceiverFileName = this.state.updatedFileNameValue;
        let updatedCustomerCodeValue = this.state.updatedCustomerCodeValue;
        let updatedSubjectValue = this.state.updatedSubjectValue;
        if(receiverEmailValue === '' && this.state.updateEmailValueFlag === false) {
            receiverEmailValue = this.state.receiverResource.Receiver;
        }
        this.setState({
            loader:true
        })
        if (this.senderCodeSelect.getSelection().toString()==='Select' || this.methodIdValue.getSelection().toString() === 'Select'|| senderType==='Select' || methodType==='Select' ) {
            self.setState({
                warningMsg: 'Mandatory Field cant be left blank',
                showWarningDialog: true,
                loader:false,
                showUpdateSection:true
            });
        }


        else
            {
                self.setState({
                    loader:false
                })
            if (this.senderCodeSelect.getSelection().toString() === undefined || this.senderCodeSelect.getSelection().toString() === '') {
                receiverValue = this.state.receiverResource.ReceiverType;
            } else {
                receiverValue = this.senderCodeSelect.getSelection().toString();
            }
            if (this.methodIdValue.getSelection().toString() === undefined || this.methodIdValue.getSelection().toString() === '') {
                updatedMethodID = this.state.receiverResource.MethodId;
            } else {
                updatedMethodID = this.methodIdValue.getSelection().toString();
            }

            if (updateReceiverFileName === '' && this.state.updatedFileNameFlag === false) {
                updateReceiverFileName = this.state.receiverResource.FileName;
            }


            if (updatedCustomerCodeValue === '' && this.state.updatedCustomerCodeFlag === false) {
                updatedCustomerCodeValue = this.state.receiverResource.CustomerCode;
            }
            if (updatedSubjectValue === '' && this.state.updateSubjectFlag === false) {
                updatedSubjectValue = this.state.receiverResource.Subject;
            }
            let inputSubject = false;
            let inputCustomerCode = false;
            let inputSenderEmail = false;

            if (receiverValue === 'eMail' && updatedSubjectValue === '') {
                inputSubject = true;
            }

            if (updatedMethodID === 1 && updatedCustomerCodeValue === '') {
                inputCustomerCode = true;
            }
            const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$///eslint-disable-line
            if (receiverValue === 'eMail') {
                if (reg.test(receiverEmailValue) === true) {
                    inputSenderEmail = true;
                } else {
                    inputSenderEmail = false;
                }
            } else {
                inputSenderEmail = true;
            }
            let jsonData =
                {
                    "ReceiverConfigurationId": self.state.ReceiverConfigurationID,
                    "ReceiverType": receiverValue,
                    "Receiver": receiverEmailValue,
                    "FileName": updateReceiverFileName,
                    "Subject": updatedSubjectValue,
                    "MethodId": updatedMethodID,
                    "CustomerCode": updatedCustomerCodeValue,
                    "UpdatedBy": sessionStorage.getItem('userMail')
                };

            if (inputSenderEmail === false || receiverEmailValue === '' || updateReceiverFileName === '' || inputSubject === true || inputCustomerCode === true) {
                if (inputCustomerCode === true) {
                    self.setState({
                        warningMsg: 'Mandatory Field cant be left blank',
                        showWarningDialog: true,
                    });
                }
                if (inputSubject === true) {
                    self.setState({
                        warningMsg: 'Mandatory Field cant be left blank',
                        showWarningDialog: true,
                    });
                }
                if (updateReceiverFileName === '') {
                    self.setState({
                        warningMsg: 'Mandatory Field cant be left blank',
                        showWarningDialog: true,
                    });
                }
                if (receiverEmailValue === '') {
                    self.setState({
                        warningMsg: 'Mandatory Field cant be left blank',
                        showWarningDialog: true,
                    });
                }
                if (receiverValue === 'eMail' && inputSenderEmail === false) {
                    self.setState({
                        warningMsg: 'Mandatory Field cant be left blank',
                        showWarningDialog: true,
                    });
                }
            } else {

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
                            let controller = new AbortController();
                            fetch(API.RECEIVER_UPDATE + '/' + self.state.ReceiverConfigurationID, {
                                method: "PUT",
                                body: JSON.stringify(jsonData),
                                headers: headers
                            }).then(function (response) {
                                if (response.status === 200) {
                                    self.getTranslation();
                                    self.setState({
                                        loader: false,
                                        showUpdateDialog: true,
                                        showActivateDialog: false,
                                        showInactivateDialog: false,
                                        showUpdateSection:true
                                    });
                                }

                                    if(response.status===409 || response.status===500){
                                        self.setState({
                                            loader: false,
                                            showWarningDialog:true,
                                            showUpdateDialog: false,
                                            showActivateDialog: false,
                                            showInactivateDialog: false,
                                            warningMsg: response.statusText,
                                            showUpdateSection:true
                                        });
                                    }

                            }).then(function (data) {
                            }).catch(err => {
                                self.setState({
                                    loader: false,
                                    showError:true,
                                    textVals:"Some Error in Updating"
                                });


                                controller.abort();
                                alert(err,'-TOKEN_NUMBER');
                            });
                        }
                    });
                }
            }
        }
    }
    inactivateReceiver(){
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
                        fetch(API.RECEIVER_DEACTIVATE + '/' + self.state.ReceiverConfigurationID+ '?user=' + sessionStorage.getItem('userMail'), {
                            method: "GET",
                            headers: headers
                        }).then(function (response) {
                            if (response.status === 200 || response.status === 204) {
                                self.setState({
                                    loader:false,
                                    showUpdateDialog:false,
                                    showActivateDialog:false,
                                    showInactivateDialog:true,
                                    receiverActive:false
                                });
                            }
                        }).then(function (data) {
                        })
                    }
                });
            }
    }
    activateReceiver(){
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
                    fetch(API.RECEIVER_ACTIVATE + '/' + self.state.ReceiverConfigurationID + '?user=' + sessionStorage.getItem('userMail') , {
                        method: "GET",
                        headers: headers
                    }).then(function (response) {
                        if (response.status === 200 || response.status === 204) {
                            self.setState({
                                loader:false,
                                showUpdateDialog:false,
                                showActivateDialog:true,
                                showInactivateDialog:false,
                                receiverActive:true
                            });
                        }
                    }).then(function (data) {
                    })
                }
            });
        }
    }
    editReceiverType(evt) {
        let self = this;
        self.setState({
            updateReceiverFlag:true,
            updatedReceiverValue: evt.target.value
        });
    }
    editReceiverEmail(evt) {
        let self = this;
        self.setState({
            updateEmailValueFlag: true,
            updatedReceiverEmailValue: evt.target.value
        });
    }
    editFileName(evt) {
        let self = this;
        self.setState({
            updatedFileNameFlag: true,
            updatedFileNameValue: evt.target.value
        });
    }
    editCustomerCode(evt) {
        let self = this;
        self.setState({
            updatedCustomerCodeFlag:true,
            updatedCustomerCodeValue: evt.target.value
        });
    }
    editSubject(evt) {
        let self = this;
        self.setState({
            updateSubjectFlag: true,
            updatedSubjectValue: evt.target.value
        });
    }
    fetchMethodId(tokenData) {
        const self = this;
        if (tokenData !== "") {
            let headers=Environment.headerValues;
            headers.Authorization='Bearer ' + tokenData;
            fetch(API.RECEIVER_LOAD_PROCESSING_TYPE,{
                method: "GET",
                headers: headers
            }).then(function (response) {
                return response.json();
            }).then(function (data) {
                self.setState({
                    methodOptions :data
                });
            });
        }
    }
    render(){
        let receiverTypeValue = '';
        let receiverEmailValue = '';
        let receiverFileNameValue = '';
        let subjectValue = '';
        let customerCodeValue ='';
        let methodValue = '';
        let methodIdArray = [];
        let senderTypeArray = [{value:"Select", label:"Select"},{value:"sFTP", label:"sFTP"},{value:"eMail", label:"eMail"}];
        if(this.state.methodOptions.length > 0){
            for(var k = 0; k< this.state.methodOptions.length; k++) {
                let categoryObj = {value: this.state.methodOptions[k].ID, label: this.state.methodOptions[k].Type};
                methodIdArray.push(categoryObj);
            }
        }
        let methodIdValue={
            value:"Select",
            label:"Select"
        }
        methodIdArray.unshift( methodIdValue );
        if(this.state.receiverResource !== null) {
            receiverTypeValue = {label : this.state.receiverResource.ReceiverType};
            receiverEmailValue = this.state.receiverResource.Receiver;
            receiverFileNameValue = this.state.receiverResource.FileName;
            customerCodeValue = this.state.receiverResource.CustomerCode;
            subjectValue = this.state.receiverResource.Subject;
            methodValue = {label : this.state.receiverResource.Type};
        }
        if(this.state.receiverResource!==null && this.state.receiverResource!=="" && this.state.senderTypeSel!==null ){
            if(this.state.senderTypeSel!==this.state.receiverResource.receiverTypeValue){
                let evType =this.state.senderTypeSel;
                receiverTypeValue = {
                    label: evType.label
                }
            }

        }
        if(this.state.receiverResource!==null && this.state.receiverResource!=="" && this.state.methodIDSel!==null ){
            if(this.state.methodIDSel!==this.state.receiverResource.methodValue){
                let evType =this.state.methodIDSel;
                methodValue = {
                    label: evType.label
                }
            }

        }

        return(
            <div>
                <div className="grid-wrapper">
                    <div className="header-group profile-template">
                        <ul className="page-title-group">
                            <li>
                                <Link id="backSenderConfiguration" to="/senderConfiguration">
                                    <button className=" button-large button-transparent back-btn">
                                        <i className="fa fa-angle-left" aria-hidden="true"/>
                                    </button>
                                </Link>
                            </li>
                            <li>
                                <h1>Edit Sender Configuration</h1>
                            </li>
                        </ul>
                    </div>
                </div>
                {this.state && this.state.receiverResource &&
                <section className="page-container">
                    <div className="grid-wrapper">
                        <div className="button-group">
                            <button type="button" className="button button-blue" onClick={this.updateReceiver}>UPDATE
                            </button>
                            {this.state.receiverActive === false ?
                                <button type="button" className="button button-transparent"
                                        onClick={this.activateReceiver}>ACTIVATE SENDER</button> :
                                <button type="button" className="button button-transparent"
                                        onClick={this.inactivateReceiver}>INACTIVATE SENDER</button>
                            }
                        </div>
                    </div>
                    <div>
                        <br/>
                        <InPageDialog showDialog={this.state.showUpdateDialog} type={"success"}
                                      message={"Sender updated successfully"}
                                      closeMethod={() => this.closeDialog()}/>
                        <InPageDialog showDialog={this.state.showActivateDialog} type={"success"}
                                      message={"Sender activated successfully"}
                                      closeMethod={() => this.closeDialog()}/>
                        <InPageDialog showDialog={this.state.showInactivateDialog} type={"success"}
                                      message={"Sender inactivated successfully"}
                                      closeMethod={() => this.closeDialog()}/>
                        <InPageDialog showDialog={this.state.showWarningDialog} type={"error"}
                                      message={this.state.warningMsg}
                                      closeMethod={() => this.closeWarningDialog()}/>
                        <InPageDialog showDialog={this.state.showError} type={"warning"}
                                      message={this.state.textVals}
                                      closeMethod={() => this.closeWarningDialog()}/>

                        <br/>
                    </div>
                    {
                    this.state.showUpdateSection === true?
                    <div className="grid-wrapper">
                        <div className="grid-wrapper">
                            <div className="col-50 child-grid-wrapper">
                                <div className="col-50 form-group"><label>Sender Type</label><span
                                    className="required-field"> *</span>
                                    <SelectionDropDownAdvanced options={senderTypeArray}
                                                               isClearable={false}
                                                               isDisabled={false}
                                                               isSearchable={false}
                                                               isMulti={false}
                                                               onChange={this.onChangeSender}
                                                               ref={(selectBox) => this.senderCodeSelect = selectBox}
                                                               defaultValue={receiverTypeValue}
                                    /></div>
                                <div className="col-50">
                                    <div className="form-group"><label>Sender Details (email address for eMail)</label><span
                                        className="required-field"> *</span><div className="form-group"></div>
                                        <input className="form-control" onChange={this.editReceiverEmail} onKeyUp={this.editReceiverEmail} defaultValue={receiverEmailValue} /></div>
                                </div>
                                <div className="col-50">
                                    <div className="form-group"><label>File Name</label><span
                                        className="required-field"> *</span><div className="form-group"></div>
                                        <input className="form-control" onChange={this.editFileName} onKeyUp={this.editFileName} defaultValue={receiverFileNameValue} /></div>
                                </div>
                            </div>
                        </div>
                        <div className="col-50 child-grid-wrapper">
                            <div className="col-50">
                                <div className="form-group"><label>Subject</label><div className="form-group"></div>
                                    <input className="form-control" onChange={this.editSubject} onKeyUp={this.editSubject} defaultValue={subjectValue} /></div>
                            </div>
                            <div className="col-50">
                                <div className="form-group"><label>Customer Code</label><div className="form-group"></div>
                                    <input className="form-control" onChange={this.editCustomerCode} onKeyUp={this.editCustomerCode} defaultValue={customerCodeValue} /></div>
                            </div>
                            <div className="col-50">
                                <div className="form-group"><label>Method Id</label><span
                                    className="required-field"> *</span>
                                    <SelectionDropDownAdvanced options={methodIdArray}
                                                               isClearable={false}
                                                               isDisabled={false}
                                                               isSearchable={false}
                                                               onChange={this.onChangeSender}
                                                               isMulti={false}
                                                               ref={(selectBox) => this.methodIdValue = selectBox}
                                                               defaultValue={methodValue}/></div>
                            </div>
                        </div>
                    </div>:null
                    }

                </section>
                }
                <Loader loader={this.state.loader} />
                <ModalMain modal={this.state.showEditTranslationError} title={"Error"} hideMethod={() => this.hideModal()} secondaryMethod={() => this.hideModal()}
                           primaryMethod={() => this.hideModal()} btnTitle1={"OK"} btnTitle2={"Cancel"}>
                    Please Add the Mandatory fields<br />Receiver Value<br/> Receiver Email

                </ModalMain>
            </div>
        )
    }
}

export default ReceiverConfigurationUpdate;