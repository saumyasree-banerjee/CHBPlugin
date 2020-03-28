import React, { Component } from 'react';
import Loader from '../Common/Loader';
import ModalError from '../Common/Error';
import IdentifiedBLDetailsTable from "./IdentifiedBLDetailsTable";
import {saveAs} from "file-saver";
import {InPageDialog} from "damco-components";
import {Link} from 'react-router-dom';
import API from "../../../Constants/API-config";
import ReactExport from "react-export-excel";

class IdentifiedBISuccess extends Component {
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

            LineTableContent:null,
            identifiedTableContent:null,
            loader:false,
            modalerror:false,
            modalerrorMSG:"Unexpected error occured! Please try after some time.",
            loaderupload:false,
            hideuccessState:false,
            hideErrorState:false,
            isDisabled: true,
            isDisabledSelect: false,
            iconWrapper:true,
            fileInfo:false,
            fileName:'',
            progress:false,
            clear:true,
            width:1,
            speed:false,
            intervalSetForContentRefresh:60000,
            intervalSetForContentAfterLoad:5000,
            timeoutSetForContentAfterLoad:120000,
            ShipmentID:this.props.match.params.ShipmentId,
            showDialog:false,
            textValue:null,
            statusCheck:false,
            blDetailsCheck:false,
            dataForExport:null
        }
        this.customerSearchResultService=this.customerSearchResultService.bind(this);
        this.loadBIIdentifiedTableData=this.loadBIIdentifiedTableData.bind(this);
        this.FileDownDetails=this.FileDownDetails.bind(this);
        this.fileDownloadin=this.fileDownloadin.bind(this);
        this.fileProcess=this.fileProcess.bind(this);
        this.ReprocessData=this.ReprocessData.bind(this);
        this.deActivate=this.deActivate.bind(this);
        this.FileDeactivate=this.FileDeactivate.bind(this);


    }

    componentDidMount = () => {
        // let self = this;
        this.loadBIIdentifiedTableData();
        this.setState({loader: true,});
    }
    FileDownDetails(tokenData) {
        let self = this;
        let queryString = self.props.match.params.ShipmentId;
       // let queryString="3307";
        if (tokenData !== "") {


            fetch(API.BIDOWNLOAD + queryString, {
                headers: {
                    'pragma': 'no-cache',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + tokenData,
                    'Access-Control-Allow-Origin': '*',
                }


            }).then(function (response) {
                const res = response.blob();
                return res
            }).then(function (responseJson) {

                saveAs(responseJson, 'new.txt');


            })


        }

    };
    fileDownloadin = () => {
        let self = this;

        var tokenData = '';
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
                self.FileDownDetails(tokenData);

            });
        }
    };
    fileProcess = () => {
        let self = this;
        var tokenData = '';
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
                self.ReprocessData(tokenData);

            });
        }

    }
    ReprocessData = (tokenData) => {
        let self = this;


        let queryString = self.props.match.params.ShipmentId;


        if (tokenData !== "") {
            fetch(API.BLREPROCESS + queryString+ '&user=' + sessionStorage.getItem('userMail'), {
                method: "POST", // *GET, POST, PUT, DELETE, etc.
                headers: {
                    'pragma': 'no-cache',

                    "Content-Type": "application/json",

                    'Authorization': 'Bearer ' + tokenData,
                    'Access-Control-Allow-Origin': '*',
                }


            }).then(function (response) {


                if (response.status === 200) {
                    self.setState({
                        showDialog: true
                    })
                    self.setState({
                        statusCheck: false
                    })
                    self.setState({
                        textValue: "Reprocess done successfully"
                    })
                } else {
                    self.setState({
                        showDialog: false
                    })
                    self.setState({
                        statusCheck: true
                    })
                    self.setState({
                        textValue: "Reprocess  unsuccessfully"
                    })
                }


                return response;
            }).then(function (data) {



            })
        }

    }
    FileDeactivate(tokenData){

        let self = this;
       let queryString = self.props.match.params.ShipmentId;
        if (tokenData !== "") {
            fetch(API.BLDEACTIVATE + queryString, {
                method: "GET", // *GET, POST, PUT, DELETE, etc.
                headers: {
                    'pragma': 'no-cache',

                    "Content-Type": "application/json",

                    'Authorization': 'Bearer ' + tokenData,
                    'Access-Control-Allow-Origin': '*',
                }


            }).then(function (response) {


                if (response.status === 200) {
                    self.setState({
                        showDialog: true
                    })
                    self.setState({
                        statusCheck: false
                    })
                    self.setState({
                        textValue: "Deactivated  successfully"
                    })
                } else {
                    self.setState({
                        showDialog: false
                    })
                    self.setState({
                        statusCheck: true
                    })
                    self.setState({
                        textValue: "Deactivated  unsuccessfully"
                    })
                }
                return response;
            }).then(function (data) {

            })
        }

    };

    deActivate=()=>{

        let self = this;
        var tokenData = '';
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
                self.FileDeactivate(tokenData);
            });
        }

    }
    loadBIIdentifiedTableData(){
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
            self.customerSearchResultService(data);

        });

    }
    customerSearchResultService(tokenData) {
        let self = this;
        let queryString = self.props.match.params.ShipmentId
        if (tokenData !== "") {
            fetch(API.BLDETAILS +queryString  , {
                method: "GET", // *GET, POST, PUT, DELETE, etc.

                headers: {
                    'pragma': 'no-cache',
                    'Accept': 'text/html',
                    "Content-Type": "application/json; charset=UTF-8",
                    'Authorization': 'Bearer ' + tokenData,
                    'Access-Control-Allow-Origin': '*',
                }
            }).then(function (response) {
                return response.json()
            }).then(function (data) {
                var values1 = data.CIs.map((_arrayElement) => Object.assign({}, _arrayElement));
                self.setState({
                    dataForExport: values1
                })

                self.setState({
                    loader: false,
                    configureTableContent: data.BL

                });
                if(self.state.configureTableContent.ExpectedTimeArrival !== '' && self.state.configureTableContent.ExpectedTimeArrival !== null) {
                    let yearConst = self.state.configureTableContent.ExpectedTimeArrival.slice(0,4);
                    let monthConst = self.state.configureTableContent.ExpectedTimeArrival.slice(5,7);
                    let daysConst = self.state.configureTableContent.ExpectedTimeArrival.slice(8, 10);
                    let hours = self.state.configureTableContent.ExpectedTimeArrival.slice(11, 19);
                    self.state.configureTableContent.ExpectedTimeArrival = yearConst + '-' + monthConst + '-' + daysConst + " " + hours;
                }
                if(self.state.configureTableContent.ExpectedTimeDeparture !== ''  && self.state.configureTableContent.ExpectedTimeDeparture !== null) {
                    let yearConst = self.state.configureTableContent.ExpectedTimeDeparture.slice(0, 4);
                    let monthConst = self.state.configureTableContent.ExpectedTimeDeparture.slice(5, 7);
                    let daysConst = self.state.configureTableContent.ExpectedTimeDeparture.slice(8, 10);
                    let hours = self.state.configureTableContent.ExpectedTimeDeparture.slice(11, 19);
                    self.state.configureTableContent.ExpectedTimeDeparture= yearConst + '-' + monthConst + '-' + daysConst + " " + hours;;
                }
                if(self.state.configureTableContent===undefined || self.state.configureTableContent===null){

                    self.setState({
                        blDetailsCheck: true
                    })

                    self.setState({
                        textValue: "No BL Record found."
                    })

                }
                if (data.CIs != null) {

                    data.CIs.map(item => {
                        // let temp = Object.assign({}, item);
                        item.CommercialInvoiceHeaderID = item.CommercialInvoiceHeaderID.toString();
                         // item.CommercialInvoiceHeaderID=item.CommercialInvoiceHeaderID.toString()

                        item.CommercialInvoiceHeaderID = [item.CommercialInvoiceHeaderID, "/BICIDetails/" + item.CommercialInvoiceHeaderID]
                        //  self.state.identifiedBLTableContent.push(item);
                        return null;

                    });

                }
                self.setState({
                    LineTableContent:data.CIs
                })
            })
        }
    };

    closeDialog() {
        this.setState({
            showDialog: false
        })
        this.setState({
            statusCheck: false
        })

        this.setState({
            blDetailsCheck: false
        })
        this.setState({
                statusDetails:false
            }
        )
    }
    render(){
        let configureTableContent=this.state.configureTableContent;
        let showSuccess="";
        if(this.state.configureTableContent!==undefined && this.state.configureTableContent!==null){
            showSuccess=this.state.configureTableContent.Status;
        }
        const ExcelFile = ReactExport.ExcelFile;
        const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
        const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

        return(
            <div>
                <div>

                    <div className="header-group profile-template">

                            <ul className="page-title-group">
                                <li>
                                    <Link id="bck" to="/Identifieddata">
                                        <button className=" button-large button-transparent back-btn">
                                            <i className="fa fa-angle-left" aria-hidden="true"/>
                                        </button>
                                    </Link>
                                </li>
                                <li>
                                    <h1>Bill of Lading</h1>
                                </li>
                            </ul>

                    </div>
                    <br/>
                    <section className="page-container">
                        {
                            (configureTableContent !== undefined && configureTableContent !== null) ?
                                <div className="grid-wrapper button-group">
                                    <div className="col-80 ">
                                        <button type="button" onClick={(e) => this.fileDownloadin()}

                                                className="button-large button-blue">DOWNLOAD
                                        </button>
                                    </div>

                                    <div className="col-15 ">
                                        <button type="button" onClick={(e) => this.fileProcess()}

                                                className="button-large button-transparent">REPROCESS
                                        </button>
                                    </div>
                                    {
                                        (showSuccess !== 'Successful' && (showSuccess === 'Inserted' || showSuccess === 'Rejected' || showSuccess === 'Exempted')) ?

                                            <div className="col-15 ">
                                                <button type="button" onClick={(e) => this.deActivate()}

                                                        className="button-large button-transparent">DEACTIVATE
                                                </button>
                                            </div> : null
                                    }

                                </div>:null
                        }

                    </section>
                    <section className="page-container">
                        <div className="grid-wrapper">
                            <div className="col-100 ">
                                <InPageDialog showDialog={this.state.showDialog} type={"success"} message={this.state.textValue}
                                              closeMethod={() => this.closeDialog()}/>
                                <InPageDialog showDialog={this.state.statusCheck} type={"error"}
                                              message={this.state.textValue} closeMethod={() => this.closeDialog()}/>
                            </div></div>
                    </section>
                    <br/>
                    {
                        (configureTableContent!== undefined && configureTableContent!==null)?
                            <section className="page-container">

                                <div className="grid-wrapper">
                                    <div className="col-50 child-grid-wrapper">
                                        <div className="col-50 large-inactive-text">
                                            <div>BL Number</div>
                                        </div>
                                        <div className="col-50 large-inactive-text">
                                            <div>Carrier Code</div>
                                        </div>
                                    </div>
                                    <div className="col-50 child-grid-wrapper">
                                        <div className="col-50 large-inactive-text">
                                            <div>Type</div>
                                        </div>
                                        <div className="col-50 large-inactive-text">
                                            <div>Version</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid-wrapper">
                                    <div className="col-50 child-grid-wrapper">
                                        <div className="col-50 ">
                                            <input disabled={true} className="form-control"
                                                   value={configureTableContent.BlNumber}/>
                                        </div>
                                        <div className="col-50">
                                            <input disabled={true} className="form-control"  value={configureTableContent.BlCarrierCode}/>
                                        </div>
                                    </div>
                                    <div className="col-50 child-grid-wrapper">
                                        <div className="col-50">
                                            <input disabled={true} className="form-control" value={configureTableContent.BL_TYPE}/>
                                        </div>
                                        <div className="col-50">

                                            <input disabled={true} className="form-control" value={configureTableContent.Version}/>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid-wrapper">
                                    <div className="col-50 child-grid-wrapper">
                                        <div className="col-50">
                                            <div className="large-inactive-text">Packages</div>
                                            <div><input disabled={true} className="form-control" value={configureTableContent.BlPackages}/></div>
                                        </div>
                                        <div className="col-50">
                                            <div className="large-inactive-text">Volume</div>
                                            <div><input disabled={true} className="form-control" value={configureTableContent.BlMeasurement}/>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-50 child-grid-wrapper">
                                        <div className="col-50">
                                            <div className="large-inactive-text">Weight</div>
                                            <div><input disabled={true}  className="form-control" value={configureTableContent.BlWeight}/></div>

                                        </div>
                                        <div className="col-50">
                                            <div className="large-inactive-text">Vessel Name</div>
                                            <div><input disabled={true} className="form-control" value={configureTableContent.VesselName}/></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid-wrapper">
                                    <div className="col-50 child-grid-wrapper">
                                        <div className="col-50">
                                            <div className="large-inactive-text">ETD</div>
                                            <div><input disabled={true} className="form-control" value={configureTableContent.ExpectedTimeDeparture}/></div>
                                        </div>
                                        <div className="col-50">
                                            <div className="large-inactive-text">ETA</div>
                                            <div><input disabled={true} className="form-control" value={configureTableContent.ExpectedTimeArrival}/>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-50 child-grid-wrapper">
                                        <div className="col-50">
                                            <div className="large-inactive-text">Local Port</div>
                                            <div><input disabled={true} className="form-control" value={configureTableContent.SHIPPORCODE}/></div>
                                        </div>
                                        <div className="col-50">
                                            <div className="large-inactive-text">Discharge Port</div>
                                            <div><input disabled={true}className="form-control" value={configureTableContent.SHIP_LOAD_CODE}/></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid-wrapper">
                                    <div className="col-50 child-grid-wrapper">
                                        <div className="col-50">
                                            <div className="large-inactive-text">Consignee Name</div>
                                            <div><input disabled={true} className="form-control" value={configureTableContent.CONSIGNEE_NAME}/></div>
                                        </div>
                                        <div className="col-50">
                                            <div className="large-inactive-text">Shipper</div>
                                            <div><input disabled={true} className="form-control" value={configureTableContent.SHIPPER_NAME}/>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-50 child-grid-wrapper">
                                        <div className="col-50">
                                            <div className="large-inactive-text">Voyage</div>
                                            <div><input disabled={true} className="form-control" value={configureTableContent.VOYAGE}/></div>
                                        </div>
                                        <div className="col-50">
                                            <div className="large-inactive-text"></div>
                                            <div></div>
                                        </div>
                                    </div>
                                </div>
                            </section>:   <section className="page-container">

                                <div className="grid-wrapper">
                                    <div className="col-100">
                            <InPageDialog showDialog={this.state.blDetailsCheck} type={"error"}
                                                       message={this.state.textValue} closeMethod={() => this.closeDialog()}/>
                                    </div>
                                </div>
                            </section>
                                                       }
                </div>
                <div>
                    {
                        (this.state.LineTableContent !== undefined && this.state.LineTableContent !== null && this.state.LineTableContent.length>=1) ?
                            <section className="page-container">
                                <div className="grid-wrapper">
                                    <div className="col-100 ">
                                        <h1 className="title-blue-underline .large-body-text">ATTACHED COMMERCIAL INVOICES </h1>
                                    </div>
                                </div>
                                <div className="grid-wrapper">
                                    <div className="col-100 ">
                                        <ExcelFile filename={this.state.ShipmentID} element={<button type="button" className="button button-blue">Export to Excel</button>}>
                                            <ExcelSheet data={this.state.dataForExport} name="BL Details">





                                                <ExcelColumn label="CI Header" value="CommercialInvoiceHeaderID"/>
                                                <ExcelColumn label="Document Number" value="DocumentNumber"/>
                                                <ExcelColumn label="ShipperMpsIdentifier " value="ShipperMpsIdentifier"/>
                                                <ExcelColumn label="ShipperModsBusinessEntityCountryCode" value="ShipperModsBusinessEntityCountryCode"/>
                                                <ExcelColumn label="ShipperModsBusinessEntityCode" value="ShipperModsBusinessEntityCode"/>
                                                <ExcelColumn label="ShipperModsFunctionCode" value="ShipperModsFunctionCode"/>
                                                <ExcelColumn label="Shipper Name" value="ShipperName"/>
                                                <ExcelColumn label="Consignee Mps Identifier" value="ConsigneeMpsIdentifier"/>
                                                <ExcelColumn label="ConsigneeModsBusinessEntityCountryCode" value="ConsigneeModsBusinessEntityCountryCode"/>
                                                <ExcelColumn label="ConsigneeModsBusinessEntityode" value="ConsigneeModsBusinessEntityode"/>
                                                <ExcelColumn label="ConsigneeModsFunctionCode" value="ConsigneeModsFunctionCode"/>
                                                <ExcelColumn label="Consignee Name" value="ConsigneeName"/>
                                                <ExcelColumn label="Commercial Invoice Reference" value="CommercialInvoiceReference"/>
                                                <ExcelColumn label="Status" value="Status"/>
                                                <ExcelColumn label="Last Updated" value="LastUpdated"/>
                                                <ExcelColumn label="PDF Template" value="PDFTemplate"/>
                                                <ExcelColumn label="FobPointMps Identifier" value="FobPointMpsIdentifier"/>
                                                <ExcelColumn label="FobPoint Mods City CountryCode" value="FobPointModsCityCountryCode"/>
                                                <ExcelColumn label="FobPoint Mods City Code" value="FobPointModsCityCode"/>
                                                <ExcelColumn label="FobPoint Mods Site Code" value="FobPointModsSiteCode"/>
                                                <ExcelColumn label="FobPoint Name" value="FobPointName"/>
                                                <ExcelColumn label="CountryOfOrigin" value="CountryOfOrigin"/>


                                            </ExcelSheet>
                                        </ExcelFile>


                                    </div>
                                </div>
                                <div className="grid-wrapper">
                                    <div className="col-100 ">

                                        <IdentifiedBLDetailsTable  LineTableContent={this.state.LineTableContent} ShipmentID={this.state.ShipmentID} />
                                    </div>
                                </div>


                            </section>
                            : null
                    }
                </div>
                <Loader loader={this.state.loader} />
                <ModalError errorModalHide={this.errorModalHide} modalerror={this.state.modalerror} modalerrorMSG={this.state.modalerrorMSG} btnTitle2={"Ok"} />
            </div>
        )
    }
}





export default IdentifiedBISuccess;