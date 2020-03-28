import React, { Component } from 'react';
import Loader from '../Common/Loader';
import ModalError from '../Common/Error';
import IdentifiedLineTableContent from "./IdentifiedLineTableContent";
import {saveAs} from "file-saver";
import {InPageDialog} from "damco-components";
import {Link} from 'react-router-dom';
import API from "../../../Constants/API-config";
import ReactExport from "react-export-excel";

class IdentifiedCISuccess extends Component {
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
            docNum:this.props.match.params.DocumentNumber,
            showDialog:false,
            textValue:null,
            statusCheck:false,
            prevPath:null,
            urls:null,
            blDetailsCheck:false
        };
        this.customerSearchResultService=this.customerSearchResultService.bind(this);
        this.loadCIIdentifiedTableData=this.loadCIIdentifiedTableData.bind(this);
        this.FileDownDetails=this.FileDownDetails.bind(this);
        this.fileDownloadin=this.fileDownloadin.bind(this);
        this.fileProcess=this.fileProcess.bind(this);
        this.ReprocessData=this.ReprocessData.bind(this);
        this.deActivate=this.deActivate.bind(this);
        this.FileDeactivate=this.FileDeactivate.bind(this);


    }

    componentDidMount = () => {
        // let self = this;
        this.setState({
            showDialog:false
        });
        this.setState({
            statusCheck: false
        });
        this.setState({
            statusDetails:false
        });
        this.setState({
            blDetailsCheck:false
        });
        this.loadCIIdentifiedTableData();
        // let docNumber = this.props.match.params.DocumentNumber;

        this.setState({loader: true,});
    };


    FileDownDetails(tokenData) {
        let self = this;
        let queryString = self.props.match.params.DocumentNumber;
        if (tokenData !== "") {


            fetch(API.CIDETAIL_DOWNLOAD + queryString, {


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
                self.ReprocessData(tokenData);

            });
        }

    };
    ReprocessData = (tokenData) => {
        let self = this;


        let queryString = self.props.match.params.DocumentNumber;


        if (tokenData !== "") {
            fetch(API.CIDETAIL_REPROCESS + queryString + '&user=' + sessionStorage.getItem('userMail'), {
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
                    });
                    self.setState({
                        statusCheck: false
                    });
                    self.setState({
                        textValue: "Reprocess done successfully"
                    })
                } else {
                    self.setState({
                        showDialog: false
                    });
                    self.setState({
                        statusCheck: true
                    });
                    self.setState({
                        textValue: "Reprocess  unsuccessfully"
                    })
                }


                return response;
            }).then(function (data) {



            })
        }

    };
    FileDeactivate(tokenData){
        let self = this;
        let queryString = self.props.match.params.DocumentNumber;
        if (tokenData !== "") {
            fetch(API.CIDETAIL_DEACTIVATE + queryString, {
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
                        showDialog: true,
                        statusCheck: false,
                        textValue: "Deactivated  successfully"
                    })
                } else {
                    self.setState({
                        showDialog: false,
                        statusCheck: true,
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
                self.FileDeactivate(tokenData);
            });
        }

    };
    loadCIIdentifiedTableData(){
        let self = this;
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
            sessionStorage.setItem("tokenDataFromAud", JSON.stringify(data));
            self.customerSearchResultService(data);

        });

    }
    customerSearchResultService(tokenData) {
        let self = this;
        if (tokenData !== "") {
            fetch(API.CIDETAIL_GET + this.state.docNum, {
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
                self.setState({
                    loader: false,
                    configureTableContent: data.HeaderAndSummary[0],
                    LineTableContent:data.Lines
                });
                if(self.state.configureTableContent=== undefined || self.state.configureTableContent===null){
                    self.setState({
                        blDetailsCheck:true,
                        textValue:" CI details  is not available"
                    })

                }
                data.HeaderAndSummary.map(item => {
                    if(item.LastUpdated!== '' && item.LastUpdated!=null) {
                        let yearConst = item.LastUpdated.slice(0, 4);
                        let monthConst =item.LastUpdated.slice(5, 7);
                        let daysConst = item.LastUpdated.slice(8, 10);
                        let hours = item.LastUpdated.slice(11, 19);
                        item.LastUpdated = yearConst + '-' + monthConst + '-' + daysConst + " " + hours;
                    }
                    if(item.EventDate!== '' && item.EventDate!=null) {

                        let yearConst = item.EventDate.slice(0, 4);
                        let monthConst =item.EventDate.slice(5, 7);
                        let daysConst = item.EventDate.slice(8, 10);
                        let hours = item.EventDate.slice(11, 19);
                        item.EventDate = yearConst + '-' + monthConst + '-' + daysConst + " " + hours;
                    }
                    if(item.DepartureDateEstimated!== '' && item.DepartureDateEstimated!=null) {

                        let yearConst = item.DepartureDateEstimated.slice(0, 4);
                        let monthConst =item.DepartureDateEstimated.slice(5, 7);
                        let daysConst = item.DepartureDateEstimated.slice(8, 10);
                        let hours = item.DepartureDateEstimated.slice(11, 19);
                        item.DepartureDateEstimated = yearConst + '-' + monthConst + '-' + daysConst + " " + hours;
                    }
                    if(item.ArrivalDateEstimated!== '' && item.ArrivalDateEstimated!=null) {
                        let yearConst = item.ArrivalDateEstimated.slice(0, 4);
                        let monthConst =item.ArrivalDateEstimated.slice(5, 7);
                        let daysConst = item.ArrivalDateEstimated.slice(8, 10);
                        let hours = item.ArrivalDateEstimated.slice(11, 19);
                        item.ArrivalDateEstimated = yearConst + '-' + monthConst + '-' + daysConst + " " + hours;
                    }
                    return null;
                });
                self.setState({
                    loader: false,
                    configureTableContent: data.HeaderAndSummary[0],
                });
            })
        }
    };

    closeDialog() {
        this.setState({
            showDialog:false,
            statusCheck: false,
            statusDetails:false,
            blDetailsCheck:false
        })
    }
    render(){
        let configureTableContent=this.state.configureTableContent;
        let showSuccess="";
        if(this.state.configureTableContent!==undefined){
            showSuccess=this.state.configureTableContent.Status;
        }
        const ExcelFile = ReactExport.ExcelFile;
        const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
        const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;
        // let linesData=this.state.LineTableContent;

        /*const selectBoxOptions = [
            { value: 'File Name', label: 'File Name' },
            { value: 'Ref Id', label: 'Ref Id' },
            { value: 'Status', label: 'Status' }
        ]*/
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
                                <h1>Commercial Invoice</h1>
                            </li>
                        </ul>
                    </div>
                    <br/>
                    <section className="page-container">
                        {
                            (configureTableContent !== undefined && configureTableContent !== null)?
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
                        (configureTableContent!== undefined && configureTableContent!== null)?
                            <section className="page-container">
                                <div className="grid-wrapper">
                                    <div className="col-100 ">
                                        <h1 className="title-blue-underline"> Header Data</h1>
                                    </div>
                                </div>
                                <div className="grid-wrapper">
                                    <div className="col-50 child-grid-wrapper">
                                        <div className="col-50 large-inactive-text">
                                            <div>Document Number</div>
                                        </div>
                                        <div className="col-50 large-inactive-text">
                                            <div>Invoice Date</div>
                                        </div>
                                    </div>
                                    <div className="col-50 child-grid-wrapper">
                                        <div className="col-50 large-inactive-text">
                                            <div>Shipper Name</div>
                                        </div>
                                        <div className="col-50 large-inactive-text">
                                            <div>Consignee Name</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid-wrapper">
                                    <div className="col-50 child-grid-wrapper">
                                        <div className="col-50 ">
                                            <input disabled={true} className="form-control"
                                                   value={configureTableContent.DocumentNumber}/>
                                        </div>
                                        <div className="col-50">
                                            <input disabled={true} className="form-control"  value={configureTableContent.CommercialInvoiceDate}/>
                                        </div>
                                    </div>
                                    <div className="col-50 child-grid-wrapper">
                                        <div className="col-50">
                                            <input disabled={true} className="form-control" value={configureTableContent.ShipperName}/>
                                        </div>
                                        <div className="col-50">

                                            <input disabled={true} className="form-control" value={configureTableContent.ConsigneeName}/>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid-wrapper">
                                    <div className="col-50 child-grid-wrapper">
                                        <div className="col-50">
                                            <div className="large-inactive-text">Customer Id </div>
                                            <div><input disabled={true} className="form-control" value={configureTableContent.CustomerID}/></div>
                                        </div>
                                        <div className="col-50">
                                            <div className="large-inactive-text">Created Time</div>
                                            <div><input disabled={true} className="form-control" value={configureTableContent.EventDate}/>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-50 child-grid-wrapper">
                                        <div className="col-50">
                                            <div className="large-inactive-text">Last Updated</div>
                                            <div><input disabled={true}  className="form-control" value={configureTableContent.LastUpdated}/></div>

                                        </div>
                                        <div className="col-50">
                                            <div className="large-inactive-text">Country Of Origin</div>
                                            <div><input disabled={true} className="form-control" value={configureTableContent.CountryOfOrigin}/></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid-wrapper">
                                    <div className="col-50 child-grid-wrapper">
                                        <div className="col-50">
                                            <div className="large-inactive-text">Departure Date</div>
                                            <div><input disabled={true} className="form-control" value={configureTableContent.DepartureDateEstimated}/></div>
                                        </div>
                                        <div className="col-50">
                                            <div className="large-inactive-text">Arrival Date</div>
                                            <div><input disabled={true} className="form-control" value={configureTableContent.ArrivalDateEstimated}/>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-50 child-grid-wrapper">
                                        <div className="col-50">
                                            <div className="large-inactive-text">Port Of Loading</div>
                                            <div><input disabled={true} className="form-control" value={configureTableContent.PortOfLoadingName}/></div>
                                        </div>
                                        <div className="col-50">
                                            <div className="large-inactive-text">Port Of Unloading</div>
                                            <div><input disabled={true}className="form-control" value={configureTableContent.PortOfDischargeName}/></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid-wrapper">
                                    <div className="col-50 child-grid-wrapper">
                                        <div className="col-50">
                                            <div className="large-inactive-text">Version</div>
                                            <div><input disabled={true} className="form-control" value={configureTableContent.Version}/></div>
                                        </div>
                                        <div className="col-50">
                                            <div className="large-inactive-text">Status</div>
                                            <div><input disabled={true} className="form-control" value={configureTableContent.Status}/></div>
                                        </div>

                                        <div className="col-50">
                                            <div className="large-inactive-text">Commercial Invoice</div>
                                            <div><input disabled={true} className="form-control" value={configureTableContent.CommercialInvoiceReference}/></div>
                                        </div>
                                    </div>
                                    <div className="col-50 child-grid-wrapper">
                                        <div className="col-50">
                                            <div className="large-inactive-text"></div>
                                            <div></div>
                                        </div>
                                        <div className="col-50">
                                            <div className="large-inactive-text"></div>
                                            <div></div>
                                        </div>
                                    </div>
                                </div>
                            </section>: <section className="page-container">
                                <div className="grid-wrapper">
                                    <div className="col-100 ">
                                        <InPageDialog showDialog={this.state.blDetailsCheck} type={"error"}
                                                      message={this.state.textValue} closeMethod={() => this.closeDialog()}/>
                                    </div>
                                </div>
                            </section>
                    }
                </div>
                <div>
                    {
                        (configureTableContent !== undefined && configureTableContent !== null) ?
                            <section className="page-container">
                                <div className="grid-wrapper">
                                    <div className="col-100 ">
                                        <h1 className="title-blue-underline .large-body-text">LINE DATA </h1>
                                    </div>
                                </div>
                                <div className="grid-wrapper">
                                    <div className="col-100 ">
                                        <ExcelFile filename={this.state.docNum} element={<button type="button" className="button button-blue">Export to Excel</button>}>
                                            <ExcelSheet data={this.state.LineTableContent} name="CI Details">




                                                <ExcelColumn label="CommercialInvoiceLineID" value="CommercialInvoiceLineID"/>
                                                <ExcelColumn label="Style Number" value="ProductStockKeepingUnitNumber"/>
                                                <ExcelColumn label="Item Description" value="ProductDescription"/>
                                                <ExcelColumn label="Quantity" value="Quantity"/>
                                                <ExcelColumn label=" Quantity Unit" value="Unit"/>
                                                <ExcelColumn label="Unit Price" value="OrderSpecificationAmount"/>
                                                <ExcelColumn label="Total Price " value="TotalPriceAmount"/>





                                            </ExcelSheet>
                                        </ExcelFile>


                                    </div>
                                </div>
                                <div className="grid-wrapper">
                                    <div className="col-100 ">

                                    <IdentifiedLineTableContent  LineTableContent={this.state.LineTableContent} docNum={this.state.docNum} />
                                    </div>
                                </div>

                                <div className="grid-wrapper">
                                    <div className="col-100 ">
                                        <h1 className="title-blue-underline .large-body-text">SUMMARY</h1>
                                    </div>
                                </div>
                                <div className="grid-wrapper">
                                    <div className="col-50 child-grid-wrapper">
                                        <div className="col-50 large-inactive-text">
                                            <div>Total Quantity</div>
                                        </div>
                                        <div className="col-50 large-inactive-text">
                                            <div>Total Packages</div>
                                        </div>
                                    </div>
                                    <div className="col-50 child-grid-wrapper">
                                        <div className="col-50 large-inactive-text">
                                            <div>Total Gross Weight</div>
                                        </div>
                                        <div className="col-50 large-inactive-text">
                                            <div>Total Net Weight</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid-wrapper">
                                    <div className="col-50 child-grid-wrapper">
                                        <div className="col-50 ">
                                            <input disabled={true} className="form-control"
                                                   value={configureTableContent.Quantity}/>
                                        </div>
                                        <div className="col-50">
                                            <input disabled={true} className="form-control"
                                                   value={configureTableContent.PackageQuantity}/>
                                        </div>
                                    </div>
                                    <div className="col-50 child-grid-wrapper">
                                        <div className="col-50">
                                            <input disabled={true} className="form-control"
                                                   value={configureTableContent.WeightMeasure}/>
                                        </div>
                                        <div className="col-50">

                                            <input disabled={true} className="form-control"
                                                   value={configureTableContent.TotalNetWeightMeasure}/>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid-wrapper">
                                    <div className="col-50 child-grid-wrapper">
                                        <div className="col-50 large-inactive-text">
                                            <div>Total Price</div>
                                        </div>
                                        <div className="col-50 large-inactive-text">
                                            <div>Trade Discount</div>
                                        </div>
                                    </div>
                                    <div className="col-50 child-grid-wrapper">
                                        <div className="col-50 large-inactive-text">
                                            <div>Pay Term Discount</div>
                                        </div>
                                        <div className="col-50 large-inactive-text">
                                            <div>Defective Allowance</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid-wrapper">
                                    <div className="col-50 child-grid-wrapper">
                                        <div className="col-50 ">
                                            <input disabled={true} className="form-control"
                                                   value={configureTableContent.TotalPriceAmount}/>
                                        </div>
                                        <div className="col-50">
                                            <input disabled={true} className="form-control"
                                                   value={configureTableContent.TradeDiscountUSDAmount}/>
                                        </div>
                                    </div>
                                    <div className="col-50 child-grid-wrapper">
                                        <div className="col-50">
                                            <input disabled={true} className="form-control"
                                                   value={configureTableContent.PayTermDiscountUSDAmount}/>
                                        </div>
                                        <div className="col-50">

                                            <input disabled={true} className="form-control"
                                                   value={configureTableContent.DefectiveAllowanceUSDAmount}/>
                                        </div>
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
export default IdentifiedCISuccess;