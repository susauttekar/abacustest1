@isTest(SeeAllData=true)
private class IndicativePricingTriggerTest {
	
	@isTest static void testTrigger() {
		// create test account
		Account a = new Account (
			Name = 'Test Account', 
			Phone = '707-555-1212');
		insert a;

		Pricebook2 pb2 = new Pricebook2 ( Id = Test.getStandardPricebookId() );

		// create test opportunity
		Opportunity o = new Opportunity(
			Account = a, 
			Name = 'test opportunity', 
			CloseDate = Date.today().addDays(1), 
			StageName = 'Verbal', 
			Pricebook2 = pb2);
		insert o;

		// create a test product
		Product2 prod = new Product2(
			Name = 'Laptop X200', 
      Family = 'Hardware');
    insert prod;

    // create test pricebook entry
    PricebookEntry standardPrice = new PricebookEntry(
    	Pricebook2Id = pb2.Id, 
    	Product2Id = prod.Id,
      UnitPrice = 10000, 
      IsActive = true);
    insert standardPrice;

    Test.startTest();

    // create indicative pricing record and insert it
    Indicative_Pricing__c ip = new Indicative_Pricing__c(
    	Opportunity__c = o.Id,
    	Product__c = prod.Id,
    	Quantity__c = 1
    );
    insert ip;

    // re-query for the indicative pricing record
    ip = [Select Unit_Price__c from Indicative_Pricing__c where Id = :ip.Id];

    // assert that its unitprice is equal to the unitprice of the pricebook entry
    //System.Assert(ip.Unit_Price__c == 10000);

    Test.stopTest();
	}
	
}