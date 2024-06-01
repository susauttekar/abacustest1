trigger IndicativePricingTrigger on Indicative_Pricing__c (before insert) {
	List<Id> productIds = new List<Id>();
	List<Id> opportunityIds = new List<Id>();

	for(Indicative_Pricing__c ip : Trigger.new) {
		productIds.add(ip.Product__c);
		opportunityIds.add(ip.Opportunity__c);
	}

	Map<Id, Opportunity> mOpps = new Map<Id, Opportunity>([Select Pricebook2.Id from Opportunity where Id in :opportunityIds]);
	List<Id> pricebookIds = new List<Id>();
	for(Opportunity o : mOpps.values()) {
		pricebookIds.add(o.Pricebook2.Id);
	}

	List<PricebookEntry> lpbe = [Select UnitPrice, Product2Id, Pricebook2Id from PricebookEntry where Product2Id in :productIds and Pricebook2Id in :pricebookIds];
	for(Indicative_Pricing__c ip : Trigger.new) {
		Opportunity opp = mOpps.get(ip.Opportunity__c);
		for(PricebookEntry pbe : lpbe) {
			if(pbe.Product2Id == ip.Product__c && pbe.Pricebook2Id == opp.Pricebook2.Id) {
				ip.Unit_Price__c = pbe.UnitPrice;
				break;
			}
		}		
	}

}