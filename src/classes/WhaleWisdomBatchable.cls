global class WhaleWisdomBatchable implements Database.Batchable<sObject>, Database.AllowsCallouts, Database.Stateful {
    global List<Account> accounts = new List<Account>();
    global Boolean isInvocable;
    global List<Account> accountsToUpdate = new List<Account>();
    // using batch to avoid limit of 100 callouts
    global List<Account> start(Database.BatchableContext BC){
        if(isInvocable){
            return [SELECT Id, AUM__c, EIN__c FROM Account WHERE EIN__c != null];
        }else{
            return accounts;
        }
    }

    global void execute(Database.BatchableContext BC, List<Account> accounts){
        // for(Account acc : WhaleWisdomUtility.updateAUM(accounts)){
        //     accountsToUpdate.add(acc);
        // }
        WhaleWisdomUtility.updateAUM(accounts);
    }

    global void finish(Database.BatchableContext BC){
        // System.debug('updating accounts: ' + accountsToUpdate.size());
        // update accountsToUpdate;
    }
}