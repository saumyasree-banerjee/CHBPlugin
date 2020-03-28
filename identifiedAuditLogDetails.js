import React, { Component } from 'react';
import Loader from '../Common/Loader';
import ModalError from '../Common/Error';
import {DataTable} from "damco-components";
import {Link} from 'react-router-dom';
import API from "../../../Constants/API-config";

class IdentifiedAuditLog extends Component {
    constructor(props){
        super(props);

        this.state={
            loader:true,
            commercialInvoiceHeaderID:this.props.match.params.CommercialInvoiceHeaderID,
            pageNumber: 1,
            CommIDTitle:''
        }


    }

    componentDidMount = () => {
        // console.log(this.state.commercialInvoiceHeaderID, 'commercialInvoiceHeaderID');
    };

    fetchTranslationData(state, instance) {
        this.initializeToken(state, instance);
    }
    initializeToken(state, instance) {
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
                sessionStorage.setItem("tokenDataFromAud", JSON.stringify(data));
                tokenData = data;
                self.searchTranslationService(tokenData, state, instance);
            });
        }
    };
    searchTranslationService(tokenData, state, instance) {
        // console.log(state, ' State');
        let self = this;
        let pagetotal = state.page + 1;
        let pageSize = 10;
        let jsonObj = [];
        if(self.state.colObj === []){
            jsonObj = "[]";
        } else {
            jsonObj = self.state.colObj;
        }
        // console.log(jsonObj, ' :JSON OBJ');
        if (tokenData !== "") {
            fetch(API.IDENTIFIED_AUDIT_LOG + "?RecordId=" + this.state.commercialInvoiceHeaderID + "&RecordType=CI&pageNumber=" + pagetotal + "&pageSize=" + pageSize ,{
                method: "GET",
                body: JSON.stringify(jsonObj),
                headers: {
                    'pragma': 'no-cache',
                    "Content-Type": "application/json",
                    "Accept": "text/html",
                    'Authorization': 'Bearer ' + tokenData,
                    'Access-Control-Allow-Origin': '*',
                }
            }).then(function (response) {
                return response.json();
            }).then(function (data) {
                let record = data.TotalRecords % state.pageSize;
                if (record === 0) {
                    let pagenum = (data.TotalRecords) / state.pageSize;
                    self.setState({
                        pageNumber: pagenum
                    })
                } else {
                    let remain = data.TotalRecords % state.pageSize;
                    self.setState({
                        pageNumber: (((data.TotalRecords) - remain) / state.pageSize) + 1
                    })
                }

                if(data.PluginTranslation !== null) {


                    data.AuditLog.map(item => {
                        item.UpdatedDateTime = item.UpdatedDateTime.toString();
                        if(item.UpdatedDateTime !== '' && item.UpdatedDateTime !== null) {
                            let yearConst = item.UpdatedDateTime.slice(0,4);
                            let monthConst = item.UpdatedDateTime.slice(5,7);
                            let daysConst = item.UpdatedDateTime.slice(8, 10);
                            let hours = item.UpdatedDateTime.slice(11, 19);
                            item.UpdatedDateTime = yearConst + '-' + monthConst + '-' + daysConst + " " + hours;
                        }
                        return null;
                    });


                    self.setState({
                        loader: false,
                        translationTableContent: data.AuditLog,
                        CommIDTitle:data.ID
                    });
                }
            })
        }
    }



    render(){
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
                                <h1>Audit Log</h1>
                            </li>
                        </ul>
                    </div>
                    <br/>
                    <div className="grid-wrapper">
                        <div className="col-100">
                            {
                                (this.state.CommIDTitle!==null)?  <div><h2>Commercial Invoice: {this.state.CommIDTitle}</h2></div>:<div></div>
                            }


                            <DataTable
                                data={this.state.translationTableContent}
                                columns={[
                                    {
                                        headerClassName: 'data-table header ',
                                        accessor: "RecordType",
                                        editable: false,
                                        isLink: false,
                                        fieldHeader: 'Record Type',
                                        show: true
                                    },
                                    {
                                        headerClassName: 'data-table header ',
                                        accessor: "UpdatedStatus",
                                        editable: false,
                                        isLink: false,
                                        fieldHeader: 'Updated Status',
                                        show: true
                                    },
                                    {
                                        headerClassName: 'data-table header ',
                                        accessor: "Message",
                                        editable: false,
                                        isLink: false,
                                        fieldHeader: 'Message',
                                        show: true
                                    },
                                    {
                                        headerClassName: 'data-table header ',
                                        accessor: "FileName",
                                        editable: false,
                                        isLink: false,
                                        fieldHeader: 'File Name',
                                        show: true
                                    },
                                    {
                                        headerClassName: 'data-table header ',
                                        accessor: "UpdatedDateTime",
                                        editable: false,
                                        isLink: false,
                                        fieldHeader: 'Updated Date',
                                        show: true
                                    },

                                    {
                                        headerClassName: 'data-table header ',
                                        accessor: "Updatedby",
                                        editable: false,
                                        isLink: false,
                                        fieldHeader: 'Updated By',
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
                                fetchData={this.fetchTranslationData.bind(this)}
                                tableName={"ciAuditLog"}
                                ref={(dataTable) => {
                                    this.dataTable = dataTable;
                                }}
                                statusOptions={this.state.statusOptions}
                                actions={this.state.actions}
                                height={400}/>
                        </div>
                    </div>

                </div>
                <div>

                </div>
                <Loader loader={this.state.loader} />
                <ModalError errorModalHide={this.errorModalHide} modalerror={this.state.modalerror} modalerrorMSG={this.state.modalerrorMSG} btnTitle2={"Ok"} />
            </div>
        )
    }
}

export default IdentifiedAuditLog;