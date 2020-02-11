import { LightningElement, track } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import SHEETJS from '@salesforce/resourceUrl/SheetJS';

export default class ExcelToRecords_UploadSheet extends LightningElement {

    @track message;
    
    renderedCallback() {
        Promise.all([
            loadScript(this, SHEETJS + '/xlsx.mini.js')
        ])
            .then(() => {})
            .catch(error => {
                this.message = error.body.message;
            });
    }

    readFile(event) {
        let reader = new FileReader();
        reader.onload = function (e) {
            var binary = '';
            var bytes = new Uint8Array(e.target.result);
            var length = bytes.byteLength;
            for (var i = 0; i < length; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            var workbook = XLSX.read(binary, { type: 'binary' });
            var sheet_name_list = workbook.SheetNames;
            console.log(XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]))
        }
        reader.readAsArrayBuffer(event.target.files[0]);
    }

}