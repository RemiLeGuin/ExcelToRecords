import { LightningElement, track, wire } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import SHEETJS from '@salesforce/resourceUrl/SheetJS';
import getObjects from '@salesforce/apex/ExcelToRecords.getObjects';
import insertRecords from '@salesforce/apex/ExcelToRecords.insertRecords';

export default class ExcelToRecords_UploadSheet extends LightningElement {

    @track message;
    @track raws;
    @track objectType;
    @track objectTypes = [];

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
            });
            if (this.objectTypes.length > 0) {
                this.objectType = this.objectTypes[0].value;
            }
            this.message = undefined;
        }
        else if (error) {
            this.message = error;
            this.objectTypes = [];
        }
    }

    handleObjectTypeChange(event) {
        this.objectType = event.detail.value;
    }

    readFile(event) {
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
        }
        reader.readAsArrayBuffer(event.target.files[0]);
    }

    handleSubmit() {
        insertRecords({ raws: this.raws, objectType: this.objectType })
            .then(result => {
                this.message = result;
            })
            .catch(error => {
                this.message = error;
            });
    }

}