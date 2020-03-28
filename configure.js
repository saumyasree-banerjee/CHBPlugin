import React, { Component } from 'react';
import Loader from '../Common/Loader';
import API from "../../../Constants/API-config";
import {FilterSection, InPageDialog, TextField} from 'damco-components';
import {SelectionDropDownAdvanced} from 'damco-components';
import {DatePickerMonSun} from 'damco-components';
import {ModalMain} from 'damco-components';
import {DataTable} from 'damco-components';
import {Environment} from "../../../Constants/Environment"
import ReactExport from "react-export-excel";


class ConfigureSection extends Component {

  constructor(props){
      super(props);
      let tableActions = {
          primaryActionIsMoreBtn: false,
          primaryActionLabel: "Create New Customer",
          primaryAction: () => this.addNewCustomer(),
          parentContextualActions: [
              {isMoreBtn: false, label: "Edit Customer", action: () => this.tableParentContextualActionOne()}
          ]
      }
      this.state= {
          tabValueNonAttached: 'CI',
          actions: tableActions,
          statusOptions: '',
          showDialog: false,
          showExistsDialog: false,
          showAddCustomerError: false,
          isChecked: false,
          columnDataObj: [],
          showNewCustomerPage: false,
          tokenData: '',
          addNewPageHeader: 'Create New Customer',
          configureTableContent: [],
          configureColumnContent: null,
          loader: false,
          isDisabled: true,
          destinationPlatformOptions: '',
          documentTypeOptions: '',
          mergeLogicTypeOptions: '',
          showDateValidationError: false,
          textVal: "",
          ShowFillData: false,
          txtValue: "",
          showNumberError: false,
          pageSize: 0,
          SearchPageSize: 10,
          showMandatoryDocument: false,
          showNoRecordDialog: false,
          showDestDialog: false,
          showDoctDialog: false,
          showMergeDialog: false,
          showCustomerDialog: false,
          colObj: [],
          destPlat:null,
          docPlat:null,
          branchCodeSel:null,
          shipmenntTypeSel:null,
          mergeLogicSel:null,
          errorCustomerName: false,
          errorDaysToEAD: false,
          errorBranchCode: false,
          errorMergeLogic: false,
          errorDocumentType: false,
          errorDestinationPlatform: false,
          errorMonSun: false,
          errorMonSunTo: false,
          showMandatoryField: false,
          dataForExport: null,
          showErrorExportDialog: false,
          callExportExcel:true
      }
      this.AddNewPage=this.AddNewPage.bind(this);
      this.callTokenData = this.callTokenData.bind(this);
      this.customerSearchResultService = this.customerSearchResultService.bind(this);
      this.customerColumnDataService = this.customerColumnDataService.bind(this);
      this.updateColumnValue = this.updateColumnValue.bind(this);
      this.updateInputValue = this.updateInputValue.bind(this);
      this.applyButtonForSearch = this.applyButtonForSearch.bind(this);
      this.editCustomerService = this.editCustomerService.bind(this);
      this.selectRow = this.selectRow.bind(this);
      this.cancelPage = this.cancelPage.bind(this);
      this.saveCustomer = this.saveCustomer.bind(this);
      this.updateCustomer = this.updateCustomer.bind(this);
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
      this.invalidExport = this.invalidExport.bind(this);
  }
  AddNewPage(e) {
        this.setState({
            addNewPageHeader: 'Create New Customer',
            showNewCustomerPage: true});
  }
    showAddCustomerError(){
        this.setState({
            showAddCustomerError: true
        })
    }
    hideModal(){
        this.setState({
            showAddCustomerError: false
        })
    }
  componentWillMount = () => {

  }

  componentDidMount = () => {
    let self = this;
      self.setState({
          showMandatoryDocument:false,
          loader: true
      })
  }

  componentWillUnmount = () => {
  }
  invalidExport(){
        let self = this;
        self.setState({
            showErrorExportDialog:true
        })
  }
  signOut = () => {
      this.props.signOut();
  }
  onChangeConfigure = (value) => {
  }
  exportToExcelConfigureTable(tokenData,state,datalength) {
        let self = this;
        this.setState({
            showCIErrorDialog:false
        });
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
        fetch(API.CUSTOMER_RESULT + "?pageNumber=" + pagetotal + "&pageSize=" + datalength, {
            method: "POST",
            body: JSON.stringify(obj),
            headers: headers,
            signal: signal
        }).then(function (response) {
            return response.json();
        }).then(function (data) {
            var values1 = data.PluginCustomer.map((_arrayElement) => Object.assign({}, _arrayElement));
            self.setState({
                dataForExport:values1
            })
        });
    }
  /**
   * Function for loading table data
   *
   * This function is calling with set interval
   * 
   */
  addNewCustomer() {
      let selectDefault={
          value:"Select",
          label:"Select"
      }
      this.setState({
          destPlat:selectDefault,
          docPlat:selectDefault,
          branchCodeSel:selectDefault,
          shipmenntTypeSel:selectDefault,
          mergeLogicSel:selectDefault,
          showMandatoryField: false
      })
      this.selectRow();
  }
  customerSearchResultService(tokenData) {
    let self = this;
    self.setState({
        loader:false
    })
      var pagetotal=1;
    var pageSize=10
      let headers=Environment.headerValues;
    headers.Authorization='Bearer ' + tokenData;
    if (tokenData !== "") {
        fetch( API.CUSTOMER_RESULT + "?pageNumber=" + pagetotal + "&pageSize=" + pageSize, {
            method: "POST", // *GET, POST, PUT, DELETE, etc.
            body: JSON.stringify(this.state.columnDataObj),
            headers: headers,
        }).then(function (response) {
            return response.json()
        }).then(function (data) {
            self.setState(
                {
                    loader:false
                }
            )
            if (data.PluginCustomer != null) {
                data.PluginCustomer.map(item => {
                    item.CustomerId = item.CustomerId.toString();
                    item.CustomerId = [item.CustomerId, "/Configure/" + item.ID];

                     if(item.EffectiveDateFrom!== '' && item.EffectiveDateFrom!== null) {
                         item.EffectiveDateFrom = item.EffectiveDateFrom.slice(0, 4) + '-' + item.EffectiveDateFrom.slice(5, 7) + '-' + item.EffectiveDateFrom.slice(8, 10) + ' ' + item.EffectiveDateFrom.slice(11, 19);
                     }
                    if(item.EffectiveDateTo!== '' && item.EffectiveDateTo!== null) {
                        item.EffectiveDateTo = item.EffectiveDateTo.slice(0, 4) + '-' + item.EffectiveDateTo.slice(5, 7) + '-' + item.EffectiveDateTo.slice(8, 10) + ' ' + item.EffectiveDateTo.slice(11, 19);
                    }
                    return null;
                });
            }
            self.setState({
                loader: false,
                configureTableContent: data.PluginCustomer
            });           
        })
    }
};


   searchCustomerService(tokenData, state, instance) {
       let self = this;
       let pagetotal = state.page + 1;
       let jsonObj;
       self.setState({
           pageSize: state.pageSize,
           SearchPageSize: state.pageSize,
           showErrorExportDialog: false
       })
       if (self.state.colObj === []) {
           jsonObj = "[]";
       } else {
           jsonObj = self.state.colObj;
       }
       let headers = Environment.headerValues;
       headers.Authorization = 'Bearer ' + tokenData;
       if (tokenData !== "") {
           fetch(API.CUSTOMER_RESULT + "?pageNumber=" + pagetotal + "&pageSize=" + state.pageSize, {
               method: "POST",
               body: JSON.stringify(jsonObj),
               headers: headers
           }).then(function (response) {
               return response.json();
           }).then(function (data) {
               self.fetchDestinationPlatform(tokenData);
               let values1 = data.PluginCustomer.map((_arrayElement) => Object.assign({}, _arrayElement));
               let dataLength = data.TotalRecords;
               if (data.PluginCustomer != null) {
                   data.PluginCustomer.map(item => {
                       item.CustomerId = item.CustomerId.toString();
                       item.CustomerId = [item.CustomerId, "/Configure/" + item.ID]
                       if(item.EffectiveDateFrom !== '' && item.EffectiveDateFrom !== null) {
                           item.EffectiveDateFrom = item.EffectiveDateFrom.slice(0, 4) + '-' + item.EffectiveDateFrom.slice(5, 7) + '-' + item.EffectiveDateFrom.slice(8, 10) + ' ' + item.EffectiveDateFrom.slice(11, 19);
                       }
                       if(item.EffectiveDateTo !== '' && item.EffectiveDateTo !== null) {
                           item.EffectiveDateTo = item.EffectiveDateTo.slice(0, 4) + '-' + item.EffectiveDateTo.slice(5, 7) + '-' + item.EffectiveDateTo.slice(8, 10) + ' ' + item.EffectiveDateTo.slice(11, 19);
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
               if (data.PluginCustomer !== null) {
                   self.setState({
                       configureTableContent: data.PluginCustomer
                   });
               }
               if(dataLength <= Environment.defaultDownloadExcelLimit) {
                   if (self.state.callExportExcel === true) {

                       self.exportToExcelConfigureTable(tokenData, state, dataLength);
                   }

               }
           }).catch(err => {
               self.setState({
                   loader: false,
                   showCustomerDialog: true
               });
           });
       }

   }


customerColumnDataService(tokenData) {
    let self = this;
    let headers=Environment.headerValues;

    headers.Authorization='Bearer ' + tokenData;

    if (tokenData !== "") {
        fetch( API.CUSTOMER_COLUMN_DATA, {
            method: "GET", // *GET, POST, PUT, DELETE, etc.
            headers: headers
        }).then(function (response) {
            return response.json()
        }).then(function (data) {
            self.setState({
                loader: false,
                configureColumnContent: data,
            });
        })
    }
};

selectRow=(obj) =>{
    if(obj !== undefined) {
        let self= this;
        let checkState= false;
        if(obj[0].MergeLogicType === "CI-BL") {
            checkState = true;
        }
        setTimeout(() => {
            self.setState({
                addNewPageHeader: 'Edit Customer',
                isChecked: checkState
            });
        }, 10);
    }
    this.AddNewPage();
}
activeCustomer() {
    let tokenData = sessionStorage.getItem("tokenDataFromAud");
    let selectCustId = localStorage.getItem("selectedCustId");
    let headers=Environment.headerValues;
    headers.Authorization='Bearer ' + tokenData;
    if (tokenData !== "") {
        fetch( API.CUSTOMER_ACTIVATE + '/' + selectCustId, {
            method: "GET", // *GET, POST, PUT, DELETE, etc.
            headers: headers
        }).then(function (response) {
            
        }).then(function (data) {

        })
        this.setState({
            showNewCustomerPage :false

        });

        this.customerSearchResultService(sessionStorage.getItem("tokenDataFromAud"));
    } 
}
editCustomerService() {

};
callTokenData(state, instance){
       let self = this;
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
           self.searchCustomerService(data, state, instance);
       }).catch(err => {
           self.setState({
               loader: false,
           });
           alert(err)
       });
};
fetchDestinationPlatform(tokenData) {
    const self = this;
    self.setState({
        loader: false
    });
    let headers=Environment.headerValues;
    headers.Authorization='Bearer ' + tokenData;
    if (tokenData !== "") {
        fetch(API.CUSTOMER_TYPE,{
            method: "GET",
            headers: headers
        }).then(function (response) {
            return response.json();
        }).then(function (data) {
            self.fetchDocumentType(tokenData);
            self.setState({
                destinationPlatformOptions :data
            });
        }).catch(err => {
            self.setState({
                loader: false

            });
        });
    }
}
fetchDocumentType(tokenData) {
    const self = this;
    let headers=Environment.headerValues;
    headers.Authorization='Bearer ' + tokenData;
    if (tokenData !== "") {
        fetch(API.CUSTOMER_DOCUMENT_TYPE,{
            method: "GET",
            headers: headers
        }).then(function (response) {
            return response.json();
        }).then(function (data) {
            self.fetchMergeLogicType(tokenData);
            self.setState({
                documentTypeOptions :data
            });
        }).catch(err => {
            self.setState({
                loader: false,
                showDoctDialog: true
            });
        });
    }
}
fetchMergeLogicType(tokenData) {
    const self = this;
    let headers=Environment.headerValues;
    headers.Authorization='Bearer ' + tokenData;
    if (tokenData !== "") {
        fetch(API.CUSTOMER_MERGE_TYPE,{
            method: "GET",
            headers: headers
        }).then(function (response) {
            return response.json();
        }).then(function (data) {
            self.setState({
                mergeLogicTypeOptions :data,
                loader: false
            });
        }).catch(err => {
            self.setState({
                loader: false,
                showMergeDialog: true
            });
        });
    }
}
saveCustomer()
{
    let tokenData = sessionStorage.getItem("tokenDataFromAud");
    let self = this;
    self.setState(
        {
            showNumberError:false,
            showDateValidationError:false,
            textVal:"",
            txtValue:"",
            ShowFillData:false,
            showMandatoryField: false,
            loader:true
        });


    let dateFromConst = this.monSun.getDate();
    let dateFromConstValue='';
    let yearConst="";
    let monthConst="";
    let daysConst="";






    if(dateFromConst !== ''){
        yearConst = dateFromConst.slice(6, 10);
         monthConst = dateFromConst.slice(3, 5);
         daysConst = dateFromConst.slice(0, 2);
        dateFromConstValue = yearConst + '-' + monthConst+'-'+daysConst;
    }else{
        dateFromConstValue='';
    }
    let dateToConst = this.monSun1.getDate();
    let dateToConstValue='';
    let yearConstTo="";
    let monthConstTo="";
    let daysConstTo="";

    if(dateToConst !== ''){
        yearConstTo = dateToConst.slice(6, 10);
        monthConstTo= dateToConst.slice(3, 5);
        daysConstTo = dateToConst.slice(0, 2);
        dateToConstValue = yearConstTo + '-' + monthConstTo+'-'+daysConstTo;
    }else{
        dateToConstValue='';
    }
   // var a= this.destinationPlatformSelect.getSelection().toString();
    let desSelected= this.destinationPlatformSelect.state.value;
    let docSelected=this.documentTypeSelect.state.value;
    let branchSelected=this.branchCodeAddSelect.state.value;
    let shipmentSelected=this.shipmentSelectValue.state.value;
    let mergeLogicSelected=this.mergeLogicSelect.state.value;
    this.setState({
        destPlat:desSelected,
        docPlat:docSelected,
        branchCodeSel:branchSelected,
        shipmenntTypeSel:shipmentSelected,
        mergeLogicSel:mergeLogicSelected
    })

    if(this.addCustomerIdText.getValue()=== '' || dateFromConstValue === '' || dateToConstValue === '' || this.addDaysToEADText.getValue() === '' ||
       this.documentTypeSelect.getSelection().toString()===''|| this.documentTypeSelect.getSelection().toString()==='Select' ||
       this.mergeLogicSelect.getSelection().toString()===''|| this.mergeLogicSelect.getSelection().toString()==='Select'||
       this.destinationPlatformSelect.getSelection().toString()===''|| this.destinationPlatformSelect.getSelection().toString()==='Select' ||
       this.shipmentSelectValue.getSelection().toString()==='' ||  this.shipmentSelectValue.getSelection().toString()==='Select' ||
       this.branchCodeAddSelect.getSelection().toString()==='' || this.branchCodeAddSelect.getSelection().toString()==='Select' ) {
        if(this.addCustomerIdText.getValue()=== '') {
            self.setState(
                {
                    showMandatoryField: true,
                    loader:false
                });
        } else  if(this.addDaysToEADText.getValue()=== '') {
            self.setState(
                {
                    showMandatoryField: true,
                    loader:false
                });
        }
        else  if( this.branchCodeAddSelect.getSelection().toString()==='' || this.branchCodeAddSelect.getSelection().toString()==='Select') {
            self.setState(
                {
                    showMandatoryField: true,
                    loader:false
                });
        }

        else  if(dateFromConstValue=== '') {
            self.setState(
                {
                    showMandatoryField: true,
                    loader:false
                });
        }
        else  if(dateToConstValue === '') {
            self.setState(
                {
                    showMandatoryField: true,
                    loader:false
                });
        }
        else  if( this.shipmentSelectValue.getSelection().toString()==='' || this.shipmentSelectValue.getSelection().toString()==='Select') {
            self.setState(
                {
                    showMandatoryField: true,
                    loader:false
                });
        }
        else  if(this.destinationPlatformSelect.getSelection().toString()==='' || this.destinationPlatformSelect.getSelection().toString()==='Select') {
            self.setState(
                {
                    showMandatoryField: true,
                    loader:false
                });
        }
        else  if(this.mergeLogicSelect.getSelection().toString()==='' || this.mergeLogicSelect.getSelection().toString()==='Select') {
            self.setState(
                {
                    showMandatoryField: true,
                    loader:false
                });
        } else  if(this.documentTypeSelect.getSelection().toString()==='' || this.documentTypeSelect.getSelection().toString()==='Select') {
            self.setState(
                {
                    showMandatoryField: true,
                    loader:false
                });
        }

        else{
            self.setState(
                {
                    showDateValidationError: true,
                    textVal:"Please Enter the Mandatory Fields",
                    showMandatoryField: false,
                    loader:false
                });
        }
   } else {
       if (yearConstTo < yearConst) {

           self.setState(
               {
                   showDateValidationError: true,
                   textVal: "Effective Date From is exceeding Effective Date To",
                   loader: false,
                   showDialog: false,
                   showExistsDialog: false,

               }
           )
       }
       if (yearConstTo === yearConst) {
           if (monthConstTo < monthConst) {
               self.setState(
                   {
                       showDateValidationError: true,
                       textVal: "From Date is exceeding To Date",
                       loader: true,
                       showDialog: false,
                       showExistsDialog: false
                   }
               );
           }
           if (daysConstTo < daysConst) {
               self.setState(
                   {
                       showDateValidationError: true,
                       textVal: "From date is exceeding To date",
                       loader: true,
                       showDialog: false

                   });
           }
           if (monthConstTo >= monthConst) {
               if (monthConstTo === monthConst && daysConstTo > daysConst) {
                   self.setState(
                       {
                           showDateValidationError: false,
                           textVal: "",
                           loader: true,
                       }
                   );
                   console.log(this.branchCodeAddSelect.getSelection().toString(), '1');
                   var EmpSelect=this.destinationPlatformSelect.getSelection().toString();
                   if(this.destinationPlatformSelect.getSelection().toString()==='Select'){
                      EmpSelect=''
                   }
                   let jsonData =
                       {
                           "CustomerConfigurationMergeMaps": [],
                           "CustomerId": this.addCustomerIdText.getValue(),
                           "DaystoEAD": this.addDaysToEADText.getValue(),
                           "EffectiveDateFrom": dateFromConstValue,
                           "EffectiveDateTo": dateToConstValue,
                           "CompanyCode": this.addCompanyEAD.getValue(),
                           "BranchCode": this.branchCodeAddSelect.getSelection().toString(),
                           "MergeLogicType": this.mergeLogicSelect.getSelection().toString(),
                           "DocumentType": this.documentTypeSelect.getSelection().toString(),
                           "ShipmentType": this.shipmentSelectValue.getSelection().toString(),
                           "DestinationPlatform": EmpSelect,
                           "BusinessLogic": this.addBusinessLogicText.getValue(),
                           "isActive": true
                       };
                   let headers=Environment.headerValues;
                   headers.Authorization='Bearer ' + tokenData;

                   if (tokenData !== "") {
                       fetch( API.CUSTOMER_ADD, {
                           method: "POST", // *GET, POST, PUT, DELETE, etc.
                           body: JSON.stringify(jsonData),
                           headers: headers
                       }).then(function (response) {
                           self.setState({
                               loader:false
                           })
                           if (response.status === 200 || response.status === 204) {
                               self.setState({
                                   loader: false,
                                   showNewCustomerPage: false,
                                   showDialog: true,
                                   showExistsDialog: false

                               });
                           } else if (response.status === 500) {
                               self.setState({
                                   loader: false,
                                   showNewCustomerPage: true,
                                   showExistsDialog: true,
                                   showDialog: false
                               });
                           }
                       }).then(function (data) {

                       })
                       this.customerSearchResultService(sessionStorage.getItem("tokenDataFromAud"));
                   }
               }
               if (monthConstTo > monthConst) {
                   self.setState(
                       {
                           showDateValidationError: false,
                           textVal: "",
                           loader: true
                       }
                   );
                   console.log(this.branchCodeAddSelect.getSelection().toString(), '2');
                  var destPlat= this.destinationPlatformSelect.getSelection().toString();
                  if(destPlat==='Select'){
                       destPlat=''
                  }

                   let jsonData =
                       {
                           "CustomerConfigurationMergeMaps": [],
                           "CustomerId":this.addCustomerIdText.getValue(),
                           "DaystoEAD": this.addDaysToEADText.getValue(),
                           "EffectiveDateFrom": dateFromConstValue,
                           "EffectiveDateTo": dateToConstValue,
                           "CompanyCode": this.addCompanyEAD.getValue(),
                           "BranchCode": this.branchCodeAddSelect.getSelection().toString(),
                           "MergeLogicType": this.mergeLogicSelect.getSelection().toString(),
                           "DocumentType": this.documentTypeSelect.getSelection().toString(),
                           "ShipmentType": this.shipmentSelectValue.getSelection().toString(),
                           "DestinationPlatform": destPlat,
                           "BusinessLogic": this.addBusinessLogicText.getValue(),
                           "isActive": true
                       };
                   let headers=Environment.headerValues;
                   headers.Authorization='Bearer ' + tokenData;
                   if (tokenData !== "") {
                       fetch( API.CUSTOMER_ADD, {
                           method: "POST", // *GET, POST, PUT, DELETE, etc.
                           body: JSON.stringify(jsonData),
                           headers: headers
                       }).then(function (response) {
                           if (response.status === 200 || response.status === 204) {
                               self.setState({
                                   loader: false,
                                   showNewCustomerPage: false,
                                   showDialog: true,
                                   showExistsDialog: false

                               });
                           } else if (response.status === 500) {
                               self.setState({
                                   loader: false,
                                   showNewCustomerPage: true,
                                   showExistsDialog: true,
                                   showDialog: false
                               });
                           }
                       }).then(function (data) {

                       })
                       this.customerSearchResultService(sessionStorage.getItem("tokenDataFromAud"));
                   }
               }
               if (monthConstTo === monthConst && daysConstTo < daysConst) {
                   self.setState(
                       {
                           showDateValidationError: true,
                           textVal: "From Date is exceeding To Date",
                           loader: true,
                           showDialog: false,
                           showExistsDialog: false
                       }
                   );
               }
               if(monthConstTo === monthConst && daysConstTo === daysConst){
                   self.setState({
                       showDateValidationError: true,
                       textVal: "From Date is same as To Date",
                       loader: true,
                       showDialog: false,
                       showExistsDialog: false

                   })

               }
           }
       }
       if (yearConstTo > yearConst) {
           self.setState(
               {
                   showDateValidationError: false,
                   textVal: "",
                   loader: true
               }
           );
           let jsonData =
               {
                   "CustomerConfigurationMergeMaps": [],
                   "CustomerId": this.addCustomerIdText.getValue(),
                   "DaystoEAD": this.addDaysToEADText.getValue(),
                   "EffectiveDateFrom": dateFromConstValue,
                   "EffectiveDateTo": dateToConstValue,
                   "CompanyCode": this.addCompanyEAD.getValue(),
                   "BranchCode": this.branchCodeAddSelect.getSelection().toString(),
                   "MergeLogicType": this.mergeLogicSelect.getSelection().toString(),
                   "DocumentType": this.documentTypeSelect.getSelection().toString(),
                   "ShipmentType": this.shipmentSelectValue.getSelection().toString(),
                   "DestinationPlatform": this.destinationPlatformSelect.getSelection().toString(),
                   "BusinessLogic": this.addBusinessLogicText.getValue(),
                   "isActive": true
               };

           if (tokenData !== "") {
               let headers=Environment.headerValues;
               headers.Authorization='Bearer ' + tokenData;
               fetch( API.CUSTOMER_ADD, {
                   method: "POST", // *GET, POST, PUT, DELETE, etc.
                   body: JSON.stringify(jsonData),
                   headers: headers
               }).then(function (response) {
                   if (response.status === 200 || response.status === 204) {
                       self.setState({
                           loader: false,
                           showNewCustomerPage: false,
                           showDialog: true,
                           showExistsDialog: false
                       });
                   } else if (response.status === 500) {
                       self.setState({
                           loader: false,
                           showNewCustomerPage: true,
                           showExistsDialog: true,
                           showDialog: false
                       });
                   }
               }).then(function (data) {

               })
               this.customerSearchResultService(sessionStorage.getItem("tokenDataFromAud"));
           }
       }
   }
}
updateCustomer() {
    let tokenData = sessionStorage.getItem("tokenDataFromAud");
    let selectCustId = localStorage.getItem("selectedCustId");
    let isCheckedVal;
    let updateinputDaysEAD = '';
    let updateCompanyCode = '';
    let updateinputBusinessLogic = '';
    let updateBranchCode = '';
    let updateShipmentType = '';
    let updateDestinationPlatform = '';
    if (this.state.inputDaysEAD === null) {
        updateinputDaysEAD = localStorage.getItem("DaystoEAD");
    } else {
        updateinputDaysEAD = this.state.inputDaysEAD;
    }
    if (this.state.inputCompanyEAD === null) {
        updateCompanyCode = localStorage.getItem("CompanyCode");
    } else {
        updateCompanyCode = this.state.inputCompanyEAD;
    }
    if (this.state.inputBusinessLogic === null) {
        updateinputBusinessLogic = localStorage.getItem("BusinessLogic");
    } else {
        updateinputBusinessLogic = this.state.inputBusinessLogic;
    }
    if(this.branchCodeSelect.getSelection() === undefined) {
        updateBranchCode = localStorage.getItem('BranchCode');
    } else {
        updateBranchCode = this.branchCodeSelect.getSelection();
    }
    if(this.shipmentSelectValue.getSelection() === undefined) {
        updateShipmentType = localStorage.getItem('ShipmentType');
    } else {
        updateShipmentType = this.shipmentSelectValue.getSelection();
    }
    if(this.destinationPlatformSelect.getSelection() === undefined) {
        updateDestinationPlatform = localStorage.getItem('DestinationPlatform');
    } else {
        updateDestinationPlatform = this.destinationPlatformSelect.getSelection();
    }
    if(this.state.isChecked === true) {
        isCheckedVal = 2;
    } else {
        isCheckedVal = 1;
    }
    let jsonData = 
    {
        "CustomerConfigurationMergeMaps": [],
        "DaystoEAD": updateinputDaysEAD,
        "EffectiveDateFrom": "2019-05-16T12:18:20.18",
        "EffectiveDateTo": "2019-08-18T12:18:36.98",
        "CompanyCode": updateCompanyCode,
        "MergeLogicType": isCheckedVal,
        "BranchCode": updateBranchCode,
        "DocumentType": this.state.tabValueNonAttached,
        "ShipmentType": updateShipmentType,
        "DestinationPlatform": updateDestinationPlatform,
        "BusinessLogic": updateinputBusinessLogic
      };
    if (tokenData !== "") {
        let headers=Environment.headerValues;
        headers.Authorization='Bearer ' + tokenData;
        fetch( API.CUSTOMER_ADD + '/' + selectCustId, {
            method: "PUT", // *GET, POST, PUT, DELETE, etc.
            body: JSON.stringify(jsonData),
            headers: headers
        }).then(function (response) {
            
        }).then(function (data) {

        })

        setTimeout(() => {
            this.setState({
                showNewCustomerPage: false
            });
            this.customerSearchResultService(sessionStorage.getItem("tokenDataFromAud"));
        }, 50);
        this.cancelPage();
    }
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
          isChecked: !this.state.isChecked
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
    }

    applyButtonForSearch() {
        this.setState({
            columnDataObj : []
        });
        let inputColumnvalue = this.state.inputValue;
        if(inputColumnvalue === undefined){
            inputColumnvalue = '';
        }
        let columnDataObj = this.state.columnDataObj;
        let items = {
            "ColumnName": this.selectBoxNew.getSelection().toString(),
            "Operator": this.selectBox.getSelection().toString(),
            "Value1": inputColumnvalue,
            "Value2": ''
        };
        columnDataObj.push(items);
        this.customerSearchResultService(sessionStorage.getItem("tokenDataFromAud"));
    }
    cancelPage(e) {
        localStorage.removeItem("custID");
        localStorage.removeItem("selectedCustId");
        localStorage.removeItem("BranchCode");
        localStorage.removeItem("CompanyCode");
        localStorage.removeItem("DaystoEAD");
        localStorage.removeItem("EffectiveDateFrom");
        localStorage.removeItem("EffectiveDateTo");
        localStorage.removeItem("IsActive");
        localStorage.removeItem("DocumentType");
        localStorage.removeItem("ShipmentType");
        localStorage.removeItem("DestinationPlatform");
        localStorage.removeItem("BusinessLogic");
        var objCommon={
            value:"Select",
            label:"Select"
        }
        this.setState({
            showNewCustomerPage :false,
            showNumberError:false,
            showDateValidationError:false,
            textVal:"",
            ShowFillData:false,
            txtValue:"",
            showMandatoryDocument:false,
            destPlat:objCommon,
            docPlat:objCommon,
            branchCodeSel:objCommon

        });
    }
    inactiveCustomer() {
        let tokenData = sessionStorage.getItem("tokenDataFromAud");
        let selectCustId = localStorage.getItem("selectedCustId");
        if (tokenData !== "") {
            let headers=Environment.headerValues;
            headers.Authorization='Bearer ' + tokenData;
            fetch( API.CUSTOMER_REMOVE + '/' + selectCustId, {
                method: "GET", // *GET, POST, PUT, DELETE, etc.
                headers: headers
            }).then(function (response) {

            }).then(function (data) {
            })
        }
        this.setState({
            showNewCustomerPage :false
        });
        this.customerSearchResultService(sessionStorage.getItem("tokenDataFromAud"));
        this.cancelPage();
    }

    fetchConfigureData(state, instance) {
        this.setState({
            loader: true
        });
        if(typeof state.data !== undefined) {
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
        this.callTokenData(state, instance);
    }
    apply(){
        this.setState({
            loader: true,
            showExistsDialog: false,
            showDialog: false,
            showMandatoryDocument:false,
            dataForExport:null,
            showErrorExportDialog: false
        });
        let values = this.filters.getFilterValues();
        this.dataTable.table.state.page=0;
        console.log(values, ' - Customer Config Values');
        let CustomerId;
        let daysEad;
        let mergeLogicType;
        let companyCode;
        let branchCode;
        let documentType;
        let shipmentType;
        let destinationPlatform;
        let dateFrom;
        let dateTo;
        let businessLogic;
        let active;
        let dateFromConstValue='';
        let dateToConstValue='';
        if(values.length <= 4) {
            CustomerId = values[0].value;
            daysEad = values[1].value;
            mergeLogicType = values[3].value;
            companyCode = values[2].value;
        }
        if(values.length > 4)
        {
            CustomerId = values[0].value;
            daysEad = values[1].value;
            mergeLogicType = values[2].value;
            companyCode = values[3].value;
            branchCode = values[4].value;
            documentType = values[5].value;
            shipmentType = values[6].value;
            destinationPlatform = values[7].value;
            businessLogic = values[8].value;
            active = values[9].value;
            dateFrom = values[10].value;
            dateTo = values[11].value;

            if(dateFrom !== ''){
                let yearConst = dateFrom.slice(6, 10);
                let monthConst = dateFrom.slice(3, 5);
                let daysConst = dateFrom.slice(0, 2);
                dateFromConstValue = yearConst + '-' + monthConst+'-'+daysConst;
            }else{
                dateFromConstValue='';
            }

            if(dateTo !== ''){
                let yearConst = dateTo.slice(6, 10);
                let monthConst = dateTo.slice(3, 5);
                let daysConst = dateTo.slice(0, 2);
                dateToConstValue = yearConst + '-' + monthConst+'-'+daysConst;
            }else{
                dateToConstValue='';
            }
        }
        if(active === null) {
            active = '';
        }
        this.setState({
            columnDataObj : []
        });
        let columnDataObj = this.state.columnDataObj;
        let customerItem = {
            "ColumnName": 'CustomerId',
            "Operator": 'contains',
            "Value1": CustomerId,
            "Value2": ''
        };
        let daysEADItem = {
            "ColumnName": 'DaystoEAD',
            "Operator": 'equal',
            "Value1": daysEad,
            "Value2": ''
        };
        let companyCodeItem = {
            "ColumnName": 'CompanyCode',
            "Operator": 'contains',
            "Value1": companyCode,
            "Value2": ''
        };
        let mergeLogicTypeItem = {
            "ColumnName": 'MergeLogicType',
            "Operator": 'equal',
            "Value1": mergeLogicType,
            "Value2": ''
        };
        let branchCodeItem = {
            "ColumnName": 'BranchCode',
            "Operator": 'equal',
            "Value1": branchCode,
            "Value2": ''
        };
        let documentTypeItem = {
            "ColumnName": 'DocumentType',
            "Operator": 'equal',
            "Value1": documentType,
            "Value2": ''
        };
        let destinationPlatformItem = {
            "ColumnName": 'DestinationPlatform',
            "Operator": 'equal',
            "Value1": destinationPlatform,
            "Value2": ''
        };
        let shipmentTypeItem = {
            "ColumnName": 'ShipmentType',
            "Operator": 'equal',
            "Value1": shipmentType,
            "Value2": ''
        };
        let dateFromItem = {
            "ColumnName": 'EffectiveDateFrom',
            "Operator": 'greaterthan',
            "Value1": dateFromConstValue,
            "Value2": ''
        };
        let dateToItem = {
            "ColumnName": 'EffectiveDateTo',
            "Operator": 'greaterthan',
            "Value1": dateToConstValue,
            "Value2": ''
        };
        let businessLogicItem = {
            "ColumnName": 'BusinessLogic',
            "Operator": 'contains',
            "Value1": businessLogic,
            "Value2": ''
        };
        let activeItem = {
            "ColumnName": 'IsActive',
            "Operator": 'equal',
            "Value1": active,
            "Value2": ''
        };
        if(CustomerId !== '' ) {
            columnDataObj.push(customerItem);
        }
        if(daysEad !== '') {
            columnDataObj.push(daysEADItem);
        }
        if(companyCode !== '') {
            columnDataObj.push(companyCodeItem);
        }
        if(mergeLogicType !== ''&& mergeLogicType!=='Select') {
            columnDataObj.push(mergeLogicTypeItem);
        }
        if(values.length > 4) {
            if (branchCode !== '') {
                columnDataObj.push(branchCodeItem);
            }
            if (documentType !== '' && documentType!=='Select') {
                columnDataObj.push(documentTypeItem);
            }
            if (shipmentType !== '' && shipmentType!=='Select') {
                columnDataObj.push(shipmentTypeItem);
            }
            if (destinationPlatform !== '' && destinationPlatform!=='Select') {
                columnDataObj.push(destinationPlatformItem);
            }
            if (dateFrom !== '') {
                columnDataObj.push(dateFromItem);
            }
            if (dateTo !== '') {
                columnDataObj.push(dateToItem);
            }
            if (businessLogic !== '') {
                columnDataObj.push(businessLogicItem);
            }
            if (active !== '' && active!=='Select') {
                columnDataObj.push(activeItem);
            }
        }
        this.setState({
            colObj:columnDataObj
        })
        this.useTokenForConfigureSearch(columnDataObj);
    }
    useTokenForConfigureSearch(obj) {
        let self = this;
        let tokenData = '';
        if (tokenData === '') {
            const Aud = {
                "Audience": API.AUDIENCE_ID
            }
            fetch( API.TOKEN_NUMBER_URL, {
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
                self.searchConfigure(tokenData,obj);
            });
        }
    };
    searchConfigure(tokenData, obj){
        let self = this;
        let pagetotal = 1;
        var pageSize=10;
        if(self.state.pageSize>=0){
             pageSize=self.state.pageSize;
        }
        self.setState({
            loader: false
        })
        if(self.state.colObj===[]){
            obj="[]"
        }
        else
            obj=self.state.colObj;
        let headers=Environment.headerValues;

        if (tokenData !== "") {
            headers.Authorization='Bearer ' + tokenData;
            fetch(API.CUSTOMER_RESULT + "?pageNumber=" + pagetotal + "&pageSize=" + pageSize, {
                method: "POST", // *GET, POST, PUT, DELETE, etc.
                body: JSON.stringify(obj),
                headers: headers,
            }).then(function (response) {
                return response.json();
            }).then(function (data) {
                let values1 = data.PluginCustomer.map((_arrayElement) => Object.assign({}, _arrayElement));
                let dataLength = data.TotalRecords;
                if (data.PluginCustomer != null) {
                    data.PluginCustomer.map(item => {
                        item.CustomerId = item.CustomerId.toString();
                        item.CustomerId = [item.CustomerId, "/Configure/" + item.ID];
                        if(item.EffectiveDateFrom!==null && item.EffectiveDateFrom!=='') {
                            item.EffectiveDateFrom = item.EffectiveDateFrom.slice(0, 4) + '-' + item.EffectiveDateFrom.slice(5, 7) + '-' + item.EffectiveDateFrom.slice(8, 10) + ' ' + item.EffectiveDateFrom.slice(11, 19);
                        }
                        if(item.EffectiveDateTo!==null && item.EffectiveDateTo!== '') {
                            item.EffectiveDateTo = item.EffectiveDateTo.slice(0, 4) + '-' + item.EffectiveDateTo.slice(5, 7) + '-' + item.EffectiveDateTo.slice(8, 10) + ' ' + item.EffectiveDateTo.slice(11, 19);
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
                    configureTableContent: data.PluginCustomer
                });
                if(dataLength <= Environment.defaultDownloadExcelLimit) {
                    self.exportToExcelConfigureTable(tokenData, self.state, dataLength);
                } else {
                    self.setState({
                        dataForExport:null
                    })
                }
            })
        }
    };

    closeDialog(){
        if(this.state.showDateValidationError === true && this.state.showNewCustomerPage === true){
            this.setState({
                showNewCustomerPage:true
            })
        }
        this.setState({
            showDialog:false,
            showExistsDialog: false,
            showDateValidationError:false,
            showNumberError:false,
            showMandatoryDocument:false,
            showMandatoryField: false,
            showErrorExportDialog: false
        });
    }
    onTabChange = (id) => {
        this.setState({
            tabValueNonAttached:id,
            showMandatoryDocument:false
        })
    }
    clear() {
        let self=this;
        var vals={
            pageSize:10,
            page: 0,
            clear:true
        }
        self.setState({
            loader:true,
            colObj:[],
            dataForExport:null,
            showErrorExportDialog:false,
            callExportExcel:true
        })
        this.dataTable.table.state.page=0
        var instance=null;
        this.callTokenData(vals, instance);
    }
render(){
    let i;
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
          let secondValue={
              value:"Select",
              label:"Select"
          }
          destinationArray.unshift( secondValue );


    }




    let documentTypeArray = [];
    if(this.state.documentTypeOptions.length > 0){
        for(i = 0; i< this.state.documentTypeOptions.length; i++) {
            let documentObj = {value: this.state.documentTypeOptions[i].DocTypeName, label: this.state.documentTypeOptions[i].DocTypeName};
            documentTypeArray.push(documentObj);
        }
        let firstValue={
            value:"Select",
            label:"Select"
        }
        documentTypeArray.unshift( firstValue );
    }




    let mergelogicTypeArray = [];
    let mergeLogicTypeFilterArray = [];
    if(this.state.mergeLogicTypeOptions.length > 0){
        for(i = 0; i< this.state.mergeLogicTypeOptions.length; i++) {
            let mergeLogicFilterObj = {value: this.state.mergeLogicTypeOptions[i].MergeTypeName, label: this.state.mergeLogicTypeOptions[i].MergeTypeName};
            let mergeLogicObj = {value: this.state.mergeLogicTypeOptions[i].ID, label: this.state.mergeLogicTypeOptions[i].MergeTypeName};
            mergeLogicTypeFilterArray.push(mergeLogicFilterObj);
            mergelogicTypeArray.push(mergeLogicObj);
        }
    }

    let mergeLogicTypeFilterSelect={
        value:"Select",
        label:"Select"
    }
    mergeLogicTypeFilterArray.unshift( mergeLogicTypeFilterSelect );
    mergelogicTypeArray.unshift( mergeLogicTypeFilterSelect );




    const branchCodeOptions = [{value: "Select", label: "Select"},{value: "001", label: "001"},{value: "002", label: "002"},{value: "004", label: "004"},{value: "005", label: "005"},{value: "011", label: "011"}];
      let effectiveDateFrom = '';
      let effectiveDateTo = '';
      let isActive = '';
      let mergeLogic = localStorage.getItem("MergeLogicType");
      if (this.state.addNewPageHeader === 'Edit Customer') {
        effectiveDateFrom = localStorage.getItem("EffectiveDateFrom");
        effectiveDateTo = localStorage.getItem("EffectiveDateTo");
        isActive = localStorage.getItem("IsActive");
      }
      //const obj = branchCodeOptions.find(o => o.value === branchCode);
      if(mergeLogic === 'CI-BL'){
        mergeLogic = true;
      }
    let filters = {
        defaultStateOpen: true,
        moreLess: true,
        inputs: [
            {id: 1, label: 'Customer Id', type: 'text', placeholder: "Enter Customer ID", isBaseFilter: true},
            {id: 2, label: 'Days to EAD', type: 'text', placeholder: "Days to EAD", isBaseFilter: true},
            {id: 3, label: 'Merge Logic Type', type: 'dropdown',placeholder:'Select', options: mergeLogicTypeFilterArray, isBaseFilter: true},
            {id: 4, label: 'Company Code', type: 'text', placeholder: "Enter Company Code", isBaseFilter: true},
            {id: 5, label: 'Branch Code', type: 'text', placeholder: "Enter Branch Code", isBaseFilter: false},
            {id: 6, label: 'Document Type',  type: 'dropdown',placeholder:'Select', options: documentTypeArray, isBaseFilter: false},
            {id: 7, label: 'Shipment Type', type: 'dropdown',placeholder:'Select', options: [{label: 'Select', value:'Select'},{label: 'Export', value:'Export'}, {label: 'Import', value:'Import'}], isBaseFilter: false},
            {id: 8, label: 'Destination Platform',  type: 'dropdown', placeholder:'Select', options: destinationArray, isBaseFilter: false},
            {id: 9, label: "Effective From", type: 'date-mon-sun', noDateOption: false, isBaseFilter: false},
            {id: 10, label: "Effective To", type: 'date-mon-sun', noDateOption: false, isBaseFilter: false},
            {id: 11, label: "Business Logic",  type: 'text', placeholder: "Enter Business Logic", isBaseFilter: false},
            {id: 12, label: "Active",  type: 'dropdown',placeholder:'Select', options: [{label: 'Select', value:'Select'},{label: 'true', value:'true'}, {label: 'false', value:'false'}], isBaseFilter: false}
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
      return(
                <div>
                    {
                    this.state.showNewCustomerPage===false?<div>
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
                                        <h1>Customer Configuration</h1>
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
                                {this.state.dataForExport !== null ?
                                <ExcelFile filename="CustomerConfig" element={<button type="button" className="button button-blue">Export to Excel</button>}>
                                    <ExcelSheet data={this.state.dataForExport} name="Customer Config">
                                        <ExcelColumn label="Customer Id" value="CustomerId"/>
                                        <ExcelColumn label="Merge Logic Type" value="MergeLogicType"/>
                                        <ExcelColumn label="Days To EAD" value="DaystoEAD"/>
                                        <ExcelColumn label="Company Code" value="CompanyCode"/>
                                        <ExcelColumn label="Branch Code" value="BranchCode"/>
                                        <ExcelColumn label="Active" value="IsActive"/>
                                        <ExcelColumn label="Document Type" value="DocumentType"/>
                                        <ExcelColumn label="Shipment Type" value="ShipmentType"/>
                                        <ExcelColumn label="Business Logic" value="BusinessLogic"/>
                                        <ExcelColumn label="Destination Platform" value="DestinationPlatform"/>
                                        <ExcelColumn label="Effective Date From" value="EffectiveDateFrom"/>
                                        <ExcelColumn label="Effective Date To" value="EffectiveDateTo"/>
                                    </ExcelSheet>
                                </ExcelFile>
                                    : <div className="grid-wrapper"><button type="button" className="button button-blue" onClick={this.invalidExport}>Export to Excel</button></div>}
                                <div>
                                    <InPageDialog showDialog={this.state.showDialog} type={"success"} message={"Customer added successfully"} closeMethod={() => this.closeDialog()}/>
                                    <InPageDialog showDialog={this.state.showExistsDialog} type={"warning"} message={"Record already exists"} closeMethod={() => this.closeDialog()}/>
                                    <InPageDialog showDialog={this.state.showMandatoryDocument} type={"warning"} message={"Document Type is Mandatory"} closeMethod={() => this.closeDialog()}/>
                                    <InPageDialog showDialog={this.state.showDoctDialog} type={"error"} message={"Unable to fetch Document Type"} closeMethod={() => this.closeDialog()}/>
                                    <InPageDialog showDialog={this.state.showMergeDialog} type={"error"} message={"Unable to fetch Merge Type"} closeMethod={() => this.closeDialog()}/>
                                    <InPageDialog showDialog={this.state.showCustomerDialog} type={"error"} message={"Unable to fetch Customer Records"} closeMethod={() => this.closeDialog()}/>
                                    <InPageDialog showDialog={this.state.showErrorExportDialog} type={"error"} message={"Returned result is more than " +Environment.defaultDownloadExcelLimit+ " records, Please add more filter and try again."} closeMethod={() => this.closeDialog()}/>
                                    <br />
                                </div>
                                <div className="grid-wrapper">
                                    <div className="col-100">
                                        {
                                            (this.state.configureTableContent) ?
                                                <DataTable
                                                    data={this.state.configureTableContent}
                                                    columns={[
                                                        {
                                                            headerClassName: 'data-table header',
                                                            accessor: "CustomerId",
                                                            isStatus: false,
                                                            isHyperlink: true,
                                                            fieldHeader: 'Customer Id',
                                                            show: true,
                                                            footer: null
                                                        },
                                                        {
                                                            headerClassName: 'data-table header',
                                                            accessor: "MergeLogicType",
                                                            isStatus: false,
                                                            isLink: false,
                                                            fieldHeader: "Merge Logic Type",
                                                            show: true

                                                        },
                                                        {
                                                            headerClassName: 'data-table header',
                                                            accessor: "DaystoEAD",
                                                            editable: false,
                                                            isLink: false,
                                                            fieldHeader: 'Days to EAD',
                                                            show: true
                                                        },
                                                        {
                                                            headerClassName: 'data-table header',
                                                            accessor: "CompanyCode",
                                                            editable: false,
                                                            isLink: false,
                                                            fieldHeader: 'Company Code',
                                                            show: true
                                                        },
                                                        {
                                                            headerClassName: 'data-table header',
                                                            accessor: "BranchCode",
                                                            editable: false,
                                                            isLink: false,
                                                            fieldHeader: 'Branch Code',
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
                                                            accessor: "DocumentType",
                                                            editable: false,
                                                            isLink: false,
                                                            fieldHeader: 'Document Type',
                                                            show: true
                                                        },
                                                        {
                                                            headerClassName: 'data-table header',
                                                            accessor: "ShipmentType",
                                                            editable: false,
                                                            isLink: false,
                                                            fieldHeader: 'Shipment Type',
                                                            show: true
                                                        },
                                                        {
                                                            headerClassName: 'data-table header',
                                                            accessor: "BusinessLogic",
                                                            editable: false,
                                                            isLink: false,
                                                            fieldHeader: 'Business Logic',
                                                            show: true
                                                        },
                                                        {
                                                            headerClassName: 'data-table header',
                                                            accessor: "DestinationPlatform",
                                                            editable: false,
                                                            isLink: false,
                                                            fieldHeader: 'Destination Platform',
                                                            show: true
                                                        },
                                                        {
                                                            headerClassName: 'data-table header',
                                                            accessor: "EffectiveDateFrom",
                                                            editable: false,
                                                            isLink: false,
                                                            fieldHeader: 'Effective From',
                                                            show: true
                                                        },
                                                        {
                                                            headerClassName: 'data-table header',
                                                            accessor: "EffectiveDateTo",
                                                            editable: false,
                                                            isLink: false,
                                                            fieldHeader: 'Effective To',
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
                                                    tableName={"configureTable"}
                                                    ref={(dataTable) => {
                                                        this.dataTable = dataTable;
                                                    }}
                                                    statusOptions={this.state.statusOptions}
                                                    actions={this.state.actions}
                                                    height={400}/>
                                                : <div className="message info"><i aria-hidden="true"
                                                                                   className="fa fa-info-circle fa-3x"></i><span
                                                    id="message_success">No data found. Please try after sometime.</span></div>
                                        }
                                    </div>
                                </div>
                            </section>
                        </div>
                    <Loader loader={this.state.loader}/>
                </div>:<div>
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
                                            <h1>{this.state.addNewPageHeader}</h1>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        <section className="page-container">
                            <div className="grid-wrapper">
                                    <div className="button-group">
                                        { this.state.addNewPageHeader === 'Edit Customer' ? <button type="button" className="button button-blue" onClick={this.updateCustomer}>UPDATE</button> : <button type="button" className="button button-blue" onClick={this.saveCustomer}>SAVE</button> }
                                        <button type="button" className="button button-transparent" onClick={this.cancelPage}>CANCEL</button>
                                        { this.state.addNewPageHeader === 'Edit Customer' && isActive === 'false' ? <button type="button" className="button button-transparent" onClick={this.activeCustomer}>ACTIVATE CUSTOMER</button> : null }
                                        { this.state.addNewPageHeader === 'Edit Customer' && isActive === 'true' ? <button type="button" className="button button-transparent" onClick={this.inactiveCustomer}>INACTIVATE CUSTOMER</button> : null }
                                    </div>
                            </div>
                            <InPageDialog showDialog={this.state.showDateValidationError} type={"warning"} message={this.state.textVal} closeMethod={() => this.closeDialog()}/>
                            <InPageDialog showDialog={this.state.showExistsDialog} type={"warning"} message={"Record already exists"} closeMethod={() => this.closeDialog()}/>
                            <InPageDialog showDialog={this.state.showMandatoryField} type={"error"} message={"Mandatory Field cant be left blank"} closeMethod={() => this.closeDialog()}/>
                            <br />
                            <div className="grid-wrapper">
                                <div className="col-50 child-grid-wrapper">
                                    <div className="col-50">
                                        <div className="form-group">
                                            <TextField disabled={false} readOnly={false} label={"Customer Id"}  state={inputState} required={true} ref={(input) => {this.addCustomerIdText = input}}/>
                                            {
                                                this.state.errorCustomerName === true?
                                                    <span className="field-label-incomplete"><i className="fas fa-times-circle text-missing-error"></i>  Customer Id Mandatory Field</span> : null
                                            }
                                        </div>

                                    </div>
                                    <div className="col-50">
                                        <div className="form-group">
                                        <TextField disabled={false} readOnly={false} label={"Days to EAD"}  state={inputState} required={true} ref={(input) => {this.addDaysToEADText = input}}/>
                                        </div>
                                        {
                                            this.state.errorDaysToEAD === true?
                                                <span className="field-label-incomplete"><i className="fas fa-times-circle text-missing-error"></i>  Days to EAD is Mandatory Field</span> : null
                                        }
                                        <InPageDialog showDialog={this.state.showNumberError} type={"error"} message={this.state.txtValue} closeMethod={() => this.closeDialog()}/>
                                    </div>
                                </div>
                                <div className="col-50 child-grid-wrapper">
                                    <div className="col-50">
                                            <TextField disabled={false} readOnly={false} label={"Company Code"}  state={inputState} required={true} ref={(input) => {this.addCompanyEAD = input}}/>
                                    </div>
                                    <div className="col-50">
                                        <div></div>
                                    </div>
                                </div>
                            </div>
                            <div className="grid-wrapper">
                                <div className="col-50 child-grid-wrapper">
                                    <div className="col-50">
                                        <div className="form-group" ><span className="small-body-text">Branch Code</span><span
                                            className="required-field"> *</span>
                                        <SelectionDropDownAdvanced options={branchCodeOptions}
                                                                   isClearable={false}
                                                                   isDisabled={false}
                                                                   isSearchable={false}
                                                                   onChange={this.onChangeConfigure}
                                                                   isMulti={false}
                                                                   ref={(selectBox) => this.branchCodeAddSelect = selectBox}
                                                                   defaultValue={this.state.branchCodeSel}
                                        /></div>
                                        {
                                            this.state.errorBranchCode === true?
                                                <span className="field-label-incomplete"><i className="fas fa-times-circle text-missing-error"></i>  Branch Code is Mandatory Field</span> : null
                                        }
                                    </div>
                                    <div className="col-50"><span className="small-body-text">Effective From</span>
                                        <span className="required-field"> *</span>
                                        <span ><DatePickerMonSun title={""} required={true}  noDateOption={false} defaultValue={effectiveDateFrom} id={"monSun"} ref={(monSun) => {this.monSun = monSun}}/></span>
                                        {
                                            this.state.errorMonSun === true?
                                                <span className="field-label-incomplete"><i className="fas fa-times-circle text-missing-error"></i>  Effective From is Mandatory Field</span> : null
                                        }
                                    </div>
                                </div>
                                <div className="col-50 child-grid-wrapper">
                                    <div className="col-50"><span className="small-body-text">Effective To</span>
                                        <span className="required-field"> *</span>
                                        <div ><DatePickerMonSun title={""} noDateOption={false} defaultValue={effectiveDateTo} id={"monSun1"} ref={(monSun) => {this.monSun1 = monSun}}/></div>
                                        {
                                            this.state.errorMonSunTo === true?
                                                <span className="field-label-incomplete"><i className="fas fa-times-circle text-missing-error"></i>  Effective To is Mandatory Field</span> : null
                                        }
                                    </div>
                                    <div className="col-50">
                                        <div></div>
                                    </div>
                                </div>
                            </div>
                            <div className="grid-wrapper">
                                <div className="col-50 child-grid-wrapper">
                                    <div className="col-50">
                                        <div className="form-group"><span className="small-body-text">Shipment Type</span><span
                                            className="required-field"> *</span>
                                            <SelectionDropDownAdvanced options={shimpmentTypeOptions}
                                                                       isClearable={false}
                                                                       isDisabled={false}
                                                                       isSearchable={false}
                                                                       onChange={this.onChangeConfigure}
                                                                       isMulti={false}
                                                                       ref={(selectBox) => this.shipmentSelectValue = selectBox}
                                                                       defaultValue={this.state.shipmenntTypeSel}/>
                                        </div>
                                        {
                                            this.state.errorShipmentType === true?
                                                <span className="field-label-incomplete"><i className="fas fa-times-circle text-missing-error"></i>  Shipment Type is Mandatory Field</span> : null
                                        }
                                    </div>
                                    <div className="col-50">
                                        <div className="form-group"><span className="small-body-text">Destination Platform</span><span
                                            className="required-field"> *</span>
                                            <SelectionDropDownAdvanced options={destinationArray}
                                                                         isDisabled={false}
                                                                         isSearchable={true}
                                                                         isMulti={false}
                                                                         isClearable={false}
                                                                         onChange={this.onChangeConfigure}
                                                                         ref={(selectBox) => this.destinationPlatformSelect = selectBox}
                                                                         defaultValue={this.state.destPlat}/></div>
                                        {
                                            this.state.errorDestinationPlatform === true?
                                                <span className="field-label-incomplete"><i className="fas fa-times-circle text-missing-error"></i>  Destination Platform is Mandatory Field</span> : null
                                        }
                                    </div>
                                </div>
                                <div className="col-50 child-grid-wrapper">
                                    <div className="col-50">
                                        <div className="form-group">
                                            <TextField disabled={false} readOnly={false} label={"Business Logic"}  state={inputState} required={false} ref={(input) => {this.addBusinessLogicText = input}}/>
                                        </div>
                                    </div>
                                    <div className="col-50"></div>
                                </div>
                            </div>
                            <div className="grid-wrapper">
                                <div className="col-50 child-grid-wrapper">
                                    <div className="col-50">
                                        <div className="form-group"><span className="small-body-text">Merge Logic Type</span><span
                                            className="required-field"> *</span>
                                            <SelectionDropDownAdvanced options={mergelogicTypeArray}
                                                                       isClearable={false}
                                                                       isDisabled={false}
                                                                       onChange={this.onChangeConfigure}
                                                                       isSearchable={false}
                                                                       isMulti={false}
                                                                       ref={(selectBox) => this.mergeLogicSelect = selectBox}
                                                                       defaultValue={this.state.mergeLogicSel}/>
                                            {
                                                this.state.errorMergeLogic === true?
                                                    <span className="field-label-incomplete"><i className="fas fa-times-circle text-missing-error"></i>  Merge Logic Type is Mandatory Field</span> : null
                                            }
                                        </div>
                                    </div>
                                    <div className="col-50">
                                        <div className="form-group"><span className="small-body-text">Document Type</span><span
                                            className="required-field"> *</span>
                                            <SelectionDropDownAdvanced options={documentTypeArray}
                                                                       isDisabled={false}
                                                                       isSearchable={true}
                                                                       isMulti={false}
                                                                       isClearable={false}
                                                                       onChange={this.onChangeConfigure}
                                                                       ref={(selectBox) => this.documentTypeSelect = selectBox}
                                                                       defaultValue={this.state.docPlat}/></div>
                                        {
                                            this.state.errorDocumentType === true?
                                                <span className="field-label-incomplete"><i className="fas fa-times-circle text-missing-error"></i>  Document Type is Mandatory Field</span> : null
                                        }
                                    </div>
                                </div>
                                <div className="col-50 child-grid-wrapper">
                                    <div className="col-50">

                                    </div>
                                    <div className="col-50"></div>
                                </div>
                            </div>
                        </section>
                        </div>
                        <ModalMain modal={this.state.showAddCustomerError} title={"Error"} hideMethod={() => this.hideModal()} secondaryMethod={() => this.hideModal()}
                                   primaryMethod={() => this.hideModal()} btnTitle1={"OK"} btnTitle2={"Cancel"}>
                            Please Add the Mandatory fields<br />Customer ID<br/> Days EAD <br />Effective Date From<br />Effective Date To

                        </ModalMain>

                </div>
                }
                </div>

      );

  }
}

class ErrorSection extends Component {
  constructor(props){
    super(props)
    this.state = {
        sortableError:true,
        subColumns: [],
        isExpanded:true,
    }
  }
}

class Configure extends Component {

  constructor(props){
    super(props)
    this.state = {
        configureTableErrorDetails:null,
        configureTableError:null,
        errorDetails:false,
        loader:false,
    }
  }



  render(){
    return(
      <div >
          <ConfigureSection dataSendToApiHeader={this.props.dataSendToApiHeader} selectRow={this.selectRow} showErrorDetails={this.showErrorDetails} />
          {(this.state.errorDetails)
            ?
            <ErrorSection configureTableErrorDetails={this.state.configureTableErrorDetails} configureTableError={this.state.configureTableError} />
            : null 
          }
          <Loader loader={this.state.loader} /> 
      </div>
      )
  }
}

export default Configure;