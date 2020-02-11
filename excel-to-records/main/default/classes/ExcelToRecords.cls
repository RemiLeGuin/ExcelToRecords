public with sharing class ExcelToRecords {

    @AuraEnabled(cacheable = true)
    public static String insertRecords(List<Object> jsonRaws) {
        System.debug(jsonRaws);
        return null;
    }
    
}