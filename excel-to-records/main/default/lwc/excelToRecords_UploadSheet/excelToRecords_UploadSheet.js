import { LightningElement, track } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import SHEETJS from '@salesforce/resourceUrl/SheetJS';
import getObjects from '@salesforce/apex/ExcelToRecords.getObjects';
import insertRecords from '@salesforce/apex/ExcelToRecords.insertRecords';

export default class ExcelToRecords_UploadSheet extends LightningElement {

    @track message;
    @track raws;
    @track objectType;
    @track objectTypes = [{ label: 'Lead', value: 'Lead' }];
    /*
    connectedCallback() {
        getObjects()
            .then(result => {
                var self = this;
                result.forEach(function (objectType) {
                    var option = { label: objectType.Label, value: objectType.DeveloperName };
                    self.objectTypes.push(option);
                });
                console.log(this.objectTypes);
            })
            .catch(error => {
                this.message = error;
            });
    }
    */
    renderedCallback() {
        Promise.all([
            loadScript(this, SHEETJS + '/xlsx.mini.js')
        ])
            .then(() => { })
            .catch(error => {
                this.message = error.body.message;
            });
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