import { LightningElement, wire } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import SHEETJS from '@salesforce/resourceUrl/SheetJS';
import JSFORCE from '@salesforce/resourceUrl/JSforce';
import getObjects from '@salesforce/apex/ExcelToRecords.getObjects';
import getRecordTypes from '@salesforce/apex/ExcelToRecords.getRecordTypes';

export default class ExcelToRecords_UploadSheet_BulkAPI extends LightningElement {

    isLoaded = true;
    message;
    raws;
    isUploadInputDisabled = false;
    objectTypes = [];
    objectType;
    sObjectTypes = new Map();
    sObjectType;
    isObjectTypeInputDisabled = true;
    recordTypes = [];
    recordTypeId;
    isRecordTypeInputDisabled = true;
    isSubmitButtonDisabled = true;

    connectedCallback() {
        Promise.all([
            loadScript(this, SHEETJS + '/xlsx.mini.js'),
            loadScript(this, JSFORCE + '/jsforce.min.js')
        ])
            .then(() => { })
            .catch(error => {
                this.message = error.body.message;
            });
    }

    @wire(getObjects)
    wiredObjects({ data, error }) {
        var self = this;
        if (data) {
            data.forEach(function (objectType) {
                let option = { label: objectType.Label, value: objectType.DeveloperName };
                self.objectTypes = [...self.objectTypes, option];
                self.sObjectTypes.set(objectType.DeveloperName, objectType.SalesforceObject__c);
            });
            if (this.objectTypes.length > 0) {
                this.objectType = this.objectTypes[0].value;
                this.sObjectType = this.sObjectTypes.get(this.objectTypes[0].value);
                this.isObjectTypeInputDisabled = false;
                if (this.raws) {
                    this.isSubmitButtonDisabled = false;
                }
            }
            else {
                this.objectType = undefined;
                this.isObjectTypeInputDisabled = true;
                this.isSubmitButtonDisabled = true;
            }
            this.message = undefined;
        }
        else if (error) {
            this.message = error;
            this.objectTypes = [];
        }
    }

    @wire(getRecordTypes, { sObjectType: '$sObjectType' })
    wiredRecordtypes({ data, error }) {
        var self = this;
        this.recordTypes = [];
        if (data) {
            data.forEach(function (recordType) {
                let option = { label: recordType.Name, value: recordType.Id };
                self.recordTypes = [...self.recordTypes, option];
            });
            if (this.recordTypes.length > 0) {
                this.recordTypeId = this.recordTypes[0].value;
                this.isRecordTypeInputDisabled = false;
            }
            else {
                this.recordTypeId = undefined;
                this.isRecordTypeInputDisabled = true;
            }
            this.message = undefined;
        }
        else if (error) {
            this.message = error;
            this.recordTypes = [];
        }
    }

    handleObjectTypeChange(event) {
        this.objectType = event.detail.value;
        this.sObjectType = this.sObjectTypes.get(event.detail.value);
    }

    handleRecordTypeChange(event) {
        this.recordTypeId = event.detail.value;
    }

    handleUpload(event) {
        this.isUploadInputDisabled = true;
        let reader = new FileReader();
        let self = this;
        reader.onload = function (e) {
            let binary = '';
            let bytes = new Uint8Array(e.target.result);
            let length = bytes.byteLength;
            for (let i = 0; i < length; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            let workbook = XLSX.read(binary, { type: 'binary' });
            let sheet_name_list = workbook.SheetNames;
            self.raws = XLSX.utils.sheet_to_csv(workbook.Sheets[sheet_name_list[0]]);
            console.log(self.raws);
            if (self.objectType) {
                self.isSubmitButtonDisabled = false;
            }
            self.isUploadInputDisabled = false;
        }
        reader.readAsArrayBuffer(event.target.files[0]);
    }

    handleSubmit() {
        //this.isLoaded = false;
        /*fetch('https://login.salesforce.com/services/oauth2/token?grant_type=password&client_id=3MVG91BJr_0ZDQ4sEmiCuq5yP_dKNkuIYrfk0g3Y70rtj8fM2eWMUXIgcFa.mh2PLZGfPq7bo0x3JbQ7hj2Dg&client_secret=EED8F6B893D37171B3FB6FF57FE35588EBC0399F1BD674C26E23EF9896A06CA5&username=remileguin@brave-goat-ssn01h.com&password=SheetJS2020rAFfJe4xlLZaSGFlALCwwL4za', {
            method: "POST",
            body: 'grant_type=password&client_id=3MVG91BJr_0ZDQ4sEmiCuq5yP_dKNkuIYrfk0g3Y70rtj8fM2eWMUXIgcFa.mh2PLZGfPq7bo0x3JbQ7hj2Dg&client_secret=EED8F6B893D37171B3FB6FF57FE35588EBC0399F1BD674C26E23EF9896A06CA5&username=remileguin@brave-goat-ssn01h.com&password=SheetJS2020rAFfJe4xlLZaSGFlALCwwL4za'
        })
            .then((response) => {
                return response.json();
            })
            .then((jsonResponse) => {
                console.log(JSON.stringify(jsonResponse));
            })
            .catch(error => {
                console.log(JSON.stringify(error));
            })*/
        /*const conn = new jsforce.Connection({
            loginUrl: 'https://login.salesforce.com'
        });
        conn.login('remileguin@brave-goat-ssn01h.com', 'SheetJS2020rAFfJe4xlLZaSGFlALCwwL4za', function(err, res) {
            if (err) {
                return console.log(err);
            }
            console.log(res);
        });*/
        /*jsforce.browser.init({
            clientId: '3MVG91BJr_0ZDQ4sEmiCuq5yP_dKNkuIYrfk0g3Y70rtj8fM2eWMUXIgcFa.mh2PLZGfPq7bo0x3JbQ7hj2Dg',
            redirectUri: 'https://login.salesforce.com/services/oauth2/success'
        });
        console.log('AFTER jsforce.browser.init');
        jsforce.browser.on('connect', function (conn) {
            console.log('AFTER jsforce.browser.on connect');
            console.log(conn);
            conn.query('SELECT Id, Name FROM Account', function (err, res) {
                console.log('AFTER QUERY');
                if (err) {
                    return console.error(err);
                }
                console.log(res);
            });
            console.log('END');
        });*/
        /*const conn = new jsforce.Connection({
            loginUrl: 'https://login.salesforce.com'
        });
        conn.login('remileguin@brave-goat-ssn01h.com', 'SheetJS2020' + 'rAFfJe4xlLZaSGFlALCwwL4za', err => {
            if (err) {
                console.log('ERROR');
                console.error(JSON.stringify(err));
            }
        });*/
        /*fetch('https://login.salesforce.com/services/oauth2/token?grant_type=password&client_id=3MVG91BJr_0ZDQ4sEmiCuq5yP_dKNkuIYrfk0g3Y70rtj8fM2eWMUXIgcFa.mh2PLZGfPq7bo0x3JbQ7hj2Dg&client_secret=EED8F6B893D37171B3FB6FF57FE35588EBC0399F1BD674C26E23EF9896A06CA5&username=remileguin@brave-goat-ssn01h.com&password=SheetJS2020rAFfJe4xlLZaSGFlALCwwL4za', {
			method : 'POST'
        });*/
        let conn = new jsforce.Connection({ accessToken: 'K2ckDuTWax9zBJZW24CF6aJ+IzH0k6NLe6ymF20MEC8=' });
        conn.query('SELECT Id, Name FROM Account', function (err, res) {
            console.log('AFTER QUERY');
            if (err) {
                console.log('ERROR:');
                return console.log(JSON.stringify(err));
            }
            console.log('RESPONSE:');
            console.log(res);
        });
    }

}