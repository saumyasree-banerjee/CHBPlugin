import React, { Component } from 'react';
import Loader from '../Common/Loader';
import {DataTable} from "damco-components";
import {Link} from 'react-router-dom';
import API from "../../../Constants/API-config";

class IdentifiedBLErrorDetails extends Component {
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


            loader:false,


            hideuccessState:false,
            clear:true,
            width:1,
            speed:false,
            intervalSetForContentRefresh:60000,
            intervalSetForContentAfterLoad:5000,
            timeoutSetForContentAfterLoad:120000,
            ShipmentID:'',
            showDialog:false,
            textValue:null,
            statusCheck:false,
            blDetailsCheck:false,
            errorContent:[],
            Status:"",
            hits:''

        }
        this.ErrorDetails=this.ErrorDetails.bind(this);
        this.loadBIIdentifiedTableData=this.loadBIIdentifiedTableData.bind(this);



    }

    componentDidMount = () => {
        // let self = this;

        this.loadBIIdentifiedTableData();
        // let ShipmentID = this.props.match.params.ShipmentId;

        this.setState({loader: true,});
    }
    loadBIIdentifiedTableData(){

        let self = this;

        if(self.props.match.params.CommercialInvoiceHeaderID===undefined){
           self.setState({
               ShipmentID:self.props.match.params.ShipmentId
           })

        }
        else if(self.props.match.params.ShipmentId===undefined){
            self.setState({
                ShipmentID:self.props.match.params.CommercialInvoiceHeaderID
            })
        }
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
            self.ErrorDetails(data);

        });

    }
    ErrorDetails(tokenData) {
        let self = this;

        let urlsFinal='';

        // let queryString = self.props.match.params.ShipmentId
        if(self.props.match.params.CommercialInvoiceHeaderID===undefined){
            self.setState({
                ShipmentID:self.props.match.params.ShipmentId
            })
            if(self.props.match.params.Status==="DeliveredToCW1" || self.props.match.params.Status==="DeliveredToEmma" || self.props.match.params.Status==="DeliveredToKewill")
            {
                urlsFinal=  API.BLDELIVEREDTOCW1 + self.state.ShipmentID;
            }
        else{
                urlsFinal=API.BLERRORDETAILS + self.state.ShipmentID
            }


        }
        else if(self.props.match.params.ShipmentId===undefined){
            self.setState({
                ShipmentID:self.props.match.params.CommercialInvoiceHeaderID
            })
            if(self.props.match.params.Status==="DeliveredToCW1" || self.props.match.params.Status==="DeliveredToEmma" || self.props.match.params.Status==="DeliveredToKewill")
            {
                urlsFinal=  API.BLERROR_DOWN+ self.state.ShipmentID;
            }
            else{
                urlsFinal=API.BLERROR_DETAIL + self.state.ShipmentID
            }

        }
        if (tokenData !== "") {
            fetch(urlsFinal , {
                method: "GET", // *GET, POST, PUT, DELETE, etc.

                headers: {
                    'pragma': 'no-cache',
                    'Accept': 'text/html',
                    "Content-Type": "application/json; charset=UTF-8",
                    'Authorization': 'Bearer ' + tokenData,
                    'Access-Control-Allow-Origin': '*',
                }
            }).then(function (response) {
                if(self.props.match.params.Status==="DeliveredToCW1"|| self.props.match.params.Status==="DeliveredToEmma" || self.props.match.params.Status==="DeliveredToKewill"){
                    return response.text()
                }
                else{
                    return response.json()
                }

            }).then(function (data) {
                let errorContents=[];

                if(self.props.match.params.Status==="DeliveredToCW1" || self.props.match.params.Status==="DeliveredToEmma" || self.props.match.params.Status==="DeliveredToKewill")
                {
                     self.setState({
                         hits:data,
                         loader:false
                     })
                }
               else {


                    if (data !== null) {
                        errorContents.push(data);


                      errorContents.map(item => {

                            if ( item.Time !== '' && item.Time != null) {
                                let yearConst = item.Time.slice(0, 4);
                                let monthConst = item.Time.slice(5, 7);
                                let daysConst = item.Time.slice(8, 10);
                                let hours = item.Time.slice(11, 19);
                                item.Time = yearConst + '-' + monthConst + '-' + daysConst + " " + hours;



                            }
                          return null;
                        })
                        self.setState({
                            loader: false,
                            errorContent: errorContents

                        });





                        ////

                        if (self.state.errorContent === undefined || self.state.errorContent === null) {

                            self.setState({
                                blDetailsCheck: true
                            })

                            self.setState({
                                textValue: "No  Details found."
                            })
                        }
                    } else if (data === null) {
                        self.setState({
                            blDetailsCheck: true,
                            textValue: "No  Details found.",
                            loader: false
                        })
                    }
                }
            })}
    };

    fetchData(state, instance) {
    }


    render(){
        return(
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
                                <h1>Status Details</h1>
                            </li>
                        </ul>
                </div>
                <div>
                    {
                        (this.props.match.params.Status==='DeliveredToCW1' || this.props.match.params.Status==='DeliveredToEmma' || this.props.match.params.Status==="DeliveredToKewill")?
                            <section className="page-container">

                                <div className="grid-wrapper">
                                    {
                                        (this.state.hits !== undefined && this.state.hits !== null && this.state.hits !== "") ?
                                            <div>
                                                <label > {this.state.hits}</label></div>
                                        :

                                            <div className="col-50">
                                                No Details Present </div>
                                    }

                                </div>
                            </section>:

                        <section className="page-container">

                            <div className="grid-wrapper">
                                {
                                    (this.state.errorContent !== undefined && this.state.errorContent !== null && this.state.errorContent.length !== 0) ?
                                        <DataTable
                                            data={this.state.errorContent}
                                            columns={[
                                                {
                                                    headerClassName: 'data-table header ',
                                                    accessor: "UniqueId",
                                                    editable: false,
                                                    isLink: false,
                                                    fieldHeader: 'UniqueId',
                                                    show: true,
                                                },

                                                {
                                                    headerClassName: 'data-table header',
                                                    accessor: "MessageLevel",
                                                    isStatus: false,
                                                    isLink: false,
                                                    fieldHeader: 'Message Level ',
                                                    show: true,
                                                    footer: null

                                                },
                                                {
                                                    headerClassName: 'data-table header',
                                                    accessor: "Message",
                                                    isStatus: false,
                                                    isLink: false,
                                                    fieldHeader: 'Message ',
                                                    show: true,
                                                    footer: null

                                                },
                                                {
                                                    headerClassName: 'data-table header',
                                                    accessor: "Time",
                                                    isStatus: false,
                                                    isLink: false,
                                                    fieldHeader: 'Time ',
                                                    show: true,
                                                    footer: null

                                                }
                                            ]}
                                            isSelectable={true}
                                            isSortable={false}
                                            isEditable={false}
                                            hasFooter={false}
                                            isExpandable={false}
                                            manualPagination={true}
                                            showPagination={false}
                                            showColumnOptions={true}
                                            fetchData={this.fetchData.bind(this)}
                                            tableName={"ErrorTable"}
                                            ref={(dataTable) => {
                                                this.dataTable = dataTable;
                                            }}
                                            actions={this.state.actions}
                                            height={"auto"}
                                        /> :


                                            <div className="col-50">
                                                No Details Present </div>
                                }

                            </div>
                        </section>
                    }
                </div>
                <Loader loader={this.state.loader} />
            </div>
        )
    }
}





export default IdentifiedBLErrorDetails;