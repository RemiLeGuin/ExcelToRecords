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
    public static void insertRecords(List<Object> raws, String objectType, String sObjectType, String recordTypeId) {
        Map<String, String> mappings = getMappings(objectType);
        Map<Object, Object> firstRaw = (Map<Object,Object>)raws[0];
        Map<String, Object> columns = getColumns(firstRaw.keySet());
        Map<String, String> fieldsType = getFieldType(sObjectType, mappings, columns);
        System.enqueueJob(new ExcelToRecords_RecordsInsertion(raws, sObjectType, objectType, recordTypeId, mappings, columns, fieldsType));
    }

    private static Map<String, String> getMappings(String objectType) {
        Map<String, String> mappings = new Map<String, String> ();
        for (ExcelToRecords_FieldMapping__mdt mapping : [SELECT ExcelColumn__c, SalesforceField__c
                                                         FROM ExcelToRecords_FieldMapping__mdt
                                                         WHERE Object__r.Label = :objectType]) {
            mappings.put(mapping.ExcelColumn__c, mapping.SalesforceField__c);
        }
        return mappings;
    }

    private static Map<String, Object> getColumns(Set<Object> columnsAsObjects) {
        Map<String, Object> columns = new Map<String, Object> ();
        for (Object key : columnsAsObjects) {
            columns.put((String)key, key);
        }
        return columns;
    }

    private static Map<String, String> getFieldType(String sObjectType, Map<String, String> mappings, Map<String, Object> columns) {
        Map<String, String> fieldsType = new Map<String, String> ();
        Schema.DescribeSObjectResult describeResult = Schema.getGlobalDescribe().get(sObjectType).getDescribe();
        for (String column : columns.keySet()) {
            if (!mappings.isEmpty() && !String.isBlank(mappings.get(column))) {
                fieldsType.put(mappings.get(column), String.valueOf(describeResult.fields.getMap().get(mappings.get(column)).getDescribe().getType()));
            }
        }
        return fieldsType;
    }
    
}