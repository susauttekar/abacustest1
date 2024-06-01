public with sharing class ProductBundlerController {
  @AuraEnabled(cacheable=true)
  public static OpportunityLineItem[] getLineItems(String recordId) {
    try {
      return [
        SELECT
          Id,
          Name,
          OpportunityId,
          PricebookEntryId,
          Product2Id,
          Quantity,
          Bundle__c,
          Bundle__r.Name,
          Setup_Fee_Product__c,
          Set_Up_Fee_Product_Discount__c,
          UnitPrice,
          Sales_Price_Discount__c,
          Sales_Price_Term__c,
          Comment__c
        FROM OpportunityLineItem
        WHERE OpportunityId = :recordId
      ];
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }
  @AuraEnabled(cacheable=true)
  public static Bundle[] getBundles(String bundleName, String priceBookId) {
    try {
      Bundle[] bundles = new List<Bundle>{};
      if (String.isEmpty(priceBookId) || priceBookId == null) {
        return bundles;
      }
      List<Bundle__c> bundleList = new List<Bundle__c>{};
      List<Product_Bundle_Junction__c> bundleJunctionList = new List<Product_Bundle_Junction__c>{};
      List<String> bundleIds = new List<String>{};

      // Query Builder
      String[] queryCols = new List<String>{ 'Id', 'Name', 'Price_Book__c' };
      String[] subQueryCols = new List<String>{
        'Product__r.Id',
        'Product__r.Name',
        'Product__r.Description',
        'Product__r.Family',
        'Product__r.Additional_Product_Description__c',
        'Product__r.Sales_Price_Term__c',
        'Order__c',
        'Name'
      };
      String junctionQuery = subQueryCols.size() > 0
        ? ', (SELECT ' +
          String.join(subQueryCols, ',') +
          ' FROM Product_Bundle_Junction__r ORDER BY Order__c) '
        : '';
      String query =
        'SELECT ' +
        String.join(queryCols, ',') +
        junctionQuery +
        'FROM Bundle__c';
      String[] filters = new List<String>{};
      String searchKey = '';
      Map<String, Product2> productMap = new Map<String, Product2>{};
      if (String.isNotEmpty(bundleName) && String.isNotBlank(bundleName)) {
        searchKey = '%' + bundleName + '%';
        filters.add('Name LIKE :searchKey');
      }
      if (String.isNotEmpty(priceBookId) && String.isNotBlank(priceBookId)) {
        filters.add('Price_book__c = :priceBookId');
      }
      if (filters.size() > 0) {
        query += ' WHERE ' + String.join(filters, ' AND ');
      }
      System.debug('query' + query);
      bundleList = Database.query(query);
      PricebookEntry[] productPricebookEntries = [
        SELECT Id, Product2Id, Set_Up_Fee__c, UnitPrice
        FROM PricebookEntry
        WHERE Pricebook2Id = :priceBookId
      ];
      Map<String, PricebookEntry> priceBookEntriesMap = new Map<String, PricebookEntry>{};

      for (PricebookEntry entry : productPricebookEntries) {
        if (!priceBookEntriesMap.containsKey(entry.Product2Id)) {
          priceBookEntriesMap.put(entry.Product2Id, entry);
        }
      }
      // Get all the product ids
      for (Bundle__c bundle : bundleList) {
        Bundle b = new Bundle(
          bundle.Id,
          bundle.Name,
          new List<BundleProduct>{}
        );
        for (
          Product_Bundle_Junction__c pbj : bundle.Product_Bundle_Junction__r
        ) {
          PricebookEntry pricebookEntry = priceBookEntriesMap.get(
            pbj.Product__c
          );
          if (pricebookEntry != null) {
            BundleProduct oli = new BundleProduct();
            oli.key = pbj.Product__c + '|' + bundle.Id;
            oli.bundleName = bundle.Name;
            oli.Product2Id = pbj.Product__c;
            oli.PricebookEntryId = pricebookEntry.Id;
            oli.Setup_Fee_Product = pricebookEntry.Set_Up_Fee__c;
            oli.UnitPrice = pricebookEntry.UnitPrice;
            oli.additionalDescription = pbj.Product__r.Additional_Product_Description__c;
            oli.Name = pbj.Product__r.Name;
            oli.Family = pbj.Product__r.Family;
            oli.Bundle = bundle.Id;
            oli.Quantity = 1;
            oli.Description = pbj.Product__r.Description;
            oli.SalesPriceTerm = pbj.Product__r.Sales_Price_Term__c;
            b.products.add(oli);
          }
        }
        bundles.add(b);
      }
      return bundles;
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }
  public class BundleProduct {
    @AuraEnabled
    public String key { get; set; }
    @AuraEnabled
    public String bundleName { get; set; }
    @AuraEnabled
    public String Name { get; set; }
    @AuraEnabled
    public String Family { get; set; }
    @AuraEnabled
    public String Description { get; set; }
    @AuraEnabled
    public String Bundle { get; set; }
    @AuraEnabled
    public Integer Quantity { get; set; }
    @AuraEnabled
    public String Product2Id { get; set; }
    @AuraEnabled
    public String PricebookEntryId { get; set; }
    @AuraEnabled
    public Decimal Setup_Fee_Product { get; set; }
    @AuraEnabled
    public String AdditionalDescription { get; set; }
    @AuraEnabled
    public Decimal UnitPrice { get; set; }
    @AuraEnabled
    public String SalesPriceTerm { get; set; }
  }
  public class Bundle {
    public Bundle(String id, String name, List<BundleProduct> products) {
      this.Id = id;
      this.Name = name;
      this.products = products;
    }
    @AuraEnabled
    public String Id { get; set; }
    @AuraEnabled
    public String Name { get; set; }
    @AuraEnabled
    public List<BundleProduct> products { get; set; }
  }
  @AuraEnabled(cacheable=true)
  public static PicklistOption[] getPicklistOptions(
    String objectName,
    String fieldName
  ) {
    try {
      PicklistOption[] options = new List<PicklistOption>{};
      Schema.DescribeFieldResult fieldResult = Schema.getGlobalDescribe()
        .get(objectName)
        .getDescribe()
        .fields
        .getMap()
        .get(fieldName)
        .getDescribe();
      List<Schema.PicklistEntry> ple = fieldResult.getPicklistValues();
      for (Schema.PicklistEntry f : ple) {
        PicklistOption option = new PicklistOption();
        option.label = f.getLabel();
        option.value = f.getValue();
        options.add(option);
      }

      return options;
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }
  public class PicklistOption {
    @AuraEnabled
    public String label { get; set; }
    @AuraEnabled
    public String value { get; set; }
  }
}