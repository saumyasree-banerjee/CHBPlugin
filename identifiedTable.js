import React, { Component } from 'react';

import {DataTable} from 'damco-components';
import API from "../../../Constants/API-config";

class IdentifiedTableContent extends Component {
    constructor(props) {
        super(props);
        this.loadIdentifiedTableData=this.loadIdentifiedTableData.bind(this);
        this.tokenDataService=this.tokenDataService.bind(this);
        this.state = {
            isSelectable: true,

            identifiedTableContent:null,

            columns: [],
            clicking:true,
            pageNumber:1

        }
    }

    showErrorDetails = (e,fileName) =>{
        e.preventDefault();
        this.props.showErrorDetails(fileName);
    }
    loadIdentifiedTableData(state, instance) {
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
                console.log('Created :', data);
                sessionStorage.setItem("tokenDataFromAud", JSON.stringify(data));
                tokenData = data;
                self.tokenDataService(tokenData, state, instance);
            });
        }
    };
    tokenDataService(tokenData, state, instance) {
        let self = this;
        //  this.tokenData=tokenData;

        if (tokenData !== "") {
            fetch(API.CUSTOMER_INVOICE_RESULT +"?pageNumber="+state.page+"&pageSize="+state.pageSize, {
                method: "POST", // *GET, POST, PUT, DELETE, etc.

                body: "[]",

                headers: {
                    'pragma': 'no-cache',

                    "Content-Type": "application/json",
                    "Accept": "text/html",
                    'Authorization': 'Bearer ' + tokenData,
                    'Access-Control-Allow-Origin': '*',
                }


            }).then(function (response) {

                console.log('SecondAPICreated :', response);
                return response.json()
            }).then(function (data) {
                //console.log('Created :', data);
                //console.log('SecondAPI :', data);
                data.PluginCIFiles.map(item => {
                    // let temp = Object.assign({}, item);
                    item.CommercialInvoiceHeaderID= item.CommercialInvoiceHeaderID.toString();

                    item.CommercialInvoiceHeaderID=[item.CommercialInvoiceHeaderID,"/CIDetails/"+item.CommercialInvoiceHeaderID]
                    //  self.state.identifiedTableContent.push(item);


                });

                console.log(data)
                console.log(self.state)
                self.setState({
                    loader: false,
                    identifiedTableContent: data.PluginCIFiles,
                    test:"higggggg"
                });


            })
        }
    };

    fetchData(state, instance){
        this.loadIdentifiedTableData(state, instance);
        console.log(state);
        console.log(state.page);


    }


    render(){
      //  const { sortable } = this.state.sortable;
        console.log(this.state.identifiedTableContent)

        return(
            <main className="full-width">
                {this.state.test}

                {
                    (this.state.identifiedTableContent && this.state.identifiedTableContent.length>0)?
                        <div>
                            <DataTable
                                data={this.state.identifiedTableContent}
                                columns={[
                                    {

                                        headerClassName: 'data-table header ',
                                        accessor: "CommercialInvoiceHeaderID",
                                        editable: false,
                                        isLink: true,
                                        fieldHeader: 'CI Header',
                                        show: true,


                                    },

                                    {

                                        headerClassName: 'data-table header ',
                                        accessor: "CommercialInvoiceReference",
                                        editable: false,
                                        isLink: true,
                                        fieldHeader: 'CI Reference',
                                        show: true,


                                    },
                                    {
                                        headerClassName: 'data-table header',
                                        accessor: "CommercialInvoiceDate",

                                        isStatus: false,
                                        isLink: false,
                                        fieldHeader: 'Invoice Date',
                                        show: true,

                                        footer: null
                                    },
                                    {
                                        headerClassName: 'data-table header',

                                        accessor: "ShipperName",

                                        isStatus: false,
                                        isLink: false,
                                        fieldHeader: "Shipper Name",
                                        show: true


                                    },
                                    {
                                        headerClassName: 'data-table header',

                                        accessor: "ConsigneeName",

                                        editType: "text",
                                        isStatus: false,
                                        isLink: false,
                                        fieldHeader: "Consignee",
                                        show: true

                                    },
                                    {
                                        headerClassName: 'data-table header ',

                                        accessor: "CustomerID",
                                        editable: false,
                                        isLink: false,
                                        fieldHeader: 'Customer Ref no',
                                        show: true,

                                    },
                                    {
                                        headerClassName: 'data-table header',
                                        accessor: "EventDate",
                                        editable: false,

                                        isLink: false,
                                        fieldHeader: 'Created Time',
                                        show: true,

                                    },
                                    {
                                    headerClassName: 'data-table header',
                                    accessor: "Status",
                                    editable: false,

                                    isLink: false,
                                    fieldHeader: 'Status',
                                    show: true,

                                }


                                ]}

                                isSelectable={true}
                                selectedOption={"single"}

                                isSortable={false}

                                isEditable={false}

                                hasFooter={false}
                                isExpandable={false}
                                manualPagination={true}
                                showPagination={true}
                                showColumnOptions={false}
                                pageCount={this.state.pageNumber}
                                fetchData={this.fetchData.bind(this)}
                                tableName={"MyTable"}
                                ref={(dataTable) => { this.dataTable = dataTable; }}
                                statusOptions={this.state.statusOptions}
                                actions={this.state.actions}
                                height={400
                                }/>
                        </div>

                        :
                        <div className="message info"><i aria-hidden="true" className="fa fa-info-circle fa-3x"></i><span id="message_success">No data found</span></div>
                }


            </main>
        )
    }
}

export default IdentifiedTableContent;