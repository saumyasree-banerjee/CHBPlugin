import React, {Component} from 'react';
import Loader from '../Common/Loader';
import ModalError from '../Common/Error';

import {HorizontalTabs} from 'damco-components';
import API from "../../../Constants/API-config";
import IdentifiedBI from "./IdentifiedBI";
import CI from "./CI";
import PassThrough from "../PassthroughDetails/PassThrough";
import ISF from "../ISFDetails/ISF";


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
            loader: false,
            isDisabled: true,
            isDisabledSelect: false,
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
            tabState: 0

        }
    }
    onIdentifiedTabChange=(id)=>{
        this.setState({
            loader: false
        })
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
        this.setState({
            loader: false
        })

    }
    componentWillMount = () => {
        let self = this;
        self.setState({loader: true,});
        // console.log(sessionStorage.getItem('tabState'),"Tabcontent");
        let sessionValue= parseInt(sessionStorage.getItem('tabState'));

        self.setState({
            tabState:sessionValue
        })
        setTimeout(function(){
            if(sessionStorage.getItem('tabState') !==  null) {
                self.onIdentifiedTabChange(parseInt(sessionStorage.getItem('tabState')) + 1);
            }else{
                self.onIdentifiedTabChange(1);
            }}, 1000);
    }
    componentDidMount = () => {
        // let self = this;
        //this.loadIdentifiedTableData();
    }
    componentWillUnmount = () => {
       // clearTimeout(this.fetchDataTimeOut);
        //clearInterval(this.fetchDataInterval);
    }
    signOut = () => {
        this.props.signOut();
    }
    loadIdentifiedTableData(state, instance) {
        let self = this;
        let tokenData = '';
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
                self.tokenDataService(tokenData, state, instance);
            });
        }
    };

    tokenDataService(tokenData, state, instance) {
        let self = this;
        if(state.pageSize!==undefined && state.pageSize!==null )
            self.setState(
                {
                    SearchPageSize:state.pageSize
                }
            )
        if(state.clear!==undefined){
            self.setState({
                colObj:[]
            })
        }

        let pagetotal = state.page + 1;
        if(self.state.colObj===[]){
            var obj="[]"
        }
        else
            obj=self.state.colObj;

        if (tokenData !== "") {
            fetch(API.CUSTOMER_INVOICE_RESULT + "?pageNumber=" + pagetotal + "&pageSize=" + state.pageSize, {
                method: "POST",
                body: JSON.stringify(obj),
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
                if (data.PluginCIFiles != null  ) {
                    data.PluginCIFiles.map(item => {
                        item.CommercialInvoiceHeaderID = item.CommercialInvoiceHeaderID.toString();
                        item.CommercialInvoiceReference = [item.CommercialInvoiceReference, "/CIDetails/" + item.CommercialInvoiceHeaderID]
                        item.Status = [item.Status, "/"+item.Status +"/" + item.CommercialInvoiceHeaderID +"/StatusDetail"];
                        item.logDetails = ["Audit Details", "/CILogDetails/" + item.CommercialInvoiceHeaderID ];
                        if(item.LastUpdated !== '') {
                            let yearConst = item.LastUpdated.slice(0,4);
                            let monthConst = item.LastUpdated.slice(5,7);
                            let daysConst = item.LastUpdated.slice(8, 10);
                            item.LastUpdated = yearConst + '-' + monthConst + '-' + daysConst;
                        }
                        if(item.EventDate !== '') {
                            let yearConst = item.EventDate.slice(0, 4);
                            let monthConst = item.EventDate.slice(5, 7);
                            let daysConst = item.EventDate.slice(8, 10);
                            item.EventDate= yearConst + '-' + monthConst + '-' + daysConst;
                        }
                        if(item.CommercialInvoiceDate !== '') {
                            let yearConst = item.CommercialInvoiceDate.slice(0, 4);
                            let monthConst = item.CommercialInvoiceDate.slice(5, 7);
                            let daysConst = item.CommercialInvoiceDate.slice(8, 10);
                            item.CommercialInvoiceDate= yearConst + '-' + monthConst + '-' + daysConst;

                        }
                        if(item.DepartureDateEstimated !== '') {

                            let yearConst = item.DepartureDateEstimated.slice(0, 4);
                            let monthConst = item.DepartureDateEstimated.slice(5, 7);
                            let daysConst = item.DepartureDateEstimated.slice(8, 10);
                            item.DepartureDateEstimated= yearConst + '-' + monthConst + '-' + daysConst;

                        }

                        if(item.ArrivalDateEstimated !== '' && item.ArrivalDateEstimated!=null ) {

                            let yearConst = item.ArrivalDateEstimated.slice(0, 4);
                            let monthConst = item.ArrivalDateEstimated.slice(5, 7);
                            let daysConst = item.ArrivalDateEstimated.slice(8, 10);
                            item.ArrivalDateEstimated= yearConst + '-' + monthConst + '-' + daysConst;

                        }

                        return null;
                    });
                    self.setState({
                        loader: false,
                        identifiedTableContent: data.PluginCIFiles,


                    });
                }


                let record = data.TotalRecords % state.pageSize;
                if (record === 0) {
                    let pagenum = (data.TotalRecords) / state.pageSize;
                    self.setState({
                        pageNumber: pagenum
                    })
                } else {
                    let remain = data.TotalRecords % state.pageSize
                    self.setState({
                        pageNumber: (((data.TotalRecords) - remain) / state.pageSize) + 1

                    })
                }

            })
        }
    };

    fetchData(state, instance) {

            this.setState({
                tabState: sessionStorage.getItem('tabState')
            })
        if(this.state.tabState===0) {
        //   this.loadIdentifiedTableData(state, instance);
       }


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
        //  this.tokenData=tokenData;
        let pagetotal = 1;
        let pageSize=10;

        if (tokenData !== "") {
            fetch(API.CUSTOMER_INVOICE_RESULT + "?pageNumber=" + pagetotal + "&pageSize=" + pageSize, {
                method: "POST", // *GET, POST, PUT, DELETE, etc.

                body: JSON.stringify(obj),

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
                if(data.PluginCIFiles!=null ) {

                    data.PluginCIFiles.map(item => {
                        item.CommercialInvoiceHeaderID = item.CommercialInvoiceHeaderID.toString();
                        item.CommercialInvoiceReference = [item.CommercialInvoiceReference, "/CIDetails/" + item.CommercialInvoiceHeaderID];
                        item.Status = [item.Status, "/"+  item.Status+"/" + item.CommercialInvoiceHeaderID +"/StatusDetail"]
                        item.logDetails = ["Audit Details", "/CILogDetails/" + item.CommercialInvoiceHeaderID ];
                        if(item.LastUpdated !== '') {
                            let yearConst = item.LastUpdated.slice(0,4);
                            let monthConst = item.LastUpdated.slice(5,7);
                            let daysConst = item.LastUpdated.slice(8, 10);
                            item.LastUpdated = yearConst + '-' + monthConst + '-' + daysConst;
                        }
                        if(item.EventDate !== '') {
                            let yearConst = item.EventDate.slice(0, 4);
                            let monthConst = item.EventDate.slice(5, 7);
                            let daysConst = item.EventDate.slice(8, 10);
                            item.EventDate= yearConst + '-' + monthConst + '-' + daysConst;
                        }
                        if(item.CommercialInvoiceDate !== '') {
                            let yearConst = item.CommercialInvoiceDate.slice(0, 4);
                            let monthConst = item.CommercialInvoiceDate.slice(5, 7);
                            let daysConst = item.CommercialInvoiceDate.slice(8, 10);
                            item.CommercialInvoiceDate= yearConst + '-' + monthConst + '-' + daysConst;
                        }
                        if(item.DepartureDateEstimated !== '') {
                            let yearConst = item.DepartureDateEstimated.slice(0, 4);
                            let monthConst = item.DepartureDateEstimated.slice(5, 7);
                            let daysConst = item.DepartureDateEstimated.slice(8, 10);
                            item.DepartureDateEstimated= yearConst + '-' + monthConst + '-' + daysConst;
                        }
                        if(item.ArrivalDateEstimated !== '' && item.ArrivalDateEstimated!=null) {
                            let yearConst = item.ArrivalDateEstimated.slice(0, 4);
                            let monthConst = item.ArrivalDateEstimated.slice(5, 7);
                            let daysConst = item.ArrivalDateEstimated.slice(8, 10);
                            item.ArrivalDateEstimated= yearConst + '-' + monthConst + '-' + daysConst;
                        }     return null;
                    });



                }

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
                    identifiedTableContent: data.PluginCIFiles,
                });
            })
        }
    }



    apply(){
        this.setState({
            loader:true
        })

        let values = this.filters.getFilterValues();
        console.log(values);

        let ShipperName = values[1].value;
        let ConsigneeName = values[2].value;
        let Status='';
        if(Status===null){
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
        if(values[3].label==="Invoice Date"){
            CommercialInvoiceDate= values[3].value;
            dateToConst = CommercialInvoiceDate;
            CommercialInvoiceReference = values[0].value
            CountryOfOrigin="";
        }
        else{
            CommercialInvoiceDate= values[8].value;
            custID=values[3].value;
        }

        let EventDate='';
        let dateToConstValue='';
        let dateToConstEventValue='';
        let PortOfLoadingName='';

        let PortOfDischargeName='';
        let dateToConstArrival='';
        let dateToConstDeparture='';
        let dateToConstUpdate='';

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
            CountryOfOrigin=values[4].value
            ArrivalDateEstimated=values[11].value;
            DepartureDateEstimated=values[10].value;
            lastUpdated=values[12].value;

            let dateToConstEvent=EventDate;
            let Arriv=ArrivalDateEstimated;
            let depar=DepartureDateEstimated;
            let lastup=lastUpdated;

            if(dateToConstEvent !== '') {
                let yearConst = dateToConstEvent.slice(6, 10);
                let monthConst = dateToConstEvent.slice(3, 5);
                let daysConst = dateToConstEvent.slice(0, 2);
                dateToConstEventValue = yearConst + '-' + monthConst + '-' + daysConst;

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
        }


        let arrEstimated={
            "ColumnName" : 'ArrivalDateEstimated',
            "Operator": 'greaterthan',
            "Value1": dateToConstArrival,
            "Value2": ''
        }

        let commercialInvoiceDat = {
            "ColumnName": 'CommercialInvoiceDate',
            "Operator": 'greaterthan',
            "Value1": dateToConstValue,
            "Value2": ''
        }
        let depEstimated = {
            "ColumnName": 'DepartureDateEstimated',
            "Operator": 'greaterthan',
            "Value1": dateToConstDeparture,
            "Value2": ''
        }
        let shipperNam = {
            "ColumnName": 'ShipperName',
            "Operator": 'contains',
            "Value1": ShipperName,
            "Value2": ''
        }

        let ConsigneeNam = {
            "ColumnName": 'ConsigneeName',
            "Operator": 'contains',
            "Value1": ConsigneeName,
            "Value2": ''
        }

        let Stat = {
            "ColumnName": 'Status',
            "Operator": 'contains',
            "Value1": Status,
            "Value2": ''
        }
        let eventDat = {
            "ColumnName": 'EventDate',
            "Operator": 'greaterthan',
            "Value1": dateToConstEventValue,
            "Value2": ''
        }
        let conOrigin = {
            "ColumnName": 'CountryOfOrigin',
            "Operator": 'contains',
            "Value1": CountryOfOrigin,
            "Value2": ''
        }


        let portOfLoad={
            "ColumnName": 'PortOfLoadingName',
            "Operator": 'contains',
            "Value1": PortOfLoadingName,
            "Value2": ''
        }
        let portOfDis={
            "ColumnName": 'PortOfDischargeName',
            "Operator": 'contains',
            "Value1": PortOfDischargeName,
            "Value2": ''
        }
        let customerId={
            "ColumnName": 'CommercialInvoiceReference',
            "Operator": 'contains',
            "Value1": custID,
            "Value2": ''
        }
        let updat={
            "ColumnName": 'LastUpdated',
            "Operator": 'greaterthan',
            "Value1": dateToConstUpdate,
            "Value2": ''
        }
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
        var instance=null;

        this.loadIdentifiedTableData(vals,instance);
    }


    render() {
        const SampleData = [
            {
                "id": 1,
                "title": "Commercial Invoice",
                "count": "5",
            },
            {
                "id": 2,
                "title": "Bill of Lading",
                "count": "13",
            },

            {
                "id": 3,
                "title": "Pass Through",
                "count": "14",
            },
            {
                "id": 4,
                "title": "ISF",
                "count": "15",
            }

        ];
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
                <div className="grid-wrapper">
                    <div className="col-100">
                        {
                            this.state.tabState >= 0 ?
                                <HorizontalTabs name={"horizontal-tabs"} onChange={this.onIdentifiedTabChange}
                                                count={false} tabData={SampleData}
                                                selectedTab={this.state.tabState}>
                                    {
                                        (this.state.tabState === 0) ?
                                        <div>
                                           <CI dataSendToApiHeader={this.props.dataSendToApiHeader}
                                               showErrorDetails={this.showErrorDetails}/>

                                        </div>  :<div></div>
                                    }

                                    {
                                        (this.state.tabState === 1) ?

                                            <div>
                                                <IdentifiedBI dataSendToApiHeader={this.props.dataSendToApiHeader}
                                                              showErrorDetails={this.showErrorDetails}/>
                                            </div>:<div></div>
                                    }
                                    {
                                        (this.state.tabState === 2)?
                                        <div>
                                            <PassThrough/>
                                        </div>:<div></div>
                                    }
                                    {
                                        (this.state.tabState === 3) ?
                                        <div>
                                            <ISF/>
                                        </div>:<div></div>

                                    }

                                </HorizontalTabs>:null
                        }
                    </div>
                </div>



                <Loader loader={this.state.loader}/>
                <ModalError errorModalHide={this.errorModalHide} modalerror={this.state.modalerror}
                            modalerrorMSG={this.state.modalerrorMSG} btnTitle2={"Ok"}/>
            </div>
        )
    }
}

class ErrorSection extends Component {
    constructor(props) {
        super(props)
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

class Identified extends Component {

    constructor(props) {
        super(props)
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
                    <ErrorSection identifiedTableErrorDetails={this.state.identifiedTableErrorDetails}
                                  identifiedTableError={this.state.identifiedTableError}/>
                    : null
                }
                <Loader loader={this.state.loader}/>
            </div>
        )
    }
}

export default Identified;