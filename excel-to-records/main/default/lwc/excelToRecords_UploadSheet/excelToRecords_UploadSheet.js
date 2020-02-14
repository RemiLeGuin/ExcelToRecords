import { LightningElement, track, wire } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import SHEETJS from '@salesforce/resourceUrl/SheetJS';
import getObjects from '@salesforce/apex/ExcelToRecords.getObjects';
import getRecordTypes from '@salesforce/apex/ExcelToRecords.getRecordTypes';
import insertRecords from '@salesforce/apex/ExcelToRecords.insertRecords';

export default class ExcelToRecords_UploadSheet extends LightningElement {

    @track isLoaded = true;
    @track message;
    @track raws;
    @track isUploadInputDisabled = false;
    @track objectTypes = [];
    @track objectType;
    @track sObjectTypes = new Map();
    @track sObjectType;
    @track isObjectTypeInputDisabled = true;
    @track recordTypes = [];
    @track recordTypeId;
    @track isRecordTypeInputDisabled = true;
    @track isSubmitButtonDisabled = true;

    connectedCallback() {
        Promise.all([
            loadScript(this, SHEETJS + '/xlsx.mini.js')
        ])
            .then(() => { })
            .catch(error => {
                this.message = error.body.message;
            });
    }

    @wire(getObjects)
    wiredObjects({ error, data }) {
        var self = this;
        if (data) {
            data.forEach(function (objectType) {
                var option = { label: objectType.Label, value: objectType.DeveloperName };
                self.objectTypes = [ ...self.objectTypes, option ];
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

    @wire(getRecordTypes, { recordTypeId: '$sObjectType' })
    wiredRecordtypes({ error, data }) {
        var self = this;
        if (data) {
            data.forEach(function (recordType) {
                var option = { label: recordType.Name, value: recordType.Id };
                self.recordTypes = [ ...self.recordTypes, option ];
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

    handleUpload(event) {
        this.isUploadInputDisabled = true;
        let reader = new FileReader();
        var self = this;
        reader.onload = function (e) {
            var binary = '';
            var bytes = new Uint8Array(e.target.result);
            var length = bytes.byteLength;
            for (var i = 0; i < length; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            var workbook = XLSX.read(binary, { type: 'binary' });
            var sheet_name_list = workbook.SheetNames;
            self.raws = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
            if (self.objectType) {
                self.isSubmitButtonDisabled = false;
            }
            self.isUploadInputDisabled = false;
        }
        reader.readAsArrayBuffer(event.target.files[0]);
    }
    
    handleSubmit() {
        this.isLoaded = false;
        insertRecords({ raws: this.raws, objectType: this.objectType, sObjectType: this.sObjectType, recordTypeId: this.recordTypeId })
            .then(result => {
                this.message = result;
                this.isLoaded = true;
            })
            .catch(error => {
                console.log(error);
                this.message = error.body.message;
                this.isLoaded = true;
            });
    }
    
}