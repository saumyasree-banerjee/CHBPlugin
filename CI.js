import React, {Component} from 'react';
import Loader from '../Common/Loader';
import {FilterSection, InPageDialog, ModalMain} from 'damco-components';
import {DataTable} from 'damco-components';
import API from "../../../Constants/API-config";
import {Environment} from "../../../Constants/Environment";
import ReactExport from "react-export-excel";






class IdentifiedSection extends Component {
    constructor(props) {
        super(props);
        let Status = {
            Completed: {text: "Completed", colorClass: "green-status-color"},
            Successful: {text: "Completed", colorClass: "green-status-color"},
            DeliveredToCW1: {text: "Completed", colorClass: "green-status-color"},
            Exempted: {text: "Exempted", colorClass: "amber-status-color"},
            Rejected: {text: "Rejected", colorClass: "red-status-color"},
            Inserted: {text: "Inserted", colorClass: "blue-status-color"}
        };
        this.state = {
            userDataForApiHeader: {
                name: this.props.dataSendToApiHeader.name,
                email: this.props.dataSendToApiHeader.email,
                userType: this.props.dataSendToApiHeader.userType,
                defaultBeCode: this.props.dataSendToApiHeader.defaultBeCode,
                otherBeCodes: (this.props.dataSendToApiHeader.otherBeCodes) ? this.props.dataSendToApiHeader.otherBeCodes.join(",") : null,
                organizationName: this.props.dataSendToApiHeader.organizationName,
                applicationName: this.props.dataSendToApiHeader.applicationName,
            },
            loader: false,
            isDisabled: true,
            isDisabledSelect: false,
            showCIErrorDialog: false,
            iconWrapper: true,
            fileInfo: false,
            fileName: '',
            progress: false,
            clear: true,
            width: 1,
            speed: false,
            isSelectable: true,
            columns: [],
            clicking: true,
            pageNumber: 1,
            statusOptions: Status,
            columnDataObj:[],
            colObj:[],
            SearchPageSize:10,
            tabState: 0,
            pageSize:0,
            showModal:false,
            pending:true,
            existingPageSize:0,
            dataForExport:null,
            callExportExcel:true,
            showErrorExportDialog:false
        }
        this.invalidExport = this.invalidExport.bind(this);
    }
    showModal(){
        this.setState({
            showModal: true
        })
    }

    hideModal(){
        this.setState({
            showModal: false
        })
        this.reloading()

    }
    checkin(pending,pgSize,pageSize,controller){
        if(pending=== true){
          //  console.log("Pending state")
            controller.abort();

            this.setState({
                pending:false,
                loader:false,
                showModal:false,
                showErrorExportDialog: false,
            })
            this.reloading(pgSize,pageSize)
        }


    }
    ExportToExcelData(tokenData,state,datalength) {
        let self=this;
        this.setState({
            showCIErrorDialog:false,
            showErrorExportDialog:false
        })
        let pagetotal =  1;
        if(self.state.colObj===[]){
            var obj="[]"
        }
        else {
            obj = self.state.colObj;
        }
        let controller = new AbortController();
        let signal = controller.signal;
        let headers=Environment.headerValues;
        headers.Authorization='Bearer ' + tokenData;
        fetch(API.CUSTOMER_INVOICE_RESULT + "?pageNumber=" + pagetotal + "&pageSize=" + datalength, {
            method: "POST",
            body: JSON.stringify(obj),
            headers: headers,
            signal: signal
        }).then(function (response) {
            return response.json();
        }).then(function (data) {
            self.setState({
                showModal:false
            })
            var values1 = data.PluginCIFiles.map((_arrayElement) => Object.assign({}, _arrayElement));
            self.setState({
                dataForExport:values1
            })
        });
    }
    closeDialog(){
        this.setState({
            showCIErrorDialog:false,
            showErrorExportDialog:false
        })
    }
    invalidExport(){
        let self = this;
        self.setState({
            showErrorExportDialog:true
        })
    }
    onIdentifiedTabChange=(id)=>{
        if(id === 1) {
            this.setState({tabState: 0});
            sessionStorage.setItem('tabState', 0);
        }else if(id === 2){
            this.setState({tabState: 1});
            sessionStorage.setItem('tabState', 1);
        }else if(id === 3){
            this.setState({tabState: 2});
            sessionStorage.setItem('tabState', 2);
        }else if(id === 4){
            this.setState({tabState: 3});
            sessionStorage.setItem('tabState', 3);
        }
    };
    componentWillMount = () => {
        let self = this;
        self.setState({loader: true,});
        // console.log(sessionStorage.getItem('tabState'),"Tabcontent");
        let sessionValue= parseInt(sessionStorage.getItem('tabState'));

        self.setState({
            tabState:sessionValue
        });
        setTimeout(function(){
            if(sessionStorage.getItem('tabState') !==  null) {
                self.onIdentifiedTabChange(parseInt(sessionStorage.getItem('tabState')) + 1);
            }else{
                self.onIdentifiedTabChange(1);
            }}, 10000);
    };
    componentDidMount = () => {
        // let self = this;
        //this.loadIdentifiedTableData();

    };
    componentWillUnmount = () => {

        // clearTimeout(this.fetchDataTimeOut);
        //clearInterval(this.fetchDataInterval);
    };
    signOut = () => {
        this.props.signOut();
    };
    loadIdentifiedTableData(state, instance) {
        let self = this;
        // var a;
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
                self.tokenDataService(tokenData, state, instance);
            })

        }
    };

    tokenDataService(tokenData, state, instance) {
        let self = this;
        let a;
        var datalength=100;
        self.setState({
            pending:true
        })
        if(state.pageSize!==undefined && state.pageSize!==null )
            self.setState(
                {
                    SearchPageSize:state.pageSize,
                    pageSize:state.pageSize
                }
            );

        if(state.clear!==undefined && state.clear!== false){
            self.setState({
                colObj:[]
            })
        }


        let pagetotal = state.page + 1;
        if(state.pages!== null && state.pages!== undefined) {
            if (state.pages === state.page) {
                pagetotal = state.page;

            }
        }
        if(self.state.colObj===[]){
            var obj="[]"
        }
        else
            obj=self.state.colObj;

        if (tokenData !== "") {
          let controller = new AbortController();
            let signal = controller.signal;
            let headers=Environment.headerValues;
            headers.Authorization='Bearer ' + tokenData;

            fetch(API.CUSTOMER_INVOICE_RESULT + "?pageNumber=" + pagetotal + "&pageSize=" + state.pageSize, {
                method: "POST",
                body: JSON.stringify(obj),
                headers: headers,
                signal: signal

            }).then(function (response) {
                return response.json();
            }).then(function (data) {
                self.setState({
                    pending:false,
                    showModal:false,
                    showErrorExportDialog: false,
                })

                var values1 = data.PluginCIFiles.map((_arrayElement) => Object.assign({}, _arrayElement));
                var datalength=data.TotalRecords;


              //  clearTimeout(a);
                if (data.PluginCIFiles != null  ) {
                    data.PluginCIFiles.map(item => {
                        item.CommercialInvoiceHeaderID = item.CommercialInvoiceHeaderID.toString();
                        item.CommercialInvoiceReference = [item.CommercialInvoiceReference, "/CIDetails/" + item.CommercialInvoiceHeaderID];
                        item.Status = [item.Status, "/"+item.Status +"/" + item.CommercialInvoiceHeaderID +"/StatusDetail"];
                        item.logDetails = ["Audit Details", "/CILogDetails/" + item.CommercialInvoiceHeaderID ];
                        if(item.LastUpdated !== '' && item.LastUpdated !== null) {
                            let yearConst = item.LastUpdated.slice(0,4);
                            let monthConst = item.LastUpdated.slice(5,7);
                            let daysConst = item.LastUpdated.slice(8, 10);
                            let hours = item.LastUpdated.slice(11, 19);
                            item.LastUpdated = yearConst + '-' + monthConst + '-' + daysConst + " " + hours;
                        }
                        if(item.EventDate !== ''  && item.EventDate !== null) {
                            let yearConst = item.EventDate.slice(0, 4);
                            let monthConst = item.EventDate.slice(5, 7);
                            let daysConst = item.EventDate.slice(8, 10);
                            let hours = item.EventDate.slice(11, 19);
                            item.EventDate = yearConst + '-' + monthConst + '-' + daysConst + " " + hours;
                        }
                        if(item.CommercialInvoiceDate !== '' && item.CommercialInvoiceDate !== null) {
                            let yearConst = item.CommercialInvoiceDate.slice(0, 4);
                            let monthConst = item.CommercialInvoiceDate.slice(5, 7);
                            let daysConst = item.CommercialInvoiceDate.slice(8, 10);
                            let hours = item.CommercialInvoiceDate.slice(11, 19);
                            item.CommercialInvoiceDate = yearConst + '-' + monthConst + '-' + daysConst + " " + hours;
                        }
                        if(item.DepartureDateEstimated !== ''&& item.DepartureDateEstimated !== null) {

                            let yearConst = item.DepartureDateEstimated.slice(0, 4);
                            let monthConst = item.DepartureDateEstimated.slice(5, 7);
                            let daysConst = item.DepartureDateEstimated.slice(8, 10);
                            let hours = item.DepartureDateEstimated.slice(11, 19);
                            item.DepartureDateEstimated= yearConst + '-' + monthConst + '-' + daysConst + " " + hours;

                        }

                        if(item.ArrivalDateEstimated !== '' && item.ArrivalDateEstimated!=null ) {

                            let yearConst = item.ArrivalDateEstimated.slice(0, 4);
                            let monthConst = item.ArrivalDateEstimated.slice(5, 7);
                            let daysConst = item.ArrivalDateEstimated.slice(8, 10);
                            let hours = item.ArrivalDateEstimated.slice(11, 19);
                            item.ArrivalDateEstimated= yearConst + '-' + monthConst + '-' + daysConst + " " + hours;

                        }

                        return null;
                    });
                    self.setState({
                        loader: false,
                        identifiedTableContent: data.PluginCIFiles,
                        showModal:false,
                        pending:false,
                        showErrorExportDialog: false
                    });

                }

        let record = data.TotalRecords % state.pageSize;
               values1.map(item=>{
                    // Array.isArray(item.CommercialInvoiceReference)
                    if(Array.isArray(item.CommercialInvoiceReference)){
                        item.CommercialInvoiceReference=item.CommercialInvoiceReference[0]
                    }
                    if(Array.isArray(item.Status)){
                        item.Status=item.Status[0]
                    }
                    if(Array.isArray(item.logDetails)){
                        item.logDetails=item.logDetails[0]
                    }
                })
                if (record === 0) {
                    let pagenum = (data.TotalRecords) / state.pageSize;
                    self.setState({
                        pageNumber: pagenum,
                        loader:false

                    })
                } else {
                    let remain = data.TotalRecords % state.pageSize;
                    self.setState({
                        pageNumber: (((data.TotalRecords) - remain) / state.pageSize) + 1,
                        loader:false



                    })
                }
                if(datalength <= Environment.defaultDownloadExcelLimit) {
                    if (self.state.callExportExcel === true) {
                        self.ExportToExcelData(tokenData, state, datalength);
                    }
                }
            })

            let pgsize=state.page + 1
             a=setTimeout(() => this.checkin(self.state.pending,pgsize,state.pageSize,controller), 10000);


        }
    };

    fetchData(state, instance) {
        this.setState({
            tabState: sessionStorage.getItem('tabState'),
            loader:true,
            existingPageSize:state.page + 1,
            showModal:false,
            pending:true
        });

        if(Number.isNaN(this.state.tabState)){
            sessionStorage.setItem('tabState',0);
            this.setState({
                tabState: 0
            })
        }
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

        if(this.state.tabState===0 || Number.isNaN(this.state.tabState)) {
            this.loadIdentifiedTableData(state, instance);
        }
        else{

            if(parseInt(this.state.tabState)===0) {
                this.loadIdentifiedTableData(state, instance);
            }
        }


    }

    searchIdentifiedTableData(obj) {
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
                self.searchCI(tokenData,obj);
            });

        }
    };
    searchCI(tokenData,obj){
        let self = this;
        //  this.tokenData=tokenData;
        let pagetotal = 1
        var a;
        if(self.state.pageSize>=0){
            var pageSize=self.state.pageSize;
        }
        self.setState({
            loader:true,
            pending:true
        });


        if (tokenData !== "") {
            let headers=Environment.headerValues;
            headers.Authorization='Bearer ' + tokenData;
            let controller = new AbortController();
            let signal = controller.signal;


            fetch(API.CUSTOMER_INVOICE_RESULT + "?pageNumber=" + pagetotal + "&pageSize=" + pageSize, {
                method: "POST", // *GET, POST, PUT, DELETE, etc.

                body: JSON.stringify(obj),

                headers: headers,
                signal: signal


            }).then(function (response) {
                return response.json();
            }).then(function (data) {
                self.setState({
                    pending:false,
                    showModal:false,
                    showErrorExportDialog: false,
                })


                var values = data.PluginCIFiles.map((_arrayElement) => Object.assign({}, _arrayElement));
                var datalength=data.TotalRecords;




                if(data.PluginCIFiles!=null ) {
                    data.PluginCIFiles.map(item => {
                        item.CommercialInvoiceHeaderID = item.CommercialInvoiceHeaderID.toString();
                        item.CommercialInvoiceReference = [item.CommercialInvoiceReference, "/CIDetails/" + item.CommercialInvoiceHeaderID];
                        item.Status = [item.Status, "/"+  item.Status+"/" + item.CommercialInvoiceHeaderID +"/StatusDetail"];
                        item.logDetails = ["Audit Details", "/CILogDetails/" + item.CommercialInvoiceHeaderID ];
                        if(item.LastUpdated !== '' && item.LastUpdated !== null) {
                            let yearConst = item.LastUpdated.slice(0,4);
                            let monthConst = item.LastUpdated.slice(5,7);
                            let daysConst = item.LastUpdated.slice(8, 10);
                            let hours = item.LastUpdated.slice(11, 19);

                            item.LastUpdated = yearConst + '-' + monthConst + '-' + daysConst+ " " + hours;

                        }
                        if(item.EventDate !== '' && item.EventDate !== null) {
                            let yearConst = item.EventDate.slice(0, 4);
                            let monthConst = item.EventDate.slice(5, 7);
                            let daysConst = item.EventDate.slice(8, 10);
                            let hours = item.EventDate.slice(11, 19);
                            item.EventDate = yearConst + '-' + monthConst + '-' + daysConst+ " " + hours;
                        }
                        if(item.CommercialInvoiceDate !== '' && item.CommercialInvoiceDate !== null ) {
                            let yearConst = item.CommercialInvoiceDate.slice(0, 4);
                            let monthConst = item.CommercialInvoiceDate.slice(5, 7);
                            let daysConst = item.CommercialInvoiceDate.slice(8, 10);
                            let hours = item.CommercialInvoiceDate.slice(11, 19);

                            item.CommercialInvoiceDate = yearConst + '-' + monthConst + '-' + daysConst+ " " + hours;

                        }
                        if(item.DepartureDateEstimated !== '' && item.DepartureDateEstimated !== null) {
                            let yearConst = item.DepartureDateEstimated.slice(0, 4);
                            let monthConst = item.DepartureDateEstimated.slice(5, 7);
                            let daysConst = item.DepartureDateEstimated.slice(8, 10);
                            let hours = item.DepartureDateEstimated.slice(11, 19);

                            item.DepartureDateEstimated = yearConst + '-' + monthConst + '-' + daysConst+ " " + hours;


                        }
                        if(item.ArrivalDateEstimated !== '' && item.ArrivalDateEstimated!=null) {
                            let yearConst = item.ArrivalDateEstimated.slice(0, 4);
                            let monthConst = item.ArrivalDateEstimated.slice(5, 7);
                            let daysConst = item.ArrivalDateEstimated.slice(8, 10);
                            let hours = item.ArrivalDateEstimated.slice(11, 19);
                            item.ArrivalDateEstimated = yearConst + '-' + monthConst + '-' + daysConst+ " " + hours;

                        }    return null;
                    });
                    self.setState({
                        identifiedTableContent: data.PluginCIFiles
                    })

                }

                values.map(item=>{
                    // Array.isArray(item.CommercialInvoiceReference)
                    if(Array.isArray(item.CommercialInvoiceReference)){
                        item.CommercialInvoiceReference=item.CommercialInvoiceReference[0]
                    }
                    if(Array.isArray(item.Status)){
                        item.Status=item.Status[0]
                    }
                    if(Array.isArray(item.logDetails)){
                        item.logDetails=item.logDetails[0]
                    }
                })
               let record = data.TotalRecords % self.state.SearchPageSize;
                if (record === 0) {
                    let pagenum = (data.TotalRecords) / self.state.SearchPageSize;
                    self.setState({
                        pageNumber: pagenum
                    })
                } else {
                    let remain = data.TotalRecords %  self.state.SearchPageSize;
                    self.setState({
                        pageNumber: (((data.TotalRecords) - remain) /  self.state.SearchPageSize) + 1
                    })
                }
                self.setState({
                    loader: false,
                    pending:false,
                    showModal:false,
                    dataForExport:values,

                    showErrorExportDialog: false
                    //  identifiedTableContent: data.PluginCIFiles,
                });
                if(datalength <= Environment.defaultDownloadExcelLimit) {
                self.ExportToExcelData(tokenData,self.state,datalength);
                } else {
                    self.setState({
                        dataForExport:null
                    })
                }

            })

            let pgSize=1;
            var a=setTimeout(() => this.checkin(self.state.pending,pgSize,self.state.pageSize,controller), 10000);

        }
    }
    setPage(page) {
        console.log("setPage: " + page);
        this.setState({
            page: page
        });
    }



    apply(){
        this.setState({
            loader:true,
            dataForExport:null,
            showErrorExportDialog: false
        });
        this.dataTable.table.state.page=0;
       // this.setPage(1);

        let values = this.filters.getFilterValues();
        // console.log(values, ' - CI Filter values');
        let ShipperName = values[1].value;
        let ConsigneeName = values[2].value;
        let Status='';
        if(Status === null){
            Status="";
        }
        let CommercialInvoiceDate;
        let CommercialInvoiceReference=values[0].value;
        let CountryOfOrigin;
        let ArrivalDateEstimated;
        let DepartureDateEstimated;
        let dateToConst;
        let custID="";
        let lastUpdated="";
        let lastUpdatedTo="";
        if(values[3].label==="Invoice Date"){
            CommercialInvoiceDate= values[3].value;
            dateToConst = CommercialInvoiceDate;
            CommercialInvoiceReference = values[0].value;
            CountryOfOrigin="";
        }
        else{
            CommercialInvoiceDate= values[8].value;
            custID=values[3].value;
        }

        let EventDate='';
        let EventDateTo = '';
        let dateToConstValue='';
        let dateToConstEventValue = '';
        let PortOfLoadingName='';
        let dateToConstEventValueTo = '';
        let PortOfDischargeName='';
        let dateToConstArrival='';
        let dateToConstDeparture='';
        let dateToConstUpdate='';
        let dateToConstUpdateTo='';

        if(values.length>4) {
            custID=values[3].value;
            Status = values[7].value;

            if(Status===null){
                Status="";
            }
            if(values[3].label!=="Invoice Date" && values[8].label=== "Invoice Date")
            {
                CommercialInvoiceDate = values[8].value;
                dateToConst = CommercialInvoiceDate;
            }
            PortOfLoadingName=values[5].value;
            PortOfDischargeName=values[6].value;

            EventDate = values[9].value;
            CountryOfOrigin=values[4].value;
            EventDateTo = values[10].value;
            ArrivalDateEstimated=values[12].value;
            DepartureDateEstimated=values[11].value;
            lastUpdated=values[13].value;
            lastUpdatedTo = values[14].value;

            let dateToConstEvent=EventDate;
            let dateToConstEventTo=EventDateTo;
            let Arriv=ArrivalDateEstimated;
            let depar=DepartureDateEstimated;
            let lastup=lastUpdated;

            if(dateToConstEvent !== '') {
                let yearConst = dateToConstEvent.slice(6, 10);
                let monthConst = dateToConstEvent.slice(3, 5);
                let daysConst = dateToConstEvent.slice(0, 2);
                dateToConstEventValue = yearConst + '-' + monthConst + '-' + daysConst;

            }
            if(dateToConstEventTo !== '') {
                let yearConst = dateToConstEventTo.slice(6, 10);
                let monthConst = dateToConstEventTo.slice(3, 5);
                let daysConst = dateToConstEventTo.slice(0, 2);
                dateToConstEventValueTo = yearConst + '-' + monthConst + '-' + daysConst;

            }
            if(Arriv !== '') {
                let yearConst = Arriv.slice(6, 10);
                let monthConst = Arriv.slice(3, 5);
                let daysConst = Arriv.slice(0, 2);
                dateToConstArrival = yearConst + '-' + monthConst + '-' + daysConst;

            }
            if(depar !== '') {
                let yearConst = depar.slice(6, 10);
                let monthConst = depar.slice(3, 5);
                let daysConst = depar.slice(0, 2);
                dateToConstDeparture = yearConst + '-' + monthConst + '-' + daysConst;

            }
            if(lastup !== '') {
                let yearConst = lastup.slice(6, 10);
                let monthConst = lastup.slice(3, 5);
                let daysConst = lastup.slice(0, 2);
                dateToConstUpdate = yearConst + '-' + monthConst + '-' + daysConst;

            }
            if(lastUpdatedTo !== '') {
                let yearConst = lastUpdatedTo.slice(6, 10);
                let monthConst = lastUpdatedTo.slice(3, 5);
                let daysConst = lastUpdatedTo.slice(0, 2);
                dateToConstUpdateTo = yearConst + '-' + monthConst + '-' + daysConst;

            }
        }

        if(dateToConst !== '') {
            let yearConst = dateToConst.slice(6, 10);
            let monthConst = dateToConst.slice(3, 5);
            let daysConst = dateToConst.slice(0, 2);
            dateToConstValue = yearConst + '-' + monthConst + '-' + daysConst;

        }
        this.setState({
            columnDataObj : []
        });
        let columnDataObj = this.state.columnDataObj;
        let commercialInvoiceRef={
            "ColumnName": 'CommercialInvoiceReference',
            "Operator": 'contains',
            "Value1": CommercialInvoiceReference,
            "Value2": ''
        };


        let arrEstimated={
            "ColumnName" : 'ArrivalDateEstimated',
            "Operator": 'greaterthanequal',
            "Value1": dateToConstArrival,
            "Value2": ''
        };

        let commercialInvoiceDat = {
            "ColumnName": 'CommercialInvoiceDate',
            "Operator": 'greaterthanequal',
            "Value1": dateToConstValue,
            "Value2": ''
        };
        let depEstimated = {
            "ColumnName": 'DepartureDateEstimated',
            "Operator": 'greaterthanequal',
            "Value1": dateToConstDeparture,
            "Value2": ''
        };
        let shipperNam = {
            "ColumnName": 'ShipperName',
            "Operator": 'contains',
            "Value1": ShipperName,
            "Value2": ''
        };

        let ConsigneeNam = {
            "ColumnName": 'ConsigneeName',
            "Operator": 'contains',
            "Value1": ConsigneeName,
            "Value2": ''
        };

        let Stat = {
            "ColumnName": 'Status',
            "Operator": 'equal',
            "Value1": Status,
            "Value2": ''
        };
        let eventDat = {
            "ColumnName": 'EventDate',
            "Operator": 'range',
            "Value1": dateToConstEventValue,
            "Value2": dateToConstEventValueTo
        };
        let conOrigin = {
            "ColumnName": 'CountryOfOrigin',
            "Operator": 'contains',
            "Value1": CountryOfOrigin,
            "Value2": ''
        };


        let portOfLoad={
            "ColumnName": 'PortOfLoadingName',
            "Operator": 'contains',
            "Value1": PortOfLoadingName,
            "Value2": ''
        };
        let portOfDis={
            "ColumnName": 'PortOfDischargeName',
            "Operator": 'contains',
            "Value1": PortOfDischargeName,
            "Value2": ''
        };
        let customerId={
            "ColumnName": 'CommercialInvoiceReference',
            "Operator": 'contains',
            "Value1": custID,
            "Value2": ''
        };
        let updat={
            "ColumnName": 'LastUpdated',
            "Operator": 'range',
            "Value1": dateToConstUpdate,
            "Value2": dateToConstUpdateTo
        };
        if(dateToConstUpdate!==''){
            columnDataObj.push(updat);
        }
        if(custID!==''){
            columnDataObj.push(customerId);
        }
        if(PortOfLoadingName!==''){
            columnDataObj.push(portOfLoad);
        }
        if(PortOfDischargeName!==''){
            columnDataObj.push(portOfDis);
        }

        if(CountryOfOrigin!==''){
            columnDataObj.push(conOrigin);
        }

        if(dateToConstArrival !==''){
            columnDataObj.push(arrEstimated);
        }
        if(dateToConstDeparture !==''){
            columnDataObj.push(depEstimated);
        }



        if (CommercialInvoiceReference !== '') {

            columnDataObj.push(commercialInvoiceRef);
        }

        if (CommercialInvoiceDate !== '') {

            columnDataObj.push(commercialInvoiceDat);
        }

        if (ShipperName !== '') {

            columnDataObj.push(shipperNam);
        }

        if (ConsigneeName !== '') {

            columnDataObj.push(ConsigneeNam);
        }
        if (Status !== '') {
            columnDataObj.push(Stat);
        }
        if (EventDate !== '') {
            columnDataObj.push(eventDat)
        }

        this.setState({
            colObj:columnDataObj
        });
        this.searchIdentifiedTableData(columnDataObj);

    }

    clear() {
        // Filters cleared
        this.dataTable.table.state.page=0;
        var vals={

            pageSize:10,
            page: 0,
            clear:true


        };
        this.setState({
            callExportExcel:true
        })
        var instance=null;

        this.loadIdentifiedTableData(vals,instance);
    }
    reloading(pgSize,pageSize) {
        let self=this;
        const vals = {
            pageSize: pageSize,
            page: pgSize-1,
            clear: false,
            showModal:false


        };
        self.setState({
            loader:true,
            pending:true,
            callExportExcel:true


        });
        const instance = null;
        this.loadIdentifiedTableData(vals,instance);
    }


    render() {
        let filters = {
            defaultStateOpen: true,
            moreLess: true,
            inputs: [
                {id: 2, label: 'Commercial Invoice',type: 'text', placeholder: "Enter Commercial Invoice", isBaseFilter: true},
                {id: 3, label: "Invoice Date", type: 'date-mon-sun', noDateOption: false, isBaseFilter: true},
                {id: 4, label: 'Shipper Name', type: 'text', placeholder: "Enter Shipper Name", isBaseFilter: true},
                {id: 5, label: 'Consignee Name', type: 'text', placeholder: "Enter Consignee Name", isBaseFilter: true},
                {id: 6, label: 'Customer Id', type: 'text', placeholder: "Enter Customer ID", isBaseFilter: false},
                {id: 7, label: 'Created From', type: 'date-mon-sun', noDateOption: false, isBaseFilter: false},
                {id: 15, label: 'Created To', type: 'date-mon-sun', noDateOption: false, isBaseFilter: false},
                {id: 8, label: 'Country Of Origin', type: 'text', placeholder: "Enter text", isBaseFilter: false},
                {id: 9, label: 'Departure Date ',type:'date-mon-sun', noDateOption: false, isBaseFilter: false},
                {id: 10, label: 'Arrival Date', type: 'date-mon-sun', noDateOption: false, isBaseFilter: false},
                {id: 11, label: 'Port Of Loading', type: 'text', placeholder: "Enter Port of Loading", isBaseFilter: false},
                {id: 12, label: 'Port Of Unloading', type: 'text', placeholder: "Enter Port of Unloading", isBaseFilter: false},
                {id: 13, label: 'Updated From', type: 'date-mon-sun', noDateOption: false, isBaseFilter: false},
                {id: 14, label: 'Updated To', type: 'date-mon-sun', noDateOption: false, isBaseFilter: false},
                {id: 16, label: 'Status', type: 'dropdown', placeholder: "Select", options: [{label: 'Select', value:''},{label: 'Completed', value:'Completed'}, {label: 'DeliveredToCW1', value:'DeliveredToCW1'}, {label: 'Exempted', value:'Exempted'},{label: 'Inserted', value:'Inserted'},{label: 'Rejected', value:'Rejected'}], isMulti: false, isSearchable: true, isBaseFilter: false},
            ]
        };
        const ExcelFile = ReactExport.ExcelFile;
        const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
        const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;
        if(this.state.dataForExport!==null && typeof this.state.dataForExport!== undefined){
            // console.log(this.state.dataForExport,'excel sheet table values')
        }
        // console.log(this.state.identifiedTableContent,'arrayGrid');


     /*if(this.state.dataForExport!==null &&  typeof (this.state.dataForExport)!==undefined){
         if(Array.isArray(this.state.dataForExport[0].CommercialInvoiceReference)){
             this.state.dataForExport.map(item=>{
                 // Array.isArray(item.CommercialInvoiceReference)
                 if(Array.isArray(item.CommercialInvoiceReference)){
                     item.CommercialInvoiceReference=item.CommercialInvoiceReference[0]
                 }
             })
         }

         console.log(dataSet1, ' Data Set');
     }*/



      /*  const dataSet1=[
            {
                "CommercialInvoiceHeaderID": 1503,
                "CommercialInvoiceDate": "2020-01-22T00:00:00",
                "ShipperName": "VOLTEC",
                "ConsigneeName": "HOME DEPOT USA INC",
                "CustomerID": "USHOMEDEPOHQ",
                "EventDate": "2020-01-28T08:06:03.4933333",
                "Status": "Rejected",
                "Version": 0,
                "CommercialInvoiceReference": "0314014-IN",
                "Active": false,
                "CountryOfOrigin": "China",
                "DepartureDateEstimated": "2020-01-22T00:00:00",
                "ArrivalDateEstimated": null,
                "PortOfLoadingName": "Yantian ",
                "PortOfDischargeName": "Norfolk ",
                "LastUpdated": "2020-01-28T07:48:53.71"
            },
            {
                "CommercialInvoiceHeaderID": 1502,
                "CommercialInvoiceDate": "2020-01-20T00:00:00",
                "ShipperName": "GHP GROUP INC",
                "ConsigneeName": "HOME DEPOT USA INC",
                "CustomerID": "USHOMEDEPOHQ",
                "EventDate": "2020-01-28T04:06:56.41",
                "Status": "Rejected",
                "Version": 0,
                "CommercialInvoiceReference": "INV2280564",
                "Active": false,
                "CountryOfOrigin": "China",
                "DepartureDateEstimated": "2020-01-19T00:00:00",
                "ArrivalDateEstimated": "2020-02-18T00:00:00",
                "PortOfLoadingName": "Yantian ",
                "PortOfDischargeName": "New York ",
                "LastUpdated": "2020-01-28T04:02:24.3566667"
            }
           ] */



        return (
            <div >
                <div className="header-group profile-template">
                    <ul className="page-title-group">
                        <li className="no-margin"/>
                        <li>
                            <h2>Identified data</h2>
                        </li>
                    </ul>
                </div>
                <InPageDialog showDialog={this.state.showCIErrorDialog} type={"error"} message={"Unable to fetch CI Records"} closeMethod={() => this.closeDialog()}/>
                <br />
                <div className="grid-wrapper">
                    <div className="col-100">
                        <div>
                            <section className="page-container">
                                <div className="grid-wrapper">
                                    <div className="col-100">
                                        <FilterSection data={filters} applyAction={() => this.apply()}
                                                       clearAction={() => this.clear()}
                                                       ref={(filters) => this.filters = filters}/>
                                    </div>
                                </div>
                            </section>
                            {
                                (typeof this.state.identifiedTableContent) !== undefined ?
                                    <section className="page-container">
                                        <div className="grid-wrapper">
                                            {this.state.dataForExport !== null ?
                                            <ExcelFile filename="CIData" element={<button type="button" className="button button-blue">Export to Excel</button>}>
                                                <ExcelSheet data={this.state.dataForExport} name="CI Details">
                                                    <ExcelColumn label="CommercialInvoiceHeaderID" value="CommercialInvoiceHeaderID"/>
                                                    <ExcelColumn label="Invoice Date" value="CommercialInvoiceDate"/>
                                                    <ExcelColumn label="Shipper Name" value="ShipperName"/>
                                                    <ExcelColumn label="Consignee Name" value="ConsigneeName"/>
                                                    <ExcelColumn label="Customer Id" value="CustomerID"/>
                                                    <ExcelColumn label="Created Time" value="EventDate"/>
                                                    <ExcelColumn label="Status" value="Status"/>
                                                    <ExcelColumn label="Version" value="Version"/>
                                                    <ExcelColumn label="Commercial Invoice" value="CommercialInvoiceReference"/>
                                                    <ExcelColumn label="Active" value="Active"/>
                                                    <ExcelColumn label="Country Of Origin" value="CountryOfOrigin"/>
                                                    <ExcelColumn label="Departure Date" value="DepartureDateEstimated"/>
                                                    <ExcelColumn label="Arrival Date" value="ArrivalDateEstimated"/>
                                                    <ExcelColumn label="Port Of Loading" value="PortOfLoadingName"/>
                                                    <ExcelColumn label="Port Of Unloading" value="PortOfDischargeName"/>
                                                    <ExcelColumn label="Last Updated" value="LastUpdated"/>
                                                </ExcelSheet>
                                            </ExcelFile>
                                                : <div className="grid-wrapper"><button type="button" className="button button-blue" onClick={this.invalidExport}>Export to Excel</button></div>}
                                        </div>
                                    </section> : null
                            }


                                    <section className="page-container">
                                        <InPageDialog showDialog={this.state.showErrorExportDialog} type={"error"} message={"Returned result is more than " +Environment.defaultDownloadExcelLimit+ " records, Please add more filter and try again."} closeMethod={() => this.closeDialog()}/>
                                <div className="grid-wrapper">

                                    <DataTable
                                        data={this.state.identifiedTableContent}
                                        columns={[
                                            {
                                                headerClassName: 'data-table header ',
                                                accessor: "CommercialInvoiceReference",
                                                editable: false,
                                                isHyperlink: true,
                                                fieldHeader: 'Commercial Invoice',
                                                show: true

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
                                                fieldHeader: "Consignee Name",
                                                show: true
                                            },
                                            {
                                                headerClassName: 'data-table header ',
                                                accessor: "CustomerID",
                                                editable: false,
                                                isLink: false,
                                                fieldHeader: 'Customer Id',
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
                                                headerClassName: 'data-table header ',
                                                accessor: "CountryOfOrigin",
                                                editable: false,
                                                isLink: false,
                                                fieldHeader: 'Country Of Origin',
                                                show: true,
                                            },
                                            {
                                                headerClassName: 'data-table header',
                                                accessor: "DepartureDateEstimated",
                                                editable: false,
                                                isLink: false,
                                                fieldHeader: 'Departure Date',
                                                show: true,
                                            },
                                            {
                                                headerClassName: 'data-table header',
                                                accessor: "ArrivalDateEstimated",
                                                editable: false,
                                                isLink: false,
                                                fieldHeader: 'Arrival Date',
                                                show: true,
                                            },
                                            {
                                                headerClassName: 'data-table header ',
                                                accessor: "PortOfLoadingName",
                                                editable: false,
                                                isLink: false,
                                                fieldHeader: 'Port Of Loading',
                                                show: true,
                                            },
                                            {
                                                headerClassName: 'data-table header ',
                                                accessor: "PortOfDischargeName",
                                                editable: false,
                                                isLink: false,
                                                fieldHeader: 'Port Of Unloading',
                                                show: true,

                                            },
                                            {
                                                headerClassName: 'data-table header',
                                                accessor: "LastUpdated",
                                                editable: false,
                                                isLink: false,
                                                fieldHeader: 'Updated Time',
                                                show: true,

                                            },
                                            {
                                                headerClassName: 'data-table header',
                                                accessor: "Status",
                                                isStatus: false,
                                                isHyperlink: true,
                                                fieldHeader: 'Status',
                                                show: true
                                            },

                                            {
                                                headerClassName: 'data-table header',
                                                accessor: "logDetails",
                                                isStatus: false,
                                                isHyperlink: true,
                                                fieldHeader: 'Log Details',
                                                show: true
                                            }


                                        ]}

                                        isSelectable={true}
                                        isSortable={false}
                                        isEditable={false}
                                        hasFooter={false}
                                        isExpandable={false}
                                        manualPagination={true}
                                        showPagination={true}
                                        showColumnOptions={true}
                                        pageCount={this.state.pageNumber}
                                        fetchData={this.fetchData.bind(this)}



                                        tableName={"CITable"}
                                        ref={(dataTable) => {
                                            this.dataTable = dataTable;
                                        }}
                                        statusOptions={this.state.statusOptions}
                                        actions={this.state.actions}
                                        height={"auto"}
                                    />


                                </div>
                            </section>

                        </div>







                    </div>
                </div>



                <Loader loader={this.state.loader}/>
                <div>
                    <ModalMain modal={this.state.showModal} title={"Not able to Fetch"} hideMethod={() => this.hideModal()} secondaryMethod={() => this.hideModal()}
                               primaryMethod={() => this.hideModal()} btnTitle1={"OK"} btnTitle2={"Cancel"}>
                        Click Ok to Reload the Page
                    </ModalMain>
                </div>
            </div>
        )
    }
}

class ErrorSection extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sortableError: true,
            subColumns: [],
            isExpanded: true,
        }
    }

    render() {
        return (
            <div></div>
        )
    }
}

class CI extends Component {

    constructor(props) {
        super(props);
        this.state = {
            identifiedTableErrorDetails: null,
            identifiedTableError: null,
            errorDetails: false,
            loader: false,
        }
    }


    render() {
        return (
            <div>
                <IdentifiedSection dataSendToApiHeader={this.props.dataSendToApiHeader}
                                   showErrorDetails={this.showErrorDetails}/>
                {(this.state.errorDetails)
                    ?
                    <ErrorSection />
                    : null
                }
                <Loader loader={this.state.loader}/>
            </div>
        )
    }
}

export default CI;