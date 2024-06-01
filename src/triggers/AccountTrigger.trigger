trigger AccountTrigger on Account (after insert, after update) {
    List<Account> accountsToCalculateAUM = new List<Account>();
	for(Account acc : Trigger.new) {
        if(String.isNotBlank(acc.EIN__c) && !System.isBatch()){
            if(Trigger.isInsert){
                accountsToCalculateAUM.add(acc);
            }else if(Trigger.isUpdate && acc.EIN__c != Trigger.oldMap.get(acc.Id).EIN__c){
                accountsToCalculateAUM.add(acc);
            }
        }
	}
    if(accountsToCalculateAUM.size() > 0){
        WhaleWisdomUtility.updateAUMFromTrigger(accountsToCalculateAUM);
    }
}