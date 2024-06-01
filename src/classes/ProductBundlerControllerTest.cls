@isTest(SeeAllData=true)
public with sharing class ProductBundlerControllerTest {
  @IsTest(SeeAllData=true)
  static void getLineItems() {
    Opportunity[] oppWithLineItems = [
      SELECT Id
      FROM Opportunity
      WHERE Id IN (SELECT OpportunityId FROM OpportunityLineItem)
    ];
    Test.startTest();
    List<OpportunityLineItem> lineItems = ProductBundlerController.getLineItems(
      oppWithLineItems[0].Id
    );
    Test.stopTest();
    System.assertEquals(oppWithLineItems[0].Id, lineItems[0].OpportunityId);
  }
  @IsTest(SeeAllData=true)
  static void getBundles() {
    Pricebook2[] pb = [
      SELECT Id
      FROM Pricebook2
      WHERE Id IN (SELECT Pricebook2Id FROM PricebookEntry)
      LIMIT 1
    ];
    Bundle__c bundle = new Bundle__c(Name = 'Bundle', Price_Book__c = pb[0].Id);
    insert bundle;
    PricebookEntry[] products = [
      SELECT Id, Product2Id, Pricebook2Id
      FROM PricebookEntry
      WHERE Pricebook2Id = :pb[0].Id
      LIMIT 1
    ];
    Product_Bundle_Junction__c junction = new Product_Bundle_Junction__c(
      Bundle__c = bundle.Id,
      Product__c = products[0].Product2Id
    );

    insert junction;

    Test.startTest();
    List<ProductBundlerController.Bundle> bundles = ProductBundlerController.getBundles(
      'Bundle',
      pb[0].Id
    );
    Test.stopTest();
    System.assertEquals(1, bundles.size());
  }
  @IsTest
  static void getPicklistValues() {
    ProductBundlerController.PicklistOption[] picklistOptions = ProductBundlerController.getPicklistOptions(
      'OpportunityLineItem',
      'Sales_Price_Term__c'
    );
    System.assertNotEquals(0, picklistOptions.size());
  }
}