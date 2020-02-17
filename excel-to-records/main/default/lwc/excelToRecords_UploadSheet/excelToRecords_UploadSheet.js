import { LightningElement, wire } from 'lwc';
import USER_ID from '@salesforce/user/Id';
import { loadScript } from 'lightning/platformResourceLoader';
import { subscribe, onError } from 'lightning/empApi';
import SHEETJS from '@salesforce/resourceUrl/SheetJS';
import getObjects from '@salesforce/apex/ExcelToRecords.getObjects';
import getRecordTypes from '@salesforce/apex/ExcelToRecords.getRecordTypes';
import insertRecords from '@salesforce/apex/ExcelToRecords.insertRecords';

export default class ExcelToRecords_UploadSheet extends LightningElement {

    channelName = '/event/ExcelToRecords_AsynchronousDml__e';
    subscription = {};
    userId = USER_ID;
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
        this.loadSheetJs();
        this.subscribePlatformEvent();
    }

    loadSheetJs() {
        Promise.all([
            loadScript(this, SHEETJS + '/xlsx.mini.js')
        ])
            .then(() => { })
            .catch(error => {
                this.message = error.body.message;
            });
    }

    subscribePlatformEvent() {
        var self = this;
        const messageCallback = function (response) {
            if (response.data.payload.User__c === self.userId) {
                self.message = response.data.payload.NumberOfRecords__c + ' ' + response.data.payload.ObjectType__c + ' to ' + response.data.payload.Operation__c;
                self.message += ' - Success: ' + response.data.payload.Successful__c;
                self.message += ' - Failed: ' + response.data.payload.Failed__c;
                if (response.data.payload.Status__c !== 'Success') {
                    self.message += ' - Error: ' + response.data.payload.Message__c;
                }
                self.isLoaded = true;
            }
        };
        subscribe(this.channelName, -1, messageCallback)
            .then(response => {
                this.subscription = response;
            });
    }

    registerErrorListener() {
        var self = this;
        onError(error => {
            self.message = JSON.stringify(error);
            self.isLoaded = true;
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
            })
            .catch(error => {
                this.message = error.body.message;
                this.isLoaded = true;
            });
    }

}