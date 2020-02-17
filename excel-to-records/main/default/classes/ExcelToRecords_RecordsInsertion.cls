public with sharing class ExcelToRecords_RecordsInsertion implements Queueable {

    private List<Object> raws;
    private String sObjectType;
    private String objectType;
    private Id recordTypeId;
    private Map<String, String> mappings;
    private Map<String, Object> columns;
    private Map<String, String> fieldsType;

    public ExcelToRecords_RecordsInsertion() {}

    public ExcelToRecords_RecordsInsertion(List<Object> raws,
                                           String sObjectType,
                                           String objectType,
                                           Id recordTypeId,
                                           Map<String, String> mappings,
                                           Map<String, Object> columns,
                                           Map<String, String> fieldsType) {
        this.raws = raws;
        this.sObjectType = sObjectType;
        this.objectType = objectType;
        this.recordTypeId = recordTypeId;
        this.mappings = mappings;
        this.columns = columns;
        this.fieldsType = fieldsType;
    }

    public void execute(QueueableContext context) {
        insertRecords(raws, sObjectType, objectType, recordTypeId, mappings, columns, fieldsType);
    }

    public static String insertRecords(List<Object> raws,
                                       String sObjectType,
                                       String objectType,
                                       Id recordTypeId,
                                       Map<String, String> mappings,
                                       Map<String, Object> columns,
                                       Map<String, String> fieldsType) {
        List<SObject> records = new List<SObject> ();
        for (Object raw : raws) {
            SObject record = Schema.getGlobalDescribe().get(sObjectType).newSObject();
            if (!String.isBlank(recordTypeId)) {
                record.put('RecordTypeId', recordTypeId);
            }
            Map<Object, Object> rawMap = (Map<Object, Object>)raw;
            for (String column : columns.keySet()) {
                fillColumn(record, mappings, columns, column, rawMap, fieldsType);
            }
            records.add(record);
        }
        try {
            insert records;
            ExcelToRecords_AsynchronousDml__e asyncDml = new ExcelToRecords_AsynchronousDml__e();
            asyncDml.SObjectType__c = sObjectType;
            asyncDml.ObjectType__c = objectType;
            asyncDml.Operation__c = 'Insert';
            asyncDml.Status__c = 'Success';
            asyncDml.NumberOfRecords__c = records.size();
            asyncDml.Successful__c = records.size();
            asyncDml.Failed__c = 0;
            EventBus.publish(asyncDml);
            return records.size() + ' records inserted';
        }
        catch(Exception e) {
            ExcelToRecords_AsynchronousDml__e asyncDml = new ExcelToRecords_AsynchronousDml__e();
            asyncDml.SObjectType__c = sObjectType;
            asyncDml.ObjectType__c = objectType;
            asyncDml.Operation__c = 'Insert';
            asyncDml.Status__c = 'Fail';
            asyncDml.NumberOfRecords__c = records.size();
            asyncDml.Successful__c = 0;
            asyncDml.Failed__c = records.size();
            asyncDml.Message__c = e.getMessage();
            EventBus.publish(asyncDml);
            return e.getMessage();
        }
    }

    private static void fillColumn(SObject record,
                                   Map<String, String> mappings,
                                   Map<String, Object> columns,
                                   String column,
                                   Map<Object, Object> rawMap,
                                   Map<String, String> fieldsType) {
        if (!mappings.isEmpty() && !String.isBlank(mappings.get(column))) {
            switch on fieldsType.get(mappings.get(column)) {
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

}