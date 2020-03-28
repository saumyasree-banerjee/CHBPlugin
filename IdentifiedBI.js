import React, {Component} from 'react';
import {FilterSection, InPageDialog} from 'damco-components';
import {DataTable} from 'damco-components';
import API from "../../../Constants/API-config";
import Loader from "../Common/Loader";
import {Environment} from "../../../Constants/Environment";
import ReactExport from "react-export-excel";

class IdentifiedBI extends Component {
    constructor(props) {
        super(props);
        let status = {
            Completed: {text: "Completed", colorClass: "green-status-color"},
            Successful: {text: "Completed", colorClass: "green-status-color"},
            DeliveredToCW1: {text: "Completed", colorClass: "green-status-color"},
            Exempted: {text: "Exempted", colorClass: "amber-status-color"},
            Rejected: {text: "Rejected....", colorClass: "red-status-color"},
            Inserted: {text: "Inserted...", colorClass: "blue-status-color"}
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
            modalerror: false,
            modalerrorMSG: "Unexpected error occured! Please try after some time.",
            loaderupload: false,
            hideuccessState: false,
            hideErrorState: false,
            isDisabled: true,
            isDisabledSelect: false,
            iconWrapper: true,
            fileInfo: false,
            fileName: '',
            progress: false,
            clear: true,
            width: 1,
            speed: false,
            intervalSetForContentRefresh: 60000,
            intervalSetForContentAfterLoad: 5000,
            timeoutSetForContentAfterLoad: 120000,
            isSelectable: true,
            identifiedBLTableContent: [],
            columns: [],
            clicking: true,
            pageNumber: 1,
            columnDataObj: [],
            colObj: [],
            prevPath:null,
            SearchPageSize:10,
            statusOptions: status,
            pageSize:0,
            tabState: 0,
            showModal:false,
            pending:true,
            existingPageSize:0,
            dataForExport:null,
            callExportExcel:true,
            showErrorExportDialog: false
        }
        this.invalidExport = this.invalidExport.bind(this);
    }



    componentWillMount = () => {
        this.setState({loader: true,});

    }

    componentDidMount = () => {

    }


    componentWillUnmount = () => {
      //  clearTimeout(this.fetchDataTimeOut);
        //clearInterval(this.fetchDataInterval);
    }

    signOut = () => {
        this.props.signOut();
    }
    invalidExport(){
        let self = this;
        self.setState({
            showErrorExportDialog:true
        })
    }
    checkin(pending,pgSize,pageSize,controller){
        if(pending=== true){
            console.log("Pending state")
            controller.abort();

            this.setState({
                pending:false,
                loader:false,
                showModal:false
            })
            this.reloading(pgSize,pageSize)
        }


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
                sessionStorage.setItem("tokenDataFromAud", JSON.stringify(data));
                tokenData = data;
                self.tokenDataService(tokenData, state, instance);
            });
        }
    };

    tokenDataService(tokenData, state, instance) {
        let self = this;
        let obj="[]";
        var a;
        self.setState({
            pending:true
        })

        //  this.tokenData

        if(state.pageSize!==undefined && state.pageSize!==null )
            self.setState(
                {
                    SearchPageSize:state.pageSize,
                    pageSize:state.pageSize,

                }
            )
        if(state.clear!==undefined && state.clear!== false){
            self.setState({
                colObj:[]
            })
        }

        let pagetotal = state.page + 1;
        if(self.state.colObj===[]){
             obj="[]"

        }
        else {
            obj = self.state.colObj;
        }
        if (tokenData !== "") {
            let headers=Environment.headerValues;
            headers.Authorization='Bearer ' + tokenData
            const controller = new AbortController();
            const signal = controller.signal;

            fetch(API.BL_DETAILS + "?pageNumber=" + pagetotal + "&pageSize=" + self.state.SearchPageSize, {
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
                    loader:false
                })
                var values1 = data.PluginBLs.map((_arrayElement) => Object.assign({}, _arrayElement));
                var datalength=data.TotalRecords;
            //    clearTimeout(a)
                if (data.PluginBLs !== null) {
                    data.PluginBLs.map(item => {
                        item.BLNumber = [item.BLNumber, "/ShipmentID/" + item.ShipmentId+"/BLDetails"];
                        item.Status = [item.Status, "/"+ item.Status+"/" + item.ShipmentId + "/Status/Details"];
                        item.logDetails = ["Audit Details", "/BLLogDetails/" + item.ShipmentId ];
                        if(item.ETA !== '' && item.ETA != null) {
                            let yearConst = item.ETA.slice(0, 4);
                            let monthConst = item.ETA.slice(5, 7);
                            let daysConst = item.ETA.slice(8, 10);
                            let hours = item.ETA.slice(11, 19);
                            item.ETA= yearConst + '-' + monthConst + '-' + daysConst + " " + hours;
                        }
                        if(item.ETD !== '' && item.ETD != null) {
                            let yearConst = item.ETD.slice(0, 4);
                            let monthConst = item.ETD.slice(5, 7);
                            let daysConst = item.ETD.slice(8, 10);
                            let hours = item.ETD.slice(11, 19);
                            item.ETD= yearConst + '-' + monthConst + '-' + daysConst + " " + hours;
                        }
                        if(item.EventDate !== '' && item.EventDate!=null ) {
                            let yearConst = item.EventDate.slice(0, 4);
                            let monthConst = item.EventDate.slice(5, 7);
                            let daysConst = item.EventDate.slice(8, 10);
                            let hours = item.EventDate.slice(11, 19);
                            item.EventDate= yearConst + '-' + monthConst + '-' + daysConst + " " + hours;
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


                if (data.PluginBLs != null) {
                    self.setState({
                        loader: false,
                        identifiedBLTableContent: data.PluginBLs,


                    });
                }
                else{
                    self.setState({
                        loader: false,
                        identifiedBLTableContent: []


                    });
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
        this.loadIdentifiedTableData(state, instance);
    }
    searchIdentifiedTableData(obj) {
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

                sessionStorage.setItem("tokenDataFromAud", JSON.stringify(data));
                tokenData = data;
                self.searchCI(tokenData,obj);
            });
        }
    };
    searchCI(tokenData,obj){
        let self = this;
        var a;
        //  this.tokenData=tokenData;
        let pagetotal = 1;
       // let pageSize=10;
        var pageSize=10;
            self.setState({
            loader:false,
                pending:true
        })
        if(self.state.pageSize>=0){
             pageSize=self.state.pageSize
        }
        if (tokenData !== "") {
            let headers=Environment.headerValues;
            headers.Authorization='Bearer ' + tokenData;
            const controller = new AbortController();
            const signal = controller.signal;

            fetch(API.BL_DETAILS + "?pageNumber=" + pagetotal + "&pageSize=" + pageSize, {
                method: "POST", // *GET, POST, PUT, DELETE, etc.
                body: JSON.stringify(obj),
                headers: headers,
                signal:signal
            }).then(function (response) {
                return response.json();
            }).then(function (data) {
                self.setState({
                    pending:false,
                    showModal:false
                })
            //    clearTimeout(a);
                var datalength=data.TotalRecords
                if(data.PluginBLs!=null) {
                    if(data.PluginBLs.length>0) {
                        data.PluginBLs.map(item => {
                            item.ShipmentId = item.ShipmentId.toString();
                            item.BLNumber = [item.BLNumber, "/ShipmentID/" + item.ShipmentId +"/BLDetails"]
                            item.Status = [item.Status, "/"+ item.Status+ "/" + item.ShipmentId + "/Status/Details" ]
                            item.logDetails = ["Audit Details", "/BLLogDetails/" + item.ShipmentId ];
                            if(item.ETA !== '' && item.ETA!=null ) {
                                let yearConst = item.ETA.slice(0, 4);
                                let monthConst = item.ETA.slice(5, 7);
                                let daysConst = item.ETA.slice(8, 10);
                                let hours = item.ETA.slice(11, 19);
                                item.ETA= yearConst + '-' + monthConst + '-' + daysConst + " " + hours;
                            }
                            if(item.ETD !== '' && item.ETD!=null ) {
                                let yearConst = item.ETD.slice(0, 4);
                                let monthConst = item.ETD.slice(5, 7);
                                let daysConst = item.ETD.slice(8, 10);
                                let hours = item.ETD.slice(11, 19);
                                item.ETD= yearConst + '-' + monthConst + '-' + daysConst + " " + hours;
                            }
                            if(item.EventDate !== '' && item.EventDate!=null ) {
                                let yearConst = item.EventDate.slice(0, 4);
                                let monthConst = item.EventDate.slice(5, 7);
                                let daysConst = item.EventDate.slice(8, 10);
                                let hours = item.EventDate.slice(11, 19);
                                item.EventDate= yearConst + '-' + monthConst + '-' + daysConst + " " + hours;
                            }
                            return null;
                        });
                    }
                    self.setState({
                        loader: false,
                        identifiedBLTableContent: data.PluginBLs
                    });
                }
                else {
                    self.setState({
                        loader: false,
                        identifiedBLTableContent:[]
                    });
                }

                let record = data.TotalRecords % self.state.SearchPageSize;
                if (record === 0) {
                    let pagenum = (data.TotalRecords) / self.state.SearchPageSize;
                    self.setState({
                        pageNumber: pagenum,
                        loader:false
                    })
                } else {
                    let remain = data.TotalRecords % self.state.SearchPageSize;
                    self.setState({
                        pageNumber: (((data.TotalRecords) - remain) / self.state.SearchPageSize) + 1,
                        loader:false
                    })
                }
                if(datalength <= Environment.defaultDownloadExcelLimit) {
                    self.ExportToExcelData(tokenData,self.state,datalength);
                }else{
                    self.setState({
                        dataForExport:null
                    })
                }
            })
            let pgSize=1;
             a=setTimeout(() => this.checkin(self.state.pending,pgSize,self.state.pageSize,controller), 10000);

        }
    };
    apply() {
        this.setState({
            loader:true,
            showErrorExportDialog: false,
            dataForExport:null
        })
        this.dataTable.table.state.page=0;
        let values = this.filterss.getFilterValues();
        let BLNumber = values[0].value;
        let BLCarrierCode = values[1].value;
        let BL_TYPE="";
        let CONSIGNEE_NAME="";
        let Shipper_NAME="";
        let BLPACKAGES="";
        CONSIGNEE_NAME = values[2].value;
        Shipper_NAME = values[3].value;
        let Version = '';
        let Status="";
        let VOYAGE="";
        let BLMeasurement="";
        let VesselName="";
        let Customer="";
        let EventDate="";
        let eventDateTo="";
        let ETA="";
        let ETD=""
        let SHIP_LOAD_NAME="";
        let SHIP_DISC_NAME=""
        if(values.length>4) {
            Version= values[5].value
            VOYAGE = values[6].value;
            BLPACKAGES=values[8].value;
            BLMeasurement=values[9].value;
            VesselName=values[10].value;
            Customer=values[11].value;
            SHIP_LOAD_NAME=values[12].value;
            SHIP_DISC_NAME=values[13].value;
            Status=values[7].value;
            BL_TYPE=values[4].value;
            EventDate=values[14].value;
            eventDateTo=values[15].value;
            ETA=values[16].value;
            ETD=values[17].value;
            let dateToETA=ETA;
            let dateToETD=ETD;
            let dateToEventDate=EventDate;
            let dateToEventDateTo=eventDateTo;
            if(dateToETA !== '') {
                let yearConst = dateToETA.slice(6, 10);
                let monthConst = dateToETA.slice(3, 5);
                let daysConst = dateToETA.slice(0, 2);
                ETA = yearConst + '-' + monthConst + '-' + daysConst;

            }
            if(dateToETD !== '') {
                let yearConst = dateToETD.slice(6, 10);
                let monthConst = dateToETD.slice(3, 5);
                let daysConst = dateToETD.slice(0, 2);
                ETD = yearConst + '-' + monthConst + '-' + daysConst;

            }
            if(dateToEventDate !== '') {
                let yearConst = dateToEventDate.slice(6, 10);
                let monthConst = dateToEventDate.slice(3, 5);
                let daysConst = dateToEventDate.slice(0, 2);
                EventDate = yearConst + '-' + monthConst + '-' + daysConst;

            }
            if(dateToEventDateTo !== '') {
                let yearConst = dateToEventDateTo.slice(6, 10);
                let monthConst = dateToEventDateTo.slice(3, 5);
                let daysConst = dateToEventDateTo.slice(0, 2);
                eventDateTo = yearConst + '-' + monthConst + '-' + daysConst;

            }
        }
        this.setState({
            columnDataObj : []
        });
        let columnDataObj = this.state.columnDataObj;
        let BLNum= {
            "ColumnName": 'BLNumber',
            "Operator": 'contains',
            "Value1": BLNumber,
            "Value2": ''
        };

        let BLCarrier={
            "ColumnName": 'BLCarrierCode',
            "Operator": 'contains',
            "Value1": BLCarrierCode,
            "Value2": ''
        }
        if(BL_TYPE===null || BL_TYPE==='Select')
            BL_TYPE="";

        let bltype = {
            "ColumnName": 'BL_TYPE',
            "Operator": 'equal',
            "Value1": BL_TYPE,
            "Value2": ''
        }

        let Versions = {
            "ColumnName": 'Version',
            "Operator": 'equal',
            "Value1": Version,
            "Value2": ''
        }
        if(CONSIGNEE_NAME===undefined || CONSIGNEE_NAME===null ){
            CONSIGNEE_NAME="";
        }

        let ConsigneeNam = {
            "ColumnName": 'CONSIGNEE_NAME',
            "Operator": 'contains',
            "Value1":CONSIGNEE_NAME,
              "Value2": ''
        }
        if(Status===null || Status==='Select'){
            Status='';
        }

        let Stat = {
            "ColumnName": 'Status',
            "Operator": 'contains',
            "Value1": Status,
            "Value2": ''
        }
        let shipName = {
            "ColumnName": 'Shipper_NAME',
            "Operator": 'contains',
            "Value1": Shipper_NAME,
            "Value2": ''
        }
        let voy = {
            "ColumnName": 'VOYAGE',
            "Operator": 'contains',
            "Value1": VOYAGE,
            "Value2": ''
        }
        let BLPack = {
            "ColumnName": 'BLPACKAGES',
            "Operator": 'equal',
            "Value1": BLPACKAGES,
            "Value2": ''
        };



        let BLMeasure = {
            "ColumnName": 'BLMeasurement',
            "Operator": 'equal',
            "Value1": BLMeasurement,
            "Value2": ''
        };
        let VesselNam = {
            "ColumnName": 'VesselName',
            "Operator": 'contains',
            "Value1": VesselName,
            "Value2": ''
        };
        let Cust = {
            "ColumnName": 'Customer',
            "Operator": 'contains',
            "Value1": Customer,
            "Value2": ''
        };
        let EveDate = {
            "ColumnName": 'EventDate',
            "Operator": 'range',
            "Value1": EventDate,
            "Value2": eventDateTo
        }
        let ETADate = {
            "ColumnName": 'ETD',
            "Operator": 'greaterthanequal',
            "Value1": ETA,
            "Value2": ''
        }
        let ETDDate = {
            "ColumnName": 'ETA',
            "Operator": 'greaterthanequal',
            "Value1": ETD,
            "Value2": ''
        }
        let shpLoad={
            "ColumnName": 'SHIP_LOAD_NAME',
            "Operator": 'contains',
            "Value1": SHIP_LOAD_NAME,
            "Value2": ''
        }
        let shpDisc={
            "ColumnName": 'SHIP_DISC_NAME',
            "Operator": 'contains',
            "Value1": SHIP_DISC_NAME,
            "Value2": ''
        }



        if (BLNumber!== '') {
            columnDataObj.push(BLNum);
        }
        if (BL_TYPE!=='') {

            columnDataObj.push(bltype);
        }

        if (Version !== '') {

            columnDataObj.push(Versions);
        }

        if (CONSIGNEE_NAME !== '') {

            columnDataObj.push(ConsigneeNam);
        }

        if (Status !== '') {

            columnDataObj.push(Stat);
        }
        if (Shipper_NAME !== '') {
            columnDataObj.push(shipName);
        }
        if (VOYAGE !== '') {
            columnDataObj.push(voy)
        }
        if(BLCarrierCode!==''){
            columnDataObj.push(BLCarrier);
        }
        if(BLPACKAGES!==''){
            columnDataObj.push(BLPack);
        }
        if(BLMeasurement!==''){
            columnDataObj.push(BLMeasure);
        }
        if(VesselName!==''){
            columnDataObj.push(VesselNam);
        }
        if(Customer!==''){
            columnDataObj.push(Cust);
        }
        if(EventDate!==''){
            columnDataObj.push(EveDate);
        }
        if(ETA!==''){
            columnDataObj.push(ETADate);
        }
        if(ETD!==''){
            columnDataObj.push(ETDDate);
        }
        if(SHIP_LOAD_NAME!== '') {
            columnDataObj.push(shpLoad);
        }
        if(SHIP_DISC_NAME!== '') {
            columnDataObj.push(shpDisc);
        }

        this.setState({
            colObj:columnDataObj
        })


        this.searchIdentifiedTableData(columnDataObj);

    }
    clear() {
        // Filters cleared
        var vals={

            pageSize:10,
            page: 0,
           clear:true

        }
        this.dataTable.table.state.page=0;
        this.setState({
            callExportExcel:true
        })

        var instance=null;

        this.loadIdentifiedTableData(vals,instance);
    }
    ExportToExcelData(tokenData,state,datalength) {
        let self=this;

        /*
     if(state.clear!==undefined && state.clear!== false){
          self.setState({
              colObj:[]
          })
      }
      */


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


        fetch(API.BL_DETAILS + "?pageNumber=" + pagetotal + "&pageSize=" + datalength, {
            method: "POST",
            body: JSON.stringify(obj),
            headers: headers,
            signal: signal

        }).then(function (response) {
            return response.json();
        }).then(function (data) {
            self.setState({

                showModal:false,

            })
            if(Array.isArray(data.PluginBLs)) {
                var values1 = data.PluginBLs.map((_arrayElement) => Object.assign({}, _arrayElement));
                self.setState({
                    dataForExport: values1
                })
            }
        });
    }

    render() {
        let filterss = {
            defaultStateOpen: true,
            moreLess: true,
            inputs: [
                {id: 60, label: 'BL Number', type: 'text', placeholder: "Enter BL Number", isBaseFilter: true},
                {id: 61, label: 'Carrier Code', type: 'text', placeholder: "Enter Carrier Code", isBaseFilter: true},
                {id: 62, label: 'Consignee Name', type: 'text', placeholder: "Enter Consignee Name", isBaseFilter: true},
                {id: 63, label: 'Shipper Name', type: 'text', placeholder: "Enter Supplier Name", isBaseFilter: true},
                {id: 64, label: 'Type', type: 'dropdown', placeholder: "Select", options: [{label: 'Select', value:'Select'},{label: 'HAWB', value:'HAWB'}, {label: 'MASTER', value:'MASTER'}, {label: 'HSWB', value:'HSWB'},{label: 'HBL', value:'HBL'},{label: 'CBL', value:'CBL'}], isMulti: false, isSearchable: true, isBaseFilter: false},
                {id: 65, label: 'Version', type: 'text', placeholder: "Enter Version", isBaseFilter: false},
                {id: 67, label: 'Voyage', type: 'text', placeholder: "Enter Voyage", isBaseFilter: false},
                {id: 68, label: 'Status', type: 'dropdown', placeholder: "Select", options: [{label: 'Select', value:'Select'},{label: 'Completed', value:'completed'}, {label: 'Delivered To Kewill', value:'DeliveredToKewill'}, {label: 'Delivered To CW1', value:'DeliveredToCW1'}, {label: 'Exempted', value:'Exempted'},{label: 'Inserted', value:'Inserted'},{label: 'Rejected', value:'Rejected'}], isMulti: false, isSearchable: true, isBaseFilter: false},
                {id: 69, label: 'Packages', type: 'text', placeholder: "Enter Packages", isBaseFilter: false},
                {id: 70, label: 'Measurement', type: 'text', placeholder: "Enter Measurement", isBaseFilter: false},
                {id: 71, label: 'Vessel Name', type: 'text', placeholder: "Enter Vessel Name", isBaseFilter: false},
                {id: 72, label: 'Customer', type: 'text', placeholder: "Enter Customer", isBaseFilter: false},
                {id: 73, label: 'Created From', type: 'date-mon-sun', noDateOption: false, isBaseFilter: false},
                {id: 74, label: 'Created To', type: 'date-mon-sun', noDateOption: false, isBaseFilter: false},
                {id: 75, label: 'ETD', type: 'date-mon-sun', noDateOption: false, isBaseFilter: false},
                {id: 76, label: 'ETA', type: 'date-mon-sun', noDateOption: false, isBaseFilter: false},
                {id: 77, label: 'Port of Loading', type: 'text', placeholder: "Enter Port of Loading", isBaseFilter: false},
                {id: 78, label: 'Port Of Discharge', type: 'text', placeholder: "Enter Port of Discharge", isBaseFilter: false},



            ]
        };
        const ExcelFile = ReactExport.ExcelFile;
        const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
        const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;
        return (
            <div>
                <section className="page-container">
                    <div className="grid-wrapper">
                        <div className="col-100">
                            <FilterSection data={filterss} applyAction={() => this.apply()}
                                           clearAction={() => this.clear()} ref={(filterss) => this.filterss = filterss}/>

                        </div>

                    </div>
                </section>
                {
                    (typeof this.state.identifiedBLTableContent) !== undefined ?
                        <section className="page-container">
                            <div className="grid-wrapper">
                                {this.state.dataForExport !== null ?

                                <ExcelFile filename="BLData" element={<button type="button" className="button button-blue">Export to Excel</button>}>
                                    <ExcelSheet data={this.state.dataForExport} name="BL Details">
                                        <ExcelColumn label="ShipmentId" value="ShipmentId"/>
                                        <ExcelColumn label="BL Number" value="BLNumber"/>
                                        <ExcelColumn label="BL CarrierCode" value="BLCarrierCode"/>
                                        <ExcelColumn label="Consignee Name" value="CONSIGNEE_NAME"/>
                                        <ExcelColumn label="Shipper Name" value="Shipper_NAME"/>
                                        <ExcelColumn label="BL TYPE" value="BL_TYPE"/>
                                        <ExcelColumn label="Version" value="Version"/>
                                        <ExcelColumn label="Voyage" value="VOYAGE"/>
                                        <ExcelColumn label="BL PACKAGES" value="BLPACKAGES"/>
                                        <ExcelColumn label="BL Measurement" value="BLMeasurement"/>
                                        <ExcelColumn label="Vessel Name" value="VesselName"/>
                                        <ExcelColumn label="Status" value="Status"/>
                                        <ExcelColumn label="Active" value="Active"/>
                                        <ExcelColumn label="Event Date" value="EventDate"/>
                                        <ExcelColumn label="Customer" value="Customer"/>
                                        <ExcelColumn label="ETD" value="ETD"/>
                                        <ExcelColumn label="ETA" value="ETA"/>
                                        <ExcelColumn label="SHIP LOAD NAME" value="SHIP_LOAD_NAME"/>
                                        <ExcelColumn label="SHIP DISC NAME" value="SHIP_DISC_NAME"/>
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
                            data={this.state.identifiedBLTableContent}
                            columns={[



                                {

                                    headerClassName: 'data-table header ',
                                    accessor: "BLNumber",
                                    editable: false,
                                    isHyperlink: true,
                                    fieldHeader: 'BL Number',
                                    show: true,


                                },
                                {

                                    headerClassName: 'data-table header ',
                                    accessor: "BLCarrierCode",
                                    editable: false,
                                    isLink: false,
                                    fieldHeader: 'Carrier Code',
                                    show: true,


                                },
                                {
                                    headerClassName: 'data-table header',
                                    accessor: "CONSIGNEE_NAME",

                                    isStatus: false,
                                    isLink: false,
                                    fieldHeader: 'Consignee Name',
                                    show: true,

                                    footer: null
                                },
                                {
                                    headerClassName: 'data-table header',

                                    accessor: "Shipper_NAME",

                                    isStatus: false,
                                    isLink: false,
                                    fieldHeader: "Shipper Name",
                                    show: true


                                },
                                {
                                    headerClassName: 'data-table header',

                                    accessor: "BL_TYPE",

                                    editType: "text",
                                    isStatus: false,
                                    isLink: false,
                                    fieldHeader: "Type",
                                    show: true

                                },
                                {
                                    headerClassName: 'data-table header ',

                                    accessor: "Version",
                                    editable: false,
                                    isLink: false,
                                    fieldHeader: 'Version',
                                    show: true,

                                },
                                {
                                    headerClassName: 'data-table header',
                                    accessor: "VOYAGE",
                                    editable: false,

                                    isLink: false,
                                    fieldHeader: 'Voyage',
                                    show: true,

                                },
                                {
                                    headerClassName: 'data-table header',
                                    accessor: "BLPACKAGES",
                                    isStatus: false,
                                    isLink: false,
                                    fieldHeader: 'Packages',
                                    show: true
                                },
                                {
                                    headerClassName: 'data-table header',
                                    accessor: "BLMeasurement",
                                    isStatus: false,
                                    isLink: false,
                                    fieldHeader: 'Measurement',
                                    show: true
                                },
                                {
                                    headerClassName: 'data-table header',
                                    accessor: "VesselName",
                                    isStatus: false,
                                    isLink: false,
                                    fieldHeader: 'Vessel Name',
                                    show: true
                                },
                                {
                                    headerClassName: 'data-table header',
                                    accessor: "Customer",
                                    isStatus: false,
                                    isLink: false,
                                    fieldHeader: 'Customer',
                                    show: true
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
                                    accessor: "ETD",
                                    editable: false,
                                    isLink: false,
                                    fieldHeader: 'ETD',
                                    show: true,

                                },
                                {
                                    headerClassName: 'data-table header',
                                    accessor: "ETA",
                                    editable: false,
                                    isLink: false,
                                    fieldHeader: 'ETA',
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
                            tableName={"BITable"}
                            ref={(dataTable) => {
                                this.dataTable = dataTable;
                            }}
                            statusOptions={this.state.statusOptions}

                            actions={this.state.actions}
                            height={"auto"}
                        />


                    </div>
                </section>
                <Loader loader={this.state.loader}/>
            </div>
        )
    }
}

export default IdentifiedBI;