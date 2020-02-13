public with sharing class ExcelToRecords {

    @AuraEnabled(cacheable=true)
    public static List<ExcelToRecords_Object__mdt> getObjects() {
        return [SELECT Label, DeveloperName, SalesforceObject__c FROM ExcelToRecords_Object__mdt];
    }

    @AuraEnabled(cacheable=true)
    public static List<RecordType> getRecordTypes(String sObjectType) {
        return [SELECT Id, Name FROM RecordType WHERE SObjectType = :sObjectType];
    }

    @AuraEnabled
    public static String insertRecords(List<Object> raws, String objectType, String sObjectType, String recordTypeId) {

        Map<String, String> mappings = new Map<String, String> ();
        for (ExcelToRecords_FieldMapping__mdt mapping : [SELECT ExcelColumn__c, SalesforceField__c
                                                         FROM ExcelToRecords_FieldMapping__mdt
                                                         WHERE Object__r.Label = :objectType]) {
            mappings.put(mapping.ExcelColumn__c, mapping.SalesforceField__c);
        }

        Map<String, Object> columns = new Map<String, Object> ();
        Map<Object, Object> rawMapForKeys = (Map<Object,Object>)raws[0];
        for (Object key : rawMapForKeys.keySet()) {
            columns.put((String)key, key);
        }

        Map<String, String> fieldsType = new Map<String, String> ();
        Schema.DescribeSObjectResult describeResult = Schema.getGlobalDescribe().get(sObjectType).getDescribe();
        for (String column : columns.keySet()) {
            if (!mappings.isEmpty() && !String.isBlank(mappings.get(column))) {
                fieldsType.put(mappings.get(column), String.valueOf(describeResult.fields.getMap().get(mappings.get(column)).getDescribe().getType()));
            }
        }

        List<SObject> records = new List<SObject> ();
        for (Object raw : raws) {
            SObject record = Schema.getGlobalDescribe().get(sObjectType).newSObject();
            Map<Object, Object> rawMap = (Map<Object, Object>)raw;
            if (!String.isBlank(recordTypeId)) {
                record.put('RecordTypeId', recordTypeId);
            }
            for (String column : columns.keySet()) {
                if (!mappings.isEmpty() && !String.isBlank(mappings.get(column))) {
                    String fieldType = fieldsType.get(mappings.get(column));
                    switch on fieldType {
                        when 'STRING' {
                            record.put(mappings.get(column), String.valueOf(rawMap.get(columns.get(column))));
                        }
                        when 'EMAIL' {
                            record.put(mappings.get(column), String.valueOf(rawMap.get(columns.get(column))));
                        }
                        when 'PHONE' {
                            record.put(mappings.get(column), String.valueOf(rawMap.get(columns.get(column))));
                        }
                        when 'PICKLIST' {
                            record.put(mappings.get(column), String.valueOf(rawMap.get(columns.get(column))));
                        }
                        when 'TEXTAREA' {
                            record.put(mappings.get(column), String.valueOf(rawMap.get(columns.get(column))));
                        }
                        when 'URL' {
                            record.put(mappings.get(column), String.valueOf(rawMap.get(columns.get(column))));
                        }
                        when 'BOOLEAN' {
                            record.put(mappings.get(column), Boolean.valueOf(rawMap.get(columns.get(column))));
                        }
                        when 'INTEGER' {
                            record.put(mappings.get(column), Integer.valueOf(rawMap.get(columns.get(column))));
                        }
                        when 'DOUBLE' {
                            record.put(mappings.get(column), Double.valueOf(rawMap.get(columns.get(column))));
                        }
                        when 'PERCENT' {
                            record.put(mappings.get(column), Double.valueOf(rawMap.get(columns.get(column))));
                        }
                        when 'CURRENCY' {
                            record.put(mappings.get(column), (Decimal)rawMap.get(columns.get(column)));
                        }
                        when 'DATETIME' {
                            record.put(mappings.get(column), Datetime.parse(String.valueOf(rawMap.get(columns.get(column)))));
                        }
                        when 'DATE' {
                            record.put(mappings.get(column), Date.parse(String.valueOf(rawMap.get(columns.get(column)))));
                        }
                    }
                }
            }
            records.add(record);
        }
        insert records;
        
        return records.size() + ' records inserted';

    }
    
}