import React, { Component } from 'react';

import {DataTable} from 'damco-components';
import API from "../../../Constants/API-config";

class IdentifiedLineTableContent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isSelectable: true,
            data: this.props.LineTableContent,
            LineTableContent:null,

            columns: [],
            clicking:true,
            pageNumber:1
        }
        this.loadCIIdentifiedTableData=this.loadCIIdentifiedTableData.bind(this);
        this.customerSearchResultService=this.customerSearchResultService.bind(this);


    }

    showErrorDetails = (e,fileName) =>{
        e.preventDefault();
        this.props.showErrorDetails(fileName);
    }
    loadCIIdentifiedTableData(state,instance){
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
            self.customerSearchResultService(data,state,instance);

        });

    }
    customerSearchResultService(tokenData,state,instance) {
        let self = this;
        if (tokenData !== "") {
            fetch(API.CIDETAIL_GET + this.props.docNum, {


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

            })
        }
    };

    fetchData(state, instance){
        this.loadCIIdentifiedTableData(state,instance)
    }

    render(){

        return(
            <div>

                {
                    (this.props.LineTableContent && this.props.LineTableContent.length>0)?
                        <div>
                            <DataTable
                                data={this.props.LineTableContent}
                                columns={[
                                    {

                                        headerClassName: 'data-table header ',
                                        accessor: "CommercialInvoiceLineID",
                                        editable: false,
                                        isLink: false ,
                                        fieldHeader: 'Line Number',
                                        show: true,
                                    },
                                    {
                                        headerClassName: 'data-table header',
                                        accessor: "ProductStockKeepingUnitNumber",
                                        isStatus: false,
                                        isLink: false,
                                        fieldHeader: "Style Number",
                                        show: true
                                    },
                                    {
                                        headerClassName: 'data-table header',
                                        accessor: "ProductDescription",
                                        editable: true,
                                        editType: "text",
                                        isStatus: false,
                                        isLink: false,
                                        fieldHeader: "Item Description",
                                        show: true
                                    },
                                    {
                                        headerClassName: 'data-table header ',
                                        accessor: "Quantity",
                                        editable: false,
                                        isLink: false,
                                        fieldHeader: 'Quantity',
                                        show: true,

                                    },
                                    {
                                        headerClassName: 'data-table header',
                                        accessor: "Unit",
                                        editable: false,
                                        isLink: false,
                                        fieldHeader: 'Quantity Unit',
                                        show: true,

                                    },
                                    {
                                        headerClassName: 'data-table header',
                                        accessor: "OrderSpecificationAmount",
                                        editable: false,
                                        isLink: false,
                                        fieldHeader: 'Unit Price',
                                        show: true,

                                    },
                                    {
                                        headerClassName: 'data-table header',
                                        accessor: "TotalPriceAmount",
                                        editable: false,
                                        isLink: false,
                                        fieldHeader: 'Total Price',
                                        show: true,

                                    },

                                    {
                                        headerClassName: 'data-table header',
                                        accessor: "PackageQuantity",
                                        editable: false,
                                        isLink: false,
                                        fieldHeader: 'Number Of Packages',
                                        show: true,

                                    },
                                    {
                                        headerClassName: 'data-table header',
                                        accessor: "PackageType",
                                        editable: false,
                                        isLink: false,
                                        fieldHeader: 'Packages Unit',
                                        show: true,

                                    }


                                ]}

                                isSelectable={false}
                                isSortable={false}
                                isEditable={false}
                                hasFooter={false}
                                isExpandable={false}
                                manualPagination={true}
                                showPagination={true}
                                showColumnOptions={true}
                                pageCount={this.state.pageNumber}
                                fetchData={this.fetchData.bind(this)}
                                tableName={"CILineTable"}
                                ref={(dataTable) => { this.dataTable = dataTable; }}
                                statusOptions={this.state.statusOptions}
                                actions={this.state.actions}
                                height={"auto"}/>
                        </div>

                        :
                        <div className="message info"><i aria-hidden="true" className="fa fa-info-circle fa-3x"></i><span id="message_success">No data found</span></div>
                }


            </div>
        )
    }
}

export default IdentifiedLineTableContent;