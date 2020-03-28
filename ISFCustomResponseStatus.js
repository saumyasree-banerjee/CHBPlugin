import React, { Component } from 'react';
import Loader from '../Common/Loader';
import {Link} from 'react-router-dom';
import API from "../../../Constants/API-config";

class ISFCustomResponseStatus extends Component {
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
            hits:'',
            url:''

        };
        this.ErrorDetails=this.ErrorDetails.bind(this);
        this.loadBIIdentifiedTableData=this.loadBIIdentifiedTableData.bind(this);



    }
    componentWillMount= () => {

    };

    componentDidMount = () => {
        // let self = this;


        this.loadBIIdentifiedTableData();
        // let ShipmentID = this.props.match.params.ShipmentId;

        this.setState({
            loader: true,
            url:"/ISFDetails/" + sessionStorage.getItem('docNum')
        });
    };
    loadBIIdentifiedTableData(){

        let self = this;

        if(self.props.match.params.ISFResponseTransactionID!==undefined){
            self.setState({
                ShipmentID:self.props.match.params.ISFResponseTransactionID
            })
        }


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
            self.ErrorDetails(data);

        });

    }
    ErrorDetails(tokenData) {
        let self = this;

        let urlsFinal='';
        var url = self.props.match.url;
        var lastChar = url.lastIndexOf("/");
        var urlLength=url.length;

        var lastString = url.slice(lastChar+1, urlLength );

        // let queryString = self.props.match.params.ShipmentId
        if(self.props.match.params.PluginStatus!==undefined){
            self.setState({
                ShipmentID:self.props.match.params.ISFResponseTransactionID
            });
            if(lastString === "SNStatus")
            {
               urlsFinal=  API.ISF_DELIVEREDSTATUS+ self.state.ShipmentID;
            }
            if(lastString === "SAStatus"){
                urlsFinal=API.ISF_SADELIVEREDSTATUS + self.state.ShipmentID ;
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
             //   if(self.props.match.params.PluginStatus==="Delivered" ){
                    return response.text()
               // }


            }).then(function (data) {
                let errorContents=[];

                if(self.props.match.params.PluginStatus!==undefined || self.props.match.params.PluginStatus!==null)
                {
                    self.setState({
                        hits:data,
                        loader:false
                    })
                }
                else {


                    if (data !== null) {
                        errorContents.push(data);
                        self.setState({
                            loader: false,
                            errorContent: errorContents

                        });
                        if (self.state.errorContent === undefined || self.state.errorContent === null) {

                            self.setState({
                                blDetailsCheck: true
                            });

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
                            <Link id="bck" to={this.state.url}>
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
                            </section>



                </div>
                <Loader loader={this.state.loader} />
            </div>
        )
    }
}





export default ISFCustomResponseStatus;