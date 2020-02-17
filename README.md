# Excel to Records

Repository under construction.

## Install Unlocked Package

Install the unlocked package following this URL:
-   For Sandboxes: https://test.salesforce.com/packaging/installPackage.apexp?p0=04t3X000002cNKlQAM
-   For Production environments, Developer Editions and Trailhead Playgrounds: https://login.salesforce.com/packaging/installPackage.apexp?p0=04t3X000002cNKlQAM

## Install with Metadata API by deploying the src folder

To deploy this repository using the classic Metadata API, execute the folowing command line from the cloned workspace:

```
sfdx force:mdapi:deploy --zipfile src/excel-to-records.zip --wait 10 --singlepackage --targetusername /*username or alias for the target environment*/
```

## Useful command lines for development

Retrieve with Metadata API format:

```
sfdx force:mdapi:retrieve --targetusername ExcelToRecordsSO --wait 10 --unpackaged manifest/package.xml --retrievetargetdir src --singlepackage
```

Create a package version:

```
sfdx force:package:version:create --package "Excel to Records" --path excel-to-records --installationkeybypass --wait 10 --targetdevhubusername ExcelToRecords
```