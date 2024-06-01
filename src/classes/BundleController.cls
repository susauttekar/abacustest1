public with sharing class BundleController {
    @AuraEnabled(cacheable=true)
    public static List<Bundle__c> getBundles() {
        return [SELECT Id, Name FROM Bundle__c];
    }

    @AuraEnabled(cacheable=true)
    public static List<Product2> getProductsByBundle(Id bundleId) {
        List<Product_Bundle_Junction__c> pbjList = [SELECT ID,Bundle__c,Product__c FROM Product_Bundle_Junction__c
                                                    WHERE Bundle__c = :bundleId];
         List<String> productIds = new List<String>();                                           
         for(Product_Bundle_Junction__c pb : pbjList)     {
                productIds.add(pb.Product__c);
         }                                      
        List<Product2> products = [SELECT ID,NAme,ProductCode FROM Product2 WHERE Id IN :productIds];
        return products;                                            
       // return [SELECT Id, Name, Price__c FROM Product__c WHERE Bundle__c = :bundleId];
    }
}