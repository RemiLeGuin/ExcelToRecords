public with sharing class ExcelToRecords {

    @AuraEnabled
    public static String insertRecords(List<Object> raws, String sObjectType) {

        Map<String, Object> keys = new Map<String, Object> ();
        Map<Object, Object> rawMapForKeys = (Map<Object,Object>)raws[0];
        for (Object key : rawMapForKeys.keySet()) {
            keys.put((String)key, key);
        }

        Map<String, String> fieldsType = new Map<String, String> ();
        Schema.DescribeSObjectResult describeResult = Schema.getGlobalDescribe().get(sObjectType).getDescribe();
        for (String fieldName : keys.keySet()) {
            fieldsType.put(fieldName, String.valueOf(describeResult.fields.getMap().get(fieldName).getDescribe().getType()));
        }

        List<SObject> records = new List<SObject> ();
        for (Object raw : raws) {
            SObject record = Schema.getGlobalDescribe().get(sObjectType).newSObject();
            Map<Object, Object> rawMap = (Map<Object, Object>)raw;
            for (String fieldName : keys.keySet()) {
                String fieldType = fieldsType.get(fieldName);
                switch on fieldType {
                    when 'STRING' {
                        record.put(fieldName, String.valueOf(rawMap.get(keys.get(fieldName))));
                    }
                    when 'EMAIL' {
                        record.put(fieldName, String.valueOf(rawMap.get(keys.get(fieldName))));
                    }
                    when 'PHONE' {
                        record.put(fieldName, String.valueOf(rawMap.get(keys.get(fieldName))));
                    }
                    when 'PICKLIST' {
                        record.put(fieldName, String.valueOf(rawMap.get(keys.get(fieldName))));
                    }
                    when 'TEXTAREA' {
                        record.put(fieldName, String.valueOf(rawMap.get(keys.get(fieldName))));
                    }
                    when 'URL' {
                        record.put(fieldName, String.valueOf(rawMap.get(keys.get(fieldName))));
                    }
                    when 'BOOLEAN' {
                        record.put(fieldName, Boolean.valueOf(rawMap.get(keys.get(fieldName))));
                    }
                    when 'INTEGER' {
                        record.put(fieldName, Integer.valueOf(rawMap.get(keys.get(fieldName))));
                    }
                    when 'DOUBLE' {
                        record.put(fieldName, Double.valueOf(rawMap.get(keys.get(fieldName))));
                    }
                    when 'PERCENT' {
                        record.put(fieldName, Double.valueOf(rawMap.get(keys.get(fieldName))));
                    }
                    when 'CURRENCY' {
                        record.put(fieldName, (Decimal)rawMap.get(keys.get(fieldName)));
                    }
                    when 'DATETIME' {
                        record.put(fieldName, Datetime.parse(String.valueOf(rawMap.get(keys.get(fieldName)))));
                    }
                    when 'DATE' {
                        record.put(fieldName, Date.parse(String.valueOf(rawMap.get(keys.get(fieldName)))));
                    }
                }
            }
            records.add(record);
        }
        insert records;
        
        return records.size() + ' records inserted';

    }
    
}