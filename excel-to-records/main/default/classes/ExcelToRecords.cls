public with sharing class ExcelToRecords {

    @AuraEnabled
    public static String insertRecords(List<Object> raws) {
        Map<String, Object> keys = new Map<String, Object> ();
        Map<Object,Object> mapRaw = (Map<Object,Object>)raws[0];
        for (Object key : mapRaw.keySet()) {
            keys.put((String)key, key);
        }
        List<Lead> leads = new List<Lead> ();
        for (Object raw : raws) {
            Lead ld = new Lead();
            Map<Object, Object> lr = (Map<Object, Object>)raw;
            ld.LastName = (String)lr.get(keys.get('LastName'));
            ld.FirstName = (String)lr.get(keys.get('FirstName'));
            ld.Email = (String)lr.get(keys.get('Email'));
            ld.Phone = (String)lr.get(keys.get('Phone'));
            ld.Title = (String)lr.get(keys.get('Title'));
            ld.Company = (String)lr.get(keys.get('Company'));
            leads.add(ld);
        }
        insert leads;
        return leads.size() + ' leads inserted';
    }
    
}