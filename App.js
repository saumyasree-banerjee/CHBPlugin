import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import AppSwitcherData from './Constants/AppSwitcher.js';
import {Header, MobileNav} from 'damco-components';
import HeaderData from './Constants/HeaderData.js';
import UserData from './Constants/UserData.js';
import IdentifiedDataDetails from './Components/Content/IdentifiedDetails';
import UnidentifiedDataDetails from './Components/Content/Unidentified';
import ReceiverFiles from './Components/Content/ReceiverFileDetails/receiverFileDetails';
import ReceiverFilesDetails from './Components/Content/ReceiverFileDetails/receiverFileWithMoreDetails';
import ReceiverFilesLogDetails from './Components/Content/ReceiverFileDetails/receiverFileLogDetails';
import Configure from './Components/Content/Configure/configure.js';
import Platform from './Components/Content/Configure/platform.js';
import Transition from './Components/Content/Configure/translation.js';
import {Environment} from './Constants/Environment';
import FetchApi from './Library/FetchApi.js'
import Loader from './Components/Content/Common/Loader';
import API from "./Constants/API-config";
import IdentifiedCISuccess from "./Components/Content/IdentifiedDetails/IdentifiedCISuccess";
import IdentifiedBISuccess from "./Components/Content/IdentifiedDetails/IdentifiedBISuccess";
import ConfigureUpdate from "./Components/Content/Configure/configureUpdate";
import PlatformUpdate from "./Components/Content/Configure/platformUpdate";
import TranslationUpdate from "./Components/Content/Configure/translationUpdate";
import ReceiverConfiguration from "./Components/Content/Configure/receiverConfiguration";
import ReceiverConfigurationUpdate from "./Components/Content/Configure/receiverConfigurationUpdate";
import ISFAuditLog from "./Components/Content/ISFDetails/ISFAuditLogDetails";
import IdentifiedISFErrorDetails from "./Components/Content/IdentifiedDetails/IdentifiedISFErrorDetails";
import StatusResponse from "./Components/Content/ISFDetails/StatusResponse";
import ISFDetails from "./Components/Content/ISFDetails/ISFDetails";
import ISFCustomResponseStatus  from "./Components/Content/IdentifiedDetails/ISFCustomResponseStatus";
import ISFAuditLogSN from "./Components/Content/ISFDetails/ISFAuditLogDetailsSN";
import ISFAuditLogSA from "./Components/Content/ISFDetails/ISFAuditLogDetailsSA";
import ISFVersionDetails from  "./Components/Content/ISFDetails/ISFVersionDetails";

// import ReceiverSource from "./Components/Content/Configure/receiverSource";
import ReceiverDestinationTypeUpdate from "./Components/Content/Configure/receiverDestinationTypeUpdate";
import PassThroughDetailPage from  "./Components/Content/PassthroughDetails/PassThroughDetailPage";
import IdentifiedBLErrorDetails from "./Components/Content/IdentifiedDetails/IdentifiedBLErrorDetails";
import EventTypeUpdate from "./Components/Content/Configure/EventTypeUpdate";
import SourceUpdate from "./Components/Content/Configure/receiverSourceUpdate";
import Receiver from './Components/Content/Configure/receiver.js';
import EventTypeFileUpdate from "./Components/Content/Configure/EventTypeFileUpdate";
import IdentifiedAuditLog from "./Components/Content/IdentifiedDetails/identifiedAuditLogDetails";
import IdentifiedBLAuditLog from "./Components/Content/IdentifiedDetails/identifiedBLAuditLogDetails";
import IdentifiedPassAuditLog from "./Components/Content/IdentifiedDetails/identifiedPassAuditLogDetails";
import ResponseDestinationUpdate from "./Components/Content/Configure/ResponseDestinationUpdate";
import SingleResponseDetails from "./Components/Content/ISFDetails/SingleResponseDetails";

import {fetch as fetchPolyfill} from 'whatwg-fetch';// eslint-disable-line

class App extends Component {

    constructor(props) {
        super(props)
        this.state = {
            loader:false,
            vcusertype: null,
            negotiationtype: null,
            userData: null,
            isAuthenticated:null,
            buttonCategory: false,
            applicationName:[],
            dataSendToApiHeader:{
                name: null,
                email: null,
                userType: null,
                organizationName:null,
                otherBeCodes: null,
                applicationName:null,
                image:null,
                imagePath:null,
                defaultBeCode:null,
                objectId:null,
            },
            HeaderItems:[],
            companies:[],
            companyList:[],
            companyBeCodes:[],
            companyBeCodeSelected:null,
            companyBeCodeOnChangeValue:'',
            companyBeCodeSelectedCancelState:null,
            companySelectedFromSelectOptions:"",
            currentCompany:{},
            consigneeBecodesForMultiCheckInFilter:[],
            shipperBecodesForMultiCheckInFilter:[],
            ConfirmOrganizationShowHide:false,
        }
    }


    /**
     * Get User Information onload
     *
     *
     *
     */

    componentWillMount = () => {
        let self = this;
        if (typeof(Storage) !== "undefined") {
            if(!sessionStorage.getItem("vcdataSendToApiHeader")){
                self.getUserInfo();
            } else {
                self.setState({
                    dataSendToApiHeader: JSON.parse(sessionStorage.getItem("vcdataSendToApiHeader")),
                    usertype: JSON.parse(sessionStorage.getItem("vcusertype")),
                    negotiationtype: JSON.parse(sessionStorage.getItem("vcnegotiationtype")),
                    userData: JSON.parse(sessionStorage.getItem("vcdataSendToApiHeader")),
                    buttonCategory: true,
                    applicationName:JSON.parse(sessionStorage.getItem("vcapplicationName")),
                    isAuthenticated:JSON.parse(sessionStorage.getItem("vcisAuthenticated")),
                    companyList:JSON.parse(sessionStorage.getItem("vccompanyListArr")),
                    companyBeCodes:self.getCompanyBeCodes(JSON.parse(sessionStorage.getItem("vccompanyListArr"))),
                    companyBeCodeSelected :JSON.parse(sessionStorage.getItem("vccompanyBeCodeSelected")),
                    companyBeCodeOnChangeValue:(JSON.parse(sessionStorage.getItem("vccompanyBeCodeSelected")))?JSON.parse(sessionStorage.getItem("vccompanyBeCodeSelected")) : '',
                    companySelectedFromSelectOptions:JSON.parse(sessionStorage.getItem("vccompanySelectedFromSelectOptions")),
                    currentCompany:JSON.parse(sessionStorage.getItem("vccurrentCompany")),
                    companies:JSON.parse(sessionStorage.getItem("vccompanies")),
                })
            }
        }
    }


    getUserInfo = () => {
        let self = this;
        // this.setState({loader:true});
        let userData= { };
        console.log(Environment.path + API.GET_USER_INFO);
        FetchApi.FetchApiGet(Environment.path + API.GET_USER_INFO, userData,  function(responseJson) {
            if(responseJson === "error") {
                self.setState({
                    buttonCategory:true,
                });
                return false;
            } else if (responseJson === "logout"){
                self.signOut();
                return false;
            }
            let applicationAccess = [];
            responseJson.accesses.forEach((elm)=>{
                applicationAccess.push(elm.applicationName);
            });

            self.setState({
                applicationName:applicationAccess,
                loader:false,
            },() => {
                self.userAccessStateManagement(responseJson);
            });

        });

    }


    userAccessStateManagement = (userdata) => {
        let self = this;
        let dataSendToApiHeader = self.state.dataSendToApiHeader;
        dataSendToApiHeader.name = userdata.name;
        dataSendToApiHeader.email = userdata.email;
        dataSendToApiHeader.image = userdata.image;
        dataSendToApiHeader.imagePath = userdata.imagePath;
        dataSendToApiHeader.objectId = userdata.userObjectId;
        if( userdata.accesses && userdata.accesses.length>0){
            userdata.accesses.forEach((elm)=>{
                if(elm.applicationName === 'CHB'){
                    dataSendToApiHeader.applicationName = elm.applicationName;
                    dataSendToApiHeader.organizationName = elm.organizationName;
                    dataSendToApiHeader.defaultBeCode = (elm.currentCompany) ? elm.currentCompany.beCode : null;
                    dataSendToApiHeader.userType = elm.userType;
                    dataSendToApiHeader.otherBeCodes = elm.beCodes;
                    let companyList =[];
                    if(elm.companies){
                        elm.companies.forEach((v)=>{
                            companyList.push({ id:v.id, name:v.name, beCode:v.beCode });
                        });
                    }
                    let currentCompanyForSessionStore = (elm.currentCompany) ? elm.currentCompany : null;
                    let currentBeCodeForSessionStore = (elm.currentCompany) ? elm.currentCompany.beCode : null;
                    self.setSession(elm.userType, elm.userType, userdata.accesses, dataSendToApiHeader, self.state.applicationName, userdata.isAuthenticated, companyList, currentBeCodeForSessionStore, currentCompanyForSessionStore, elm.companies);
                    self.setState({
                        companies:elm.companies,
                        companyList :companyList,
                        companyBeCodes:self.getCompanyBeCodes(companyList),
                        companySelectedFromSelectOptions: (elm.currentCompany) ? elm.currentCompany.beCode : null,
                        negotiationtype:elm.userType,
                        usertype: elm.userType,
                    });
                    if(elm.companies && elm.companies.length===1){
                        self.setState({ companyBeCodeSelected : elm.companies[0].beCode, currentCompany: elm.companies[0] });
                        sessionStorage.setItem("vccompanyBeCodeSelected", JSON.stringify(elm.companies[0].beCode));
                        sessionStorage.setItem("vccurrentCompany", JSON.stringify(elm.companies[0]));
                        let dataSendToApiHeader = self.state.dataSendToApiHeader;
                        dataSendToApiHeader.defaultBeCode = elm.companies[0].beCode;
                        sessionStorage.setItem("vcdataSendToApiHeader", JSON.stringify(dataSendToApiHeader));
                    } else {
                        self.setState({
                            currentCompany:(elm.currentCompany) ? elm.currentCompany : null,
                        });
                    }
                }
            });
        }


        self.setState({
            isAuthenticated:userdata.isAuthenticated,
            userData:dataSendToApiHeader,
            dataSendToApiHeader:dataSendToApiHeader,
        },()=>self.setFooterHeader(self.state.negotiationtype));

    }


    /**
     * Generic method for creating the company select options
     *
     *
     *
     */
    getCompanyBeCodes = (companyList) => {
        let createCompanyList=[];
        if(companyList){
            companyList.forEach((val)=>{
                createCompanyList.push(val.beCode)
            });
        }
        return createCompanyList;
    }


    /**
     * Session set for authenticated user
     *
     *
     *
     */

    setSession = (usertype, negotiationtype, userData, dataSendToApiHeader, applicationName, isAuthenticated, companyListArr, companyBeCodeSelected, currentCompany, companies) =>{
        sessionStorage.setItem("vccompanies", JSON.stringify(companies));
        sessionStorage.setItem("vcusertype", JSON.stringify(usertype));
        sessionStorage.setItem("vcnegotiationtype", JSON.stringify(negotiationtype));
        //sessionStorage.setItem("vcuserData", JSON.stringify(userData));
        sessionStorage.setItem("vcdataSendToApiHeader", JSON.stringify(dataSendToApiHeader));
        sessionStorage.setItem("vcapplicationName", JSON.stringify(applicationName));
        sessionStorage.setItem("vcisAuthenticated", JSON.stringify(isAuthenticated));
        sessionStorage.setItem("vccompanyListArr", JSON.stringify(companyListArr));
        sessionStorage.setItem("vccompanyBeCodeSelected", JSON.stringify(companyBeCodeSelected));
        sessionStorage.setItem("vccurrentCompany", JSON.stringify(currentCompany));
    }


    /**
     * Session set for Unauthorized user
     *
     *
     *
     */

    setSessionForUnauthorized = (usertype, negotiationtype, userData, dataSendToApiHeader )=>{
        //sessionStorage.setItem("isAuthenticated", JSON.stringify("true"));
        sessionStorage.setItem("usertype", JSON.stringify(usertype));
        sessionStorage.setItem("negotiationtype", JSON.stringify(negotiationtype));
        //sessionStorage.setItem("vcuserData", JSON.stringify(userData));
        sessionStorage.setItem("dataSendToApiHeader", JSON.stringify(dataSendToApiHeader));
    }




    /**
     * Set the organization option selected state
     *
     *
     * On select user able to change the selected organization
     */

    changeCompanyListOnSelect = (companyBeCodeSelected) => {
        let self=this;
        self.setState({companyBeCodeSelectedCancelState:self.state.companyBeCodeOnChangeValue});
        this.setState({companyBeCodeOnChangeValue:companyBeCodeSelected, ConfirmOrganizationShowHide: !this.state.ConfirmOrganizationShowHide});
    }


    /**
     * Set the organization option selected state on the first screen
     *
     *
     * On select user able to change the selected organization
     */
    chooseCompanyListOnSelect = (companyBeCodeSelected) => {
        let self=this;
        this.setState({companyBeCodeOnChangeValue:companyBeCodeSelected},()=>{
            self.setOrganizationAndSession();
        })

    }


    /**
     * Function for signout
     *
     * Passing this function through out the sub components
     *
     */

    signOut = () => {
        sessionStorage.clear();
        let logOutUrl = window.location.origin + "/user/signout/";
        window.location = logOutUrl;
    }



    /**
     * Confirm BoxFor Organization modal hide show
     *
     * This function triggered with the cancel button
     *
     */

    confirmBoxForOrganizationChangeshowHide = () => {
        this.setState({
            companyBeCodeOnChangeValue:this.state.companyBeCodeSelectedCancelState,
            ConfirmOrganizationShowHide: !this.state.ConfirmOrganizationShowHide,
        });
    }

    /**
     * Set the organization option selected state on the first screen
     *
     * This function triggered with the save button
     *
     */

    confirmBoxForOrganizationChangeshowHideSuccess = () =>{
        this.setOrganizationAndSession();
    }


    /**
     * Method trigger after changing your organization
     *
     * On change of the organization select
     *
     */

    setOrganizationAndSession = () =>{
        let self = this;
        let vcdataSendToApiHeaderObj = JSON.parse(sessionStorage.getItem("vcdataSendToApiHeader"));
        vcdataSendToApiHeaderObj.defaultBeCode = self.state.companyBeCodeOnChangeValue;
        sessionStorage.setItem("vcdataSendToApiHeader", JSON.stringify(vcdataSendToApiHeaderObj));
        sessionStorage.setItem("vccompanyBeCodeSelected", JSON.stringify(self.state.companyBeCodeOnChangeValue));
        self.state.companies.forEach((val)=>{
            if(val.beCode===self.state.companyBeCodeOnChangeValue){
                self.setState({currentCompany:val},()=>{
                    sessionStorage.setItem("vccurrentCompany", JSON.stringify(val));
                    let redirectUrl = window.location.origin;
                    window.location = redirectUrl+'/CHB/';
                });
            }
        });
    }

    render() {
        let displayComponent;
        if(this.state.isAuthenticated === true && this.state.usertype) {
            if(this.state.usertype === "damco" && this.state.applicationName.length>0) {
                displayComponent = <DamcoUserView companyList={this.state.companyList} companyBeCodes ={this.state.companyBeCodes} currentCompany={this.state.currentCompany} companySelectedFromSelectOptions={this.state.companySelectedFromSelectOptions} companyBeCodeSelected={this.state.companyBeCodeSelected} companyBeCodeOnChangeValue={this.state.companyBeCodeOnChangeValue} changeCompanyListOnSelect={this.changeCompanyListOnSelect} chooseCompanyListOnSelect={this.chooseCompanyListOnSelect}  HeaderItems={this.state.HeaderItems} dataSendToApiHeader={this.state.dataSendToApiHeader} isAuthenticated={this.state.isAuthenticated} buttonCategory={this.state.buttonCategory} usertype={this.state.usertype} userData={this.state.userData} signOut={this.signOut} ConfirmOrganizationShowHide={this.state.ConfirmOrganizationShowHide} confirmBoxForOrganizationChangeshowHide={this.confirmBoxForOrganizationChangeshowHide} confirmBoxForOrganizationChangeshowHideSuccess={this.confirmBoxForOrganizationChangeshowHideSuccess} />;
            }
        }
        return (
            <Router>
                <div>
                    { displayComponent }
                    <Loader loader={this.state.loader} />
                </div>
            </Router>
        );
    }
}

/**
 * Default view for Maersk
 *
 * Maersk user only able to see this component
 *
 */
class DamcoUserView extends Component {
    render() {
        return(
            <div>
                <div>
                    <Header headerData={HeaderData} appSwitcherData={AppSwitcherData} userData={UserData} logout={() => this.signOut()}/>
                    <main className="full-width">
                        <Switch>
                            <Route exact path="/" render={(match) => {
                                return <IdentifiedDataDetails currentCompany={this.props.currentCompany} signOut={this.props.signOut} dataSendToApiHeader={this.props.dataSendToApiHeader} supplier={this.props.usertype} userData={this.props.userData} />
                            }}/>
                            <Route exact path="/Identifieddata" render={(match) => {
                                return <IdentifiedDataDetails currentCompany={this.props.currentCompany} signOut={this.props.signOut} dataSendToApiHeader={this.props.dataSendToApiHeader} supplier={this.props.usertype} userData={this.props.userData} />
                            }}/>
                            <Route exact path="/ReceiverFiles" render={(match) => {
                                return <ReceiverFiles currentCompany={this.props.currentCompany} signOut={this.props.signOut} dataSendToApiHeader={this.props.dataSendToApiHeader} supplier={this.props.usertype} userData={this.props.userData} />
                            }}/>
                            <Route exact path="/Unidentifieddata" render={(match) => {
                                return <UnidentifiedDataDetails currentCompany={this.props.currentCompany} signOut={this.props.signOut} dataSendToApiHeader={this.props.dataSendToApiHeader} userData={this.props.userData} />
                            }}/>
                            <Route exact path="/Configure" render={(match) => {
                                return <Configure currentCompany={this.props.currentCompany} signOut={this.props.signOut} dataSendToApiHeader={this.props.dataSendToApiHeader} userData={this.props.userData} />
                            }}/>
                            <Route exact path="/Platform" render={(match) => {
                                return <Platform currentCompany={this.props.currentCompany} signOut={this.props.signOut} dataSendToApiHeader={this.props.dataSendToApiHeader} userData={this.props.userData} />
                            }}/>
                            <Route exact path="/Translation" render={(match) => {
                                return <Transition currentCompany={this.props.currentCompany} signOut={this.props.signOut} dataSendToApiHeader={this.props.dataSendToApiHeader} userData={this.props.userData} />
                            }}/>
                            <Route exact path="/SenderConfiguration" render={(match) => {
                                return <ReceiverConfiguration currentCompany={this.props.currentCompany} signOut={this.props.signOut} dataSendToApiHeader={this.props.dataSendToApiHeader} userData={this.props.userData} />
                            }}/>
                            <Route exact path="/CIDetails/:DocumentNumber" render={(props) => {
                                return <IdentifiedCISuccess {...props} currentCompany={this.props.currentCompany}
                                                            signOut={this.props.signOut}
                                                            dataSendToApiHeader={this.props.dataSendToApiHeader}
                                                            userData={this.props.userData}/>
                            }}/>

                            <Route exact path="/ShipmentID/:ShipmentId/BLDetails" render={(props) => {
                                return <IdentifiedBISuccess {...props} currentCompany={this.props.currentCompany}
                                                            signOut={this.props.signOut}
                                                            dataSendToApiHeader={this.props.dataSendToApiHeader}
                                                            userData={this.props.userData}/>
                            }}/>
                            <Route exact path="/Source/:ResponseSourceId" render={(props) => {
                                return <SourceUpdate {...props} currentCompany={this.props.currentCompany}
                                                            signOut={this.props.signOut}
                                                            dataSendToApiHeader={this.props.dataSendToApiHeader}
                                                            userData={this.props.userData}/>
                            }}/>
                            <Route exact path="/CILogDetails/:CommercialInvoiceHeaderID" render={(props) => {
                                return <IdentifiedAuditLog {...props} currentCompany={this.props.currentCompany}
                                                     signOut={this.props.signOut}
                                                     dataSendToApiHeader={this.props.dataSendToApiHeader}
                                                     userData={this.props.userData}/>
                            }}/>
                            <Route exact path="/BLLogDetails/:ShipmentId" render={(props) => {
                                return <IdentifiedBLAuditLog {...props} currentCompany={this.props.currentCompany}
                                                           signOut={this.props.signOut}
                                                           dataSendToApiHeader={this.props.dataSendToApiHeader}
                                                           userData={this.props.userData}/>
                            }}/>
                            <Route exact path="/PassLogDetails/:PassThroughMessageId" render={(props) => {
                                return <IdentifiedPassAuditLog {...props} currentCompany={this.props.currentCompany}
                                                             signOut={this.props.signOut}
                                                             dataSendToApiHeader={this.props.dataSendToApiHeader}
                                                             userData={this.props.userData}/>
                            }}/>
                            <Route exact path="/ISFLogDetails/:ISFRecordID" render={(props) => {
                                return <ISFAuditLog {...props} currentCompany={this.props.currentCompany}
                                                               signOut={this.props.signOut}
                                                               dataSendToApiHeader={this.props.dataSendToApiHeader}
                                                               userData={this.props.userData}/>
                            }}/>
                            <Route exact path="/BICIDetails/:DocumentNumber" render={(props) => {
                                return <IdentifiedCISuccess {...props} currentCompany={this.props.currentCompany}
                                                            signOut={this.props.signOut}
                                                            dataSendToApiHeader={this.props.dataSendToApiHeader}
                                                            userData={this.props.userData}/>
                            }}/>
                            <Route exact path="/Platform/:PlatformID" render={(props) => {
                                return <PlatformUpdate {...props} currentCompany={this.props.currentCompany}
                                                            signOut={this.props.signOut}
                                                            dataSendToApiHeader={this.props.dataSendToApiHeader}
                                                            userData={this.props.userData}/>
                            }}/>
                            <Route exact path="/Configure/:ID" render={(props) => {
                                return <ConfigureUpdate {...props} currentCompany={this.props.currentCompany}
                                                       signOut={this.props.signOut}
                                                       dataSendToApiHeader={this.props.dataSendToApiHeader}
                                                       userData={this.props.userData}/>
                            }}/>
                            <Route exact path="/Translation/:TranslationID" render={(props) => {
                                return <TranslationUpdate {...props} currentCompany={this.props.currentCompany}
                                                        signOut={this.props.signOut}
                                                        dataSendToApiHeader={this.props.dataSendToApiHeader}
                                                        userData={this.props.userData}/>
                            }}/>
                            <Route exact path="/SenderConfiguration/:ReceiverConfigurationID" render={(props) => {
                                return <ReceiverConfigurationUpdate {...props} currentCompany={this.props.currentCompany}
                                                          signOut={this.props.signOut}
                                                          dataSendToApiHeader={this.props.dataSendToApiHeader}
                                                          userData={this.props.userData}/>
                            }}/>
                            <Route exact path="/ReceiverFileDetails/:ResponseFileInfoId" render={(props) => {
                                return <ReceiverFilesDetails {...props} currentCompany={this.props.currentCompany}
                                                                    signOut={this.props.signOut}
                                                                    dataSendToApiHeader={this.props.dataSendToApiHeader}
                                                                    userData={this.props.userData}/>
                            }}/>
                            <Route exact path="/ReceiverFileLogDetails/:ResponseFileInfoId" render={(props) => {
                                return <ReceiverFilesLogDetails {...props} currentCompany={this.props.currentCompany}
                                                             signOut={this.props.signOut}
                                                             dataSendToApiHeader={this.props.dataSendToApiHeader}
                                                             userData={this.props.userData}/>
                            }}/>
                            <Route exact path="/DestinationType/:DestinationTypeId" render={(props) => {
                                return <ReceiverDestinationTypeUpdate {...props} currentCompany={this.props.currentCompany}
                                                                    signOut={this.props.signOut}
                                                                    dataSendToApiHeader={this.props.dataSendToApiHeader}
                                                                    userData={this.props.userData}/>
                            }}/>
                            <Route exact path="/EventFileName/:FileName/:EventTypeFileId" render={(props) => {
                                return <EventTypeFileUpdate {...props} currentCompany={this.props.currentCompany}
                                                            signOut={this.props.signOut}
                                                            dataSendToApiHeader={this.props.dataSendToApiHeader}
                                                            userData={this.props.userData}/>
                            }}/>
                            <Route exact path="/ISFDetails/:JSONCorelationID" render={(props) => {
                                return <ISFDetails {...props} currentCompany={this.props.currentCompany}
                                                   signOut={this.props.signOut}
                                                   dataSendToApiHeader={this.props.dataSendToApiHeader}
                                                   userData={this.props.userData}/>
                            }}/>
                            }}/>
                            <Route exact path="/:Status/:ISFRecordID/Details" render={(props) => {
                                return <IdentifiedISFErrorDetails {...props} currentCompany={this.props.currentCompany} signOut={this.props.signOut} dataSendToApiHeader={this.props.dataSendToApiHeader} supplier={this.props.usertype} userData={this.props.userData} />
                            }}/>

                            <Route exact path="/:VersionNum/:ISFResponseTransactionID" render={(props) => {
                                return <ISFVersionDetails {...props} currentCompany={this.props.currentCompany} signOut={this.props.signOut} dataSendToApiHeader={this.props.dataSendToApiHeader} supplier={this.props.usertype} userData={this.props.userData} />
                            }}/>
                            <Route exact path="/:VersionNum/:ISFResponseTransactionID" render={(props) => {
                                return <ISFVersionDetails {...props} currentCompany={this.props.currentCompany} signOut={this.props.signOut} dataSendToApiHeader={this.props.dataSendToApiHeader} supplier={this.props.usertype} userData={this.props.userData} />
                            }}/>

                            <Route exact path="/:PluginStatus/:ISFResponseTransactionID/SNStatus" render={(props) => {
                                return <ISFCustomResponseStatus {...props} currentCompany={this.props.currentCompany} signOut={this.props.signOut} dataSendToApiHeader={this.props.dataSendToApiHeader} supplier={this.props.usertype} userData={this.props.userData} />
                            }}/>
                            <Route exact path="/:PluginStatus/:ISFResponseTransactionID/SAStatus" render={(props) => {
                                return <ISFCustomResponseStatus {...props} currentCompany={this.props.currentCompany} signOut={this.props.signOut} dataSendToApiHeader={this.props.dataSendToApiHeader} supplier={this.props.usertype} userData={this.props.userData} />
                            }}/>


                            <Route exact path="/Receiver" render={(match) => {
                                return <Receiver currentCompany={this.props.currentCompany} signOut={this.props.signOut} dataSendToApiHeader={this.props.dataSendToApiHeader} userData={this.props.userData} />
                            }}/>
                            <Route exact path="/PassThrough/:PassThroughMessageId/PassThroughPage/Details" render={(props) => {
                                return <PassThroughDetailPage {...props} currentCompany={this.props.currentCompany} signOut={this.props.signOut} dataSendToApiHeader={this.props.dataSendToApiHeader} supplier={this.props.usertype} userData={this.props.userData} />
                            }}/>
                            <Route exact path="/:Status/:ShipmentId/Status/Details" render={(props) => {
                                return <IdentifiedBLErrorDetails {...props} currentCompany={this.props.currentCompany} signOut={this.props.signOut} dataSendToApiHeader={this.props.dataSendToApiHeader} supplier={this.props.usertype} userData={this.props.userData} />
                            }}/>
                            <Route exact path="/:Status/:CommercialInvoiceHeaderID/StatusDetail" render={(props) => {
                                return <IdentifiedBLErrorDetails {...props} currentCompany={this.props.currentCompany} signOut={this.props.signOut} dataSendToApiHeader={this.props.dataSendToApiHeader} supplier={this.props.usertype} userData={this.props.userData} />
                            }}/>
                            <Route exact path="/ResponseDestination/:DestinationTypeId/ResponseDestinationUpdate" render={(props) => {
                                return <ResponseDestinationUpdate {...props} currentCompany={this.props.currentCompany}
                                                                  signOut={this.props.signOut}
                                                                  dataSendToApiHeader={this.props.dataSendToApiHeader}
                                                                  userData={this.props.userData}/>
                            }}/>
                            <Route exact path="/StatusResponse" render={(props) => {
                                return <StatusResponse {...props} currentCompany={this.props.currentCompany} signOut={this.props.signOut} dataSendToApiHeader={this.props.dataSendToApiHeader} userData={this.props.userData} />
                            }}/>

                            <Route exact path="/ISFResponseDetails/:ISFResponseTransactionID" render={(props) => {
                                return <SingleResponseDetails {...props} currentCompany={this.props.currentCompany} signOut={this.props.signOut} dataSendToApiHeader={this.props.dataSendToApiHeader} userData={this.props.userData} />
                            }}/>
                            <Route exact path="/EventType/:EventTypeId/EventTypeDetail" render={(props) => {
                                return <EventTypeUpdate {...props} currentCompany={this.props.currentCompany}
                                                        signOut={this.props.signOut}
                                                        dataSendToApiHeader={this.props.dataSendToApiHeader}
                                                        userData={this.props.userData}/>
                            }}/>

                            <Route exact path="/ISFLogDetailsSN/:ISFResponseTransactionID/SNAuditLog" render={(props) => {
                                return <ISFAuditLogSN {...props} currentCompany={this.props.currentCompany} signOut={this.props.signOut} dataSendToApiHeader={this.props.dataSendToApiHeader} userData={this.props.userData} />
                            }}/>
                            <Route exact path="/ISFLogDetailsSA/:ISFResponseTransactionID/SAAuditLog" render={(props) => {
                                return <ISFAuditLogSA {...props} currentCompany={this.props.currentCompany} signOut={this.props.signOut} dataSendToApiHeader={this.props.dataSendToApiHeader} userData={this.props.userData} />
                            }}/>




                            <Route path='/user/logout/'/>
                            <Redirect from='*' to='/IdentifiedData' />
                        </Switch>
                    </main>
                    <MobileNav headerData={HeaderData}/>
                </div>
            </div>
        )
    }
}



export default App