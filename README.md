# Excel to Records

Repository under construction.

Retrieve with Metadata API format:

```
sfdx force:mdapi:retrieve --targetusername ExcelToRecordsSO --wait 10 --unpackaged manifest/package.xml --retrievetargetdir src --singlepackage
```

Create a package version:

```
sfdx force:package:version:create --package "Excel to Records" --path excel-to-records --installationkeybypass --wait 10 --targetdevhubusername ExcelToRecords
```