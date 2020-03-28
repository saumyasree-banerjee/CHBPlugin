import React, { Component } from 'react';
import Loader from '../Common/Loader';
import {DatePickerMonSun, InPageDialog, ModalMain, SelectionDropDownAdvanced} from "damco-components";
import {Link} from 'react-router-dom';
import API from "../../../Constants/API-config";
import {Environment} from "../../../Constants/Environment"


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
            tabValueNonAttached: 'CI',
            shipmentTypeSelect: '',
            isChecked: false,
            showUpdatePlatformError: false,
            showUpdateDialog: false,
            showErrorDialog: false,
            showActivateDialog:false,
            showInactivateDialog:false,
            LineTableContent:null,
            identifiedTableContent:null,
            loader:false,
            speed:false,
            customerId:this.props.match.params.ID,
            customerResource: null,
            updatedPlatfornName: '',
            updatedPlatformCode: '',
            destinationPlatformOptions: '',
            documentTypeOptions:'',
            mergeLogicTypeOptions:'',
            newUpdateDocType:'',
            showMandatoryField:false,
            customerActive:false,
            showUpdateSection:true,
            destPlat:null,
            docPlat:null,
            branchCodeSel:null,
            shipmenntTypeSel:null,
            mergeLogicSel:null
        };
        this.updateCustomer = this.updateCustomer.bind(this);
        this.activatePlatform = this.activatePlatform.bind(this);
        this.inactivatePlatform = this.inactivatePlatform.bind(this);
        this.getCustomer = this.getCustomer.bind(this);
        this.editPlatfornName = this.editPlatfornName.bind(this);
        this.editPlatformCode = this.editPlatformCode.bind(this);

        this.addCustomerId = this.addCustomerId.bind(this);
        this.activeCustomer = this.activeCustomer.bind(this);
        this.inactiveCustomer = this.inactiveCustomer.bind(this);
        this.daysEAD = this.daysEAD.bind(this);
        this.companyEAD = this.companyEAD.bind(this);
        this.branchCode = this.branchCode.bind(this);
        this.custID = this.custID.bind(this);
        this.isActive = this.isActive.bind(this);
        this.getDateMonSun = this.getDateMonSun.bind(this);
        this.businessLogic = this.businessLogic.bind(this);
        this.fetchDestinationPlatform = this.fetchDestinationPlatform.bind(this);
        this.onChange = this.onChange.bind(this);
    }
    onChange = (id) => {
        this.setState({
            tabValueNonAttached:id
        })
    };
    onChangeConfigure = (value) => {

    }
    componentDidMount = () => {
        this.setState({
            showUpdateSection:true
        })
        this.getCustomer();
        // console.log(this.props.match.params);
    };
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
            showMandatoryField:false
        })
    }
    hideModal(){
        this.setState({
            showUpdatePlatformError: false
        })
    }
    updateColumnValue(evt) {
        this.setState({
            columnValue: evt.target.value
        });
    }
    updateInputValue(evt) {
        this.setState({
            inputValue: evt.target.value
        });
    }
    addCustomerId(evt) {
        this.setState({
            inputCustomerId: evt.target.value
        });
    }
    daysEAD(evt) {
        this.setState({
            inputDaysEAD: evt.target.value
        });
    }
    companyEAD(evt) {
        this.setState({
            inputCompanyEAD: evt.target.value
        });
    }
    branchCode(evt) {
        this.setState({
            inputBranchCode: evt.target.value
        });
    }
    custID(evt) {
        this.setState({
            inputCustID: evt.target.value
        });
    }
    isActive(evt) {
        this.setState({
            inputIsActive: evt.target.value
        });
    }
    documentType (evt) {
        this.setState({
            inputDocumentType: evt.target.value
        });
    }
    destinationPlatform (evt) {
        this.setState({
            inputDestinationPlatform: evt.target.value
        });
    }
    businessLogic (evt) {
        this.setState({
            inputBusinessLogic: evt.target.value
        });
    }
    getDateMonSun(){
        let date = this.monSun.getDate();
        this.setState({
            inputFromDate: date
        });
    }
    toggleChange = () => {
        this.setState({
            isChecked: !this.state.isChecked,
        });
        if(this.state.isChecked === false) {
            this.setState({
                tabValueNonAttached: 'BL'
            });
        }else{
            this.setState({
                tabValueNonAttached: 'CI'
            });
        }
    };
    getCustomer(){
        let self = this;
        self.setState({
            loader :true,
            showUpdateSection:false

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
                    sessionStorage.setItem("tokenDataFromAud", JSON.stringify(data));
                    if (tokenData !== '') {
                        let headers=Environment.headerValues;
                        headers.Authorization='Bearer ' + tokenData;
                        fetch(API.CUSTOMER_UPDATENEW + '/' + self.state.customerId, {
                            method: "GET",
                            headers: headers
                        }).then(function (response) {
                            return response.json();
                        }).then(function(json){
                            self.setState({customerResource: json, loader:false,
                                customerActive:json.IsActive,
                                showUpdateSection:true});
                        }).then(function (data) {
                        });
                        self.fetchDestinationPlatform(tokenData);
                        self.fetchDocumentType(tokenData);
                        self.fetchMergeLogicType(tokenData);
                    }
                });
            }
    }
    inactiveCustomer() {
        let self = this;
        self.setState({
            loader :true
        });
        let tokenData = sessionStorage.getItem("tokenDataFromAud");
        if (tokenData !== "") {
            let headers=Environment.headerValues;
            headers.Authorization='Bearer ' + tokenData;
            fetch( API.CUSTOMER_REMOVE + '/' + self.state.customerResource.ID, {
                method: "GET", // *GET, POST, PUT, DELETE, etc.
                headers: headers
            }).then(function (response) {
                if (response.status === 204 || response.status === 200) {
                    self.setState({
                        loader:false,
                        showUpdateDialog:false,
                        showErrorDialog:false,
                        showActivateDialog:false,
                        showInactivateDialog:true,
                        customerActive:false
                    });
                }

            }).then(function (data) {
            })
        }
    }
    activeCustomer() {
        let self = this;
        self.setState({
            loader :true
        });
        let tokenData = sessionStorage.getItem("tokenDataFromAud");
        if (tokenData !== "") {
            let headers=Environment.headerValues;
            headers.Authorization='Bearer ' + tokenData;
            fetch( API.CUSTOMER_ACTIVATE + '/' + self.state.customerResource.ID, {
                method: "GET", // *GET, POST, PUT, DELETE, etc.
                headers: headers
            }).then(function (response) {
                if (response.status === 204 || response.status === 200) {
                    self.setState({
                        loader:false,
                        showUpdateDialog:false,
                        showErrorDialog:false,
                        showActivateDialog:true,
                        showInactivateDialog:false,
                        customerActive:true
                    });
                }

            }).then(function (data) {

            })
        }
    }
    updateCustomer()
    {
        let self = this;
        let updateinputDaysEAD = '';
        let updateCompanyCode = '';
        let updateinputBusinessLogic = '';
        let updateBranchCode = '';
        let updateShipmentType = '';
        let updateDestinationPlatform = '';
        let updateMergeLogic = '';
        let updateDocumentTypeSelect = '';
            self.setState({
                showMandatoryField: false,
                showUpdateSection:false
            });

        self.setState({
            destPlat:this.destinationPlatformSelect.state.value,
            docPlat:this.documentTypeSelect.state.value,
            branchCodeSel:this.branchCodeSelect.state.value,
            shipmenntTypeSel:this.shipmentSelectValue.state.value,
            mergeLogicSel:this.mergeLogicSelect.state.value

        })
        let destPlatType=null;
        let docPlatType=null;
        let branchCodeType=null;
        let  shipmenntType=null;
        let mergeLogicType=null;
            if (this.state.inputDaysEAD === undefined) {
                updateinputDaysEAD = this.state.customerResource.DaystoEAD;
            } else {
                updateinputDaysEAD = this.state.inputDaysEAD;
            }
            if (this.state.inputCompanyEAD === undefined) {
                updateCompanyCode = this.state.customerResource.CompanyCode;
            } else {
                updateCompanyCode = this.state.inputCompanyEAD;
            }
            if (this.state.inputBusinessLogic === undefined) {
                updateinputBusinessLogic = this.state.customerResource.BusinessLogic;
            } else {
                updateinputBusinessLogic = this.state.inputBusinessLogic;
            }
        if(self.state.destPlat!==null) {
            destPlatType = this.state.destPlat.value;
        }
        if(self.state.docPlat!==null) {
            docPlatType = this.state.docPlat.value;
        }
        if(self.state.branchCodeSel!==null) {
            branchCodeType = this.state.branchCodeSel.value;
        }
        if(self.state.shipmenntTypeSel!==null) {
            shipmenntType = this.state.shipmenntTypeSel.value;
        }
        if(self.state.mergeLogicSel!==null) {
            mergeLogicType = this.state.mergeLogicSel.value;
        }


        if (this.branchCodeSelect.getSelection().toString() === undefined || this.branchCodeSelect.getSelection().toString() === null || this.branchCodeSelect.getSelection().toString() === '' || branchCodeType==='Select') {
                updateBranchCode = this.state.customerResource.BranchCode;
            } else {
                updateBranchCode = this.branchCodeSelect.getSelection().toString();
            }
            if (this.shipmentSelectValue.getSelection().toString() === undefined || this.shipmentSelectValue.getSelection().toString() === null || this.shipmentSelectValue.getSelection().toString() === ''|| shipmenntType==='Select') {
                updateShipmentType = this.state.customerResource.ShipmentType;
            } else {
                updateShipmentType = this.shipmentSelectValue.getSelection().toString();
            }
            if (this.destinationPlatformSelect.getSelection().toString() === undefined || this.destinationPlatformSelect.getSelection().toString() === null || this.destinationPlatformSelect.getSelection().toString() === '' || this.destinationPlatformSelect.getSelection().toString() === 'Select' || destPlatType==='Select') {
                updateDestinationPlatform = this.state.customerResource.DestinationPlatform;
            } else {
                updateDestinationPlatform = this.destinationPlatformSelect.getSelection().toString();
            }
            if (this.mergeLogicSelect.getSelection().toString() === undefined || this.mergeLogicSelect.getSelection().toString() === null || this.mergeLogicSelect.getSelection().toString() === '' || this.mergeLogicSelect.getSelection().toString() === 'Select' || mergeLogicType==='Select') {
                updateMergeLogic = this.state.customerResource.MergeLogicType;
            } else {
                updateMergeLogic = this.mergeLogicSelect.getSelection().toString();
            }
            if (this.documentTypeSelect.getSelection().toString() === undefined || this.documentTypeSelect.getSelection().toString() === null || this.documentTypeSelect.getSelection().toString() === '' || this.documentTypeSelect.getSelection().toString() === 'Select' || docPlatType==='Select') {
                updateDocumentTypeSelect = this.state.customerResource.DocumentType;
                this.setState({
                    newUpdateDocType: this.state.customerResource.DocumentType
                })
            } else {
                updateDocumentTypeSelect = this.documentTypeSelect.getSelection().toString();
                this.setState({
                    newUpdateDocType: this.documentTypeSelect.getSelection().toString()
                })
            }

        if(this.branchCodeSelect.getSelection().toString()==='Select' || this.shipmentSelectValue.getSelection().toString()==='Select'||
            this.destinationPlatformSelect.getSelection().toString()==='Select'|| this.mergeLogicSelect.getSelection().toString()==='Select'
            || this.documentTypeSelect.getSelection().toString() === 'Select' || updateinputDaysEAD === '' || updateCompanyCode === ''){
            this.setState({
                showMandatoryField:true,
                showUpdateDialog:false,
                showUpdateSection:true
            })
        }

        else {

            if (this.state.isChecked === true) {

            } else {

            }
            let dateFromConst = this.monSun.getDate();
            let dateFromConstValue = '';
            let dateCheck = Date.parse(dateFromConst.toString());
            if (isNaN(dateCheck)) {
                dateFromConstValue = this.state.customerResource.EffectiveDateFrom.slice(0, 4) + '-' + this.state.customerResource.EffectiveDateFrom.slice(5, 7) + '-' + this.state.customerResource.EffectiveDateFrom.slice(8, 10);
            } else {
                let yearConst = dateFromConst.slice(6, 10);
                let monthConst = dateFromConst.slice(3, 5);
                let daysConst = dateFromConst.slice(0, 2);
                dateFromConstValue = yearConst + '-' + monthConst + '-' + daysConst;
            }

            let dateToConst = this.monSun1.getDate();
            let dateCheckTo = Date.parse(dateToConst.toString());
            let dateToConstValue = '';
            if (isNaN(dateCheckTo)) {
                dateToConstValue = this.state.customerResource.EffectiveDateTo.slice(0, 4) + '-' + this.state.customerResource.EffectiveDateTo.slice(5, 7) + '-' + this.state.customerResource.EffectiveDateTo.slice(8, 10);
            } else {
                let yearConst = dateToConst.slice(6, 10);
                let monthConst = dateToConst.slice(3, 5);
                let daysConst = dateToConst.slice(0, 2);
                dateToConstValue = yearConst + '-' + monthConst + '-' + daysConst;
            }

            let jsonData =
                {
                    "CustomerConfigurationMergeMaps": [],
                    "DaystoEAD": updateinputDaysEAD,
                    "EffectiveDateFrom": dateFromConstValue,
                    "EffectiveDateTo": dateToConstValue,
                    "CompanyCode": updateCompanyCode,
                    "BranchCode": updateBranchCode,
                    "MergeLogicType": updateMergeLogic,
                    "DocumentType": updateDocumentTypeSelect,
                    "ShipmentType": updateShipmentType,
                    "DestinationPlatform": updateDestinationPlatform,
                    "BusinessLogic": updateinputBusinessLogic
                };
            this.setState({
                loader: true
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
                        fetch(API.CUSTOMER_UPDATE + '/' + self.state.customerId, {
                            method: "PUT",
                            body: JSON.stringify(jsonData),
                            headers: headers
                        }).then(function (response) {
                            if (response.status === 200 || response.status === 204) {
                                self.setState({
                                    loader: false,
                                    showUpdateDialog: true,
                                    showActivateDialog: false,
                                    showErrorDialog: false,
                                    showInactivateDialog: false,
                                    newUpdateDocType: updateDocumentTypeSelect
                                });
                                //Adding this below function to make the dropdown amd all values updated after user clicks on update button
                                self.getCustomer();

                            } else if (response.status === 500) {
                                self.setState({
                                    loader: false,
                                    showUpdateDialog: false,
                                    showActivateDialog: false,
                                    showErrorDialog: true,
                                    showInactivateDialog: false,
                                    showUpdateSection:true
                                });
                            }
                        }).then(function (data) {
                        })
                    }
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
                        self.setState({
                            loader:false
                        });
                        let headers=Environment.headerValues;
                        headers.Authorization='Bearer ' + tokenData;
                        fetch(API.PLATFORM_DEACTIVATE + '/' + self.state.platformID, {
                            method: "GET",
                            headers: headers
                        }).then(function (response) {
                            if (response.status === 200) {
                                self.setState({
                                    loader:false,
                                    showUpdateDialog:false,
                                    showActivateDialog:false,
                                    showInactivateDialog:true,
                                    customerActive:false
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
                    self.setState({
                        loader:false
                    });
                    let headers=Environment.headerValues;
                    headers.Authorization='Bearer ' + tokenData;
                    fetch(API.PLATFORM_ACTIVATE + '/' + self.state.platformID, {
                        method: "GET",
                        headers: headers
                    }).then(function (response) {
                        if (response.status === 200) {
                            self.setState({
                                loader:false,
                                showUpdateDialog:false,
                                showActivateDialog:true,
                                showInactivateDialog:false
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
                    destinationPlatformOptions :data,
                    loader:false
                });
            });
        }
    }
    fetchDocumentType(tokenData) {
        const self = this;
        if (tokenData !== "") {
            let headers=Environment.headerValues;
            headers.Authorization='Bearer ' + tokenData;
            fetch(API.CUSTOMER_DOCUMENT_TYPE,{
                method: "GET",
                headers: headers
            }).then(function (response) {
                return response.json();
            }).then(function (data) {
                self.setState({
                    documentTypeOptions :data,
                    loader:false
                });
            });
        }
    }
    fetchMergeLogicType(tokenData) {
        const self = this;
        if (tokenData !== "") {
            let headers=Environment.headerValues;
            headers.Authorization='Bearer ' + tokenData;
            fetch(API.CUSTOMER_MERGE_TYPE,{
                method: "GET",
                headers:headers
            }).then(function (response) {
                return response.json();
            }).then(function (data) {
                self.setState({
                    mergeLogicTypeOptions :data,
                    loader:false
                });
            });
        }
    }
    render(){
        let i;
        let self = this;
        const shimpmentTypeOptions = [
            {value: "Select", label: "Select"},
            {value: "Import", label: "Import"},

            {value: "Export", label: "Export"}
        ];
        let destinationArray = [];
        if(this.state.destinationPlatformOptions.length > 0){
            for(i = 0; i< this.state.destinationPlatformOptions.length; i++) {
                let destinationObj = {value: this.state.destinationPlatformOptions[i].PlatformName, label: this.state.destinationPlatformOptions[i].PlatformName};
                destinationArray.push(destinationObj);
            }
        }
        let destValue={
            value:"Select",
            label:"Select"
        };
        destinationArray.unshift( destValue );
        let documentTypeArray = [];
        if(this.state.documentTypeOptions.length > 0){
            for(i = 0; i< this.state.documentTypeOptions.length; i++) {
                let documentObj = {value: this.state.documentTypeOptions[i].DocTypeName, label: this.state.documentTypeOptions[i].DocTypeName};
                documentTypeArray.push(documentObj);
            }
        }
        let docTypeValue={
            value:"Select",
            label:"Select"
        };
        documentTypeArray.unshift( docTypeValue );
        let mergelogicTypeArray = [];
        if(this.state.mergeLogicTypeOptions.length > 0){
            for(i = 0; i< this.state.mergeLogicTypeOptions.length; i++) {
                let mergeLogicObj = {value: this.state.mergeLogicTypeOptions[i].ID, label: this.state.mergeLogicTypeOptions[i].MergeTypeName};
                mergelogicTypeArray.push(mergeLogicObj);
            }
        }
        let mergeLogicValue={
            value:"Select",
            label:"Select"
        };
        mergelogicTypeArray.unshift( mergeLogicValue );
        const branchCodeOptions = [{value: "Select", label: "Select"},
            {value: "001", label: "001"},
            {value: "002", label: "002"},{value: "004", label: "004"},{value: "005", label: "005"},
            {value: "011", label: "011"}];
        let selectedCustomerId = '';
        let daysToEAD = '';
        let companyCode = '';
        let branchCode = '';
        let effectiveDateFrom = '';
        let effectiveDateTo = '';
        let businessLogic = '';
        let shipmentType = '';
        let destinationPlatform = '';
        let mergeLogicType = '';
        let documentType = '';

        if(this.state.customerResource !== null) {
            for(i = 0; i< this.state.mergeLogicTypeOptions.length; i++) {
                if(this.state.customerResource.MergeLogicType === this.state.mergeLogicTypeOptions[i].ID ){
                    mergeLogicType = {label : this.state.mergeLogicTypeOptions[i].MergeTypeName};
                }
            }
            selectedCustomerId = self.state.customerResource.CustomerId;
            daysToEAD = self.state.customerResource.DaystoEAD;
            companyCode = this.state.customerResource.CompanyCode;
            branchCode = {label : this.state.customerResource.BranchCode};
            effectiveDateFrom = this.state.customerResource.EffectiveDateFrom.slice(8, 10)+ '-'+ this.state.customerResource.EffectiveDateFrom.slice(5, 7) + '-' +this.state.customerResource.EffectiveDateFrom.slice(0, 4);
            effectiveDateTo = this.state.customerResource.EffectiveDateTo.slice(8, 10)+ '-'+ this.state.customerResource.EffectiveDateTo.slice(5, 7) + '-' +this.state.customerResource.EffectiveDateTo.slice(0, 4);
            shipmentType = {label : this.state.customerResource.ShipmentType};
            destinationPlatform = {label: this.state.customerResource.DestinationPlatform};
            businessLogic = this.state.customerResource.BusinessLogic;

            // mergeLogicType = {label : this.state.customerResource.MergeLogicType};
          //  documentType = {label : this.state.customerResource.DocumentType};
            if(this.state.newUpdateDocType){
                documentType={label : this.state.newUpdateDocType}
            }
            else{
                documentType={label : this.state.customerResource.DocumentType}
            }

        }


        if(this.state.customerResource!==null && this.state.customerResource!=="" && this.state.branchCodeSel!==null ){
            if(this.state.branchCodeSel!==this.state.customerResource.BranchCode){
                let evType =this.state.branchCodeSel;
                branchCode = {
                    label: evType.label
                }
            }

        }
        if(this.state.customerResource!==null && this.state.customerResource!=="" && this.state.docPlat!==null ){
            if(this.state.docPlat!==this.state.customerResource.DocumentType){
                let evType =this.state.docPlat;
                documentType = {
                    label: evType.label
                }
            }

        }
        if(this.state.customerResource!==null && this.state.customerResource!=="" && this.state.destPlat!==null ){
            if(this.state.destPlat!==this.state.customerResource.DestinationPlatform){
                let evType =this.state.destPlat;
                destinationPlatform = {
                    label: evType.label
                }
            }

        }
        if(this.state.customerResource!==null && this.state.customerResource!=="" && this.state.shipmenntTypeSel!==null ){
            if(this.state.shipmenntTypeSel!==this.state.customerResource.ShipmentType){
                let evType =this.state.shipmenntTypeSel;
                shipmentType = {
                    label: evType.label
                }
            }

        }
        if(this.state.customerResource!==null && this.state.customerResource!=="" && this.state.mergeLogicSel!==null ){
            if(this.state.mergeLogicSel!==this.state.customerResource.MergeLogicType){
                let evType =this.state.mergeLogicSel;
                mergeLogicType = {
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
                                <Link id="backConfigure" to="/Configure">
                                    <button className=" button-large button-transparent back-btn">
                                        <i className="fa fa-angle-left" aria-hidden="true"/>
                                    </button>
                                </Link>
                            </li>
                            <li>
                                <h1>Edit Customer</h1>
                            </li>
                        </ul>
                    </div>
                </div>
                {this.state && this.state.customerResource &&
                <section className="page-container">
                    <div className="grid-wrapper">
                        <div className="button-group">
                            <button type="button" className="button button-blue" onClick={this.updateCustomer}>UPDATE
                            </button>
                            {this.state.customerActive === false ?
                                <button type="button" className="button button-transparent"

                                        onClick={this.activeCustomer}>ACTIVATE CUSTOMER</button> :
                                <button type="button" className="button button-transparent"
                                        onClick={this.inactiveCustomer}>INACTIVATE CUSTOMER</button>
                            }
                        </div>
                    </div>
                    <div>
                        <br/>
                        <InPageDialog showDialog={this.state.showUpdateDialog} type={"success"}
                                      message={"Customer updated successfully"} closeMethod={() => this.closeDialog()}/>
                        <InPageDialog showDialog={this.state.showErrorDialog} type={"error"}
                                      message={"Customer already exists"} closeMethod={() => this.closeDialog()}/>
                        <InPageDialog showDialog={this.state.showActivateDialog} type={"success"}
                                      message={"Customer activated successfully"}
                                      closeMethod={() => this.closeDialog()}/>
                        <InPageDialog showDialog={this.state.showInactivateDialog} type={"success"}
                                      message={"Customer inactivated successfully"}
                                      closeMethod={() => this.closeDialog()}/>
                        <InPageDialog showDialog={this.state.showMandatoryField} type={"error"}
                                      message={"Mandatory Field cant be left blank"} closeMethod={() => this.closeDialog()}/>
                        <br/>
                    </div>
                    {
                        this.state.showUpdateSection === true ? <div>

                            <div className="grid-wrapper">
                                <div className="col-50 child-grid-wrapper">
                                    <div className="col-50">
                                        <div className="form-group"><label>Customer Id</label>
                                            <span className="required-field"> *</span>
                                            <input className="form-control" onChange={this.addCustomerId}
                                                   defaultValue={selectedCustomerId} disabled/>
                                        </div>
                                    </div>
                                    <div className="col-50">
                                        <div className="form-group"><label>Days to EAD</label>
                                            <span className="required-field"> *</span>
                                            <input className="form-control" onChange={this.daysEAD} disabled={false}
                                                   readOnly={false} defaultValue={daysToEAD}/>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-50 child-grid-wrapper">
                                    <div className="col-50">
                                        <div className="form-group"><label>Company Code</label>
                                            <span className="required-field"> *</span>
                                            <input className="form-control" onChange={this.companyEAD} disabled={false}
                                                   readOnly={false} defaultValue={companyCode}/>
                                        </div>
                                    </div>
                                    <div className="col-50">
                                        <div></div>
                                    </div>
                                </div>
                            </div>
                            <div className="grid-wrapper">
                                <div className="col-50 child-grid-wrapper">
                                    <div className="col-50">
                                        <div className="form-group"><span className="small-body-text">Branch Code</span>
                                            <span className="required-field"> *</span>
                                            <SelectionDropDownAdvanced options={branchCodeOptions}
                                                                       isClearable={false}
                                                                       isDisabled={false}
                                                                       isSearchable={false}
                                                                       onChange={this.onChangeConfigure}
                                                                       isMulti={false}
                                                                       ref={(selectBox) => this.branchCodeSelect = selectBox}
                                                                       defaultValue={branchCode}
                                            /></div>

                                    </div>
                                    <div className="col-50">
                                        <span className="small-body-text">Effective From</span>
                                        <span className="required-field"> *</span>
                                        <DatePickerMonSun title={""} noDateOption={false}
                                                               defaultValue={effectiveDateFrom} id={"monSun"}
                                                               ref={(monSun) => {
                                                                   this.monSun = monSun
                                                               }}/>
                                    </div>
                                </div>
                                <div className="col-50 child-grid-wrapper">
                                    <div className="col-50">
                                        <span className="small-body-text">Effective To</span>
                                        <span className="required-field"> *</span>
                                        <DatePickerMonSun title={""} noDateOption={false}
                                                               defaultValue={effectiveDateTo} id={"monSun1"}
                                                               ref={(monSun) => {
                                                                   this.monSun1 = monSun
                                                               }}/>
                                    </div>
                                    <div className="col-50">
                                        <div></div>
                                    </div>
                                </div>
                            </div>
                            <div className="grid-wrapper">
                                <div className="col-50 child-grid-wrapper">
                                    <div className="col-50">
                                        <div className="form-group"><span className="small-body-text">Shipment Type</span>
                                            <span className="required-field"> *</span>
                                            <SelectionDropDownAdvanced options={shimpmentTypeOptions}
                                                                       isClearable={false}
                                                                       isDisabled={false}
                                                                       isSearchable={false}
                                                                       onChange={this.onChangeConfigure}
                                                                       isMulti={false}
                                                                       ref={(selectBox) => this.shipmentSelectValue = selectBox}
                                                                       defaultValue={shipmentType}/></div>
                                    </div>
                                    <div className="col-50">
                                        <div className="form-group"><span className="small-body-text">Destination Platform</span>
                                            <span className="required-field"> *</span>
                                            <SelectionDropDownAdvanced options={destinationArray}
                                                                       isDisabled={false}
                                                                       isSearchable={true}
                                                                       isMulti={false}
                                                                       isClearable={false}
                                                                       onChange={this.onChangeConfigure}
                                                                       ref={(selectBox) => this.destinationPlatformSelect = selectBox}
                                                                       defaultValue={destinationPlatform}/></div>
                                    </div>
                                </div>
                                <div className="col-50 child-grid-wrapper">

                                    <div className="col-50">
                                        <div className="form-group"><label>Business Logic</label><input
                                            className="form-control" onChange={this.businessLogic} disabled={false}
                                            readOnly={false} defaultValue={businessLogic}/></div>
                                    </div>
                                    <div className="col-50"></div>
                                </div>
                            </div>
                            <div className="grid-wrapper">
                                <div className="col-50 child-grid-wrapper">
                                    <div className="col-50">
                                        <div className="form-group"><span className="small-body-text">Merge Logic Type</span>
                                            <span className="required-field"> *</span>
                                            <SelectionDropDownAdvanced options={mergelogicTypeArray}
                                                                       isClearable={false}
                                                                       isDisabled={false}
                                                                       isSearchable={false}
                                                                       isMulti={false}
                                                                       onChange={this.onChangeConfigure}
                                                                       ref={(selectBox) => this.mergeLogicSelect = selectBox}
                                                                       defaultValue={mergeLogicType}/>
                                        </div>
                                    </div>
                                    <div className="col-50">
                                        <div className="form-group"><span className="small-body-text">Document Type</span>
                                            <span className="required-field"> *</span>
                                            <SelectionDropDownAdvanced options={documentTypeArray}
                                                                       isDisabled={false}
                                                                       isSearchable={true}
                                                                       isMulti={false}
                                                                       onChange={this.onChangeConfigure}
                                                                       isClearable={false}
                                                                       ref={(selectBox) => this.documentTypeSelect = selectBox}
                                                                       defaultValue={documentType}/></div>
                                    </div>
                                </div>
                                <div className="col-50 child-grid-wrapper">
                                    <div className="col-50">

                                    </div>
                                    <div className="col-50"></div>
                                </div>
                            </div>
                        </div>:null
                    }
                </section>
                }
                <Loader loader={this.state.loader} />
                <ModalMain modal={this.state.showAddPlatformError} title={"Error"} hideMethod={() => this.hideModal()} secondaryMethod={() => this.hideModal()}
                           primaryMethod={() => this.hideModal()} btnTitle1={"OK"} btnTitle2={"Cancel"}>
                    Please Add the Mandatory fields<br />Platform Code<br/> Platform Name

                </ModalMain>
            </div>
        )
    }
}

export default PlatformUpdate;