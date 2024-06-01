@IsTest
private with sharing class WhaleWisdomUtilityTest {
    @TestSetup
    private static void makeData(){
        WhaleWisdom_Integration__c settings = new WhaleWisdom_Integration__c();
        settings.Base_URL__c = 'https://test.com';
        settings.Shared_Access_Key__c = '12345';
        settings.Secret_Access_Key__c = '123';
        insert settings;
    }

    @IsTest
    private static void getAUMInsertTest() {
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new WhaleWisdomCalloutMock());
        Account acc1 = new Account();
        acc1.Name = 'test1';
        acc1.EIN__c = '20-3760303';
        
        Account acc2 = new Account();
        acc2.Name = 'test2';
        
        Account acc3 = new Account();
        acc3.Name = 'test3';
        acc3.EIN__c = '20-3760403';

        insert new List<Account>{acc1, acc2, acc3};
        Test.stopTest();

        List<Account> accounts = [SELECT Id, AUM__c FROM Account];
        System.assertEquals(3, accounts.size());
        Decimal expectedAUM = 123661679000.0 / 1000000;
        Integer numAccountsWithAUM = 0;
        for(Account acc : accounts){
            if(acc.AUM__c != null){
                numAccountsWithAUM ++;
                System.assertEquals(expectedAUM, acc.AUM__c);
            }
        }
        System.assertEquals(2, numAccountsWithAUM);
    }

    @IsTest
    private static void getAUMUpdateTest() {
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new WhaleWisdomCalloutMock());
        Account acc1 = new Account();
        acc1.Name = 'test1';
        acc1.EIN__c = '20-3760303';
        
        Account acc2 = new Account();
        acc2.Name = 'test2';
        
        Account acc3 = new Account();
        acc3.Name = 'test3';
        insert new List<Account>{acc1, acc2, acc3};

        acc1.EIN__c = '123-321';
        acc2.EIN__c = '123-421';
        acc3.EIN__c = '123-521';
        update new List<Account>{acc1, acc2, acc3};

        Test.stopTest();

        List<Account> accounts = [SELECT Id, AUM__c FROM Account];
        System.assertEquals(3, accounts.size());
        Decimal expectedAUM = 123661679000.0 / 1000000;
        Integer numAccountsWithAUM = 0;
        for(Account acc : accounts){
            if(acc.AUM__c != null){
                numAccountsWithAUM ++;
                System.assertEquals(expectedAUM, acc.AUM__c);
            }
        }
        System.assertEquals(3, numAccountsWithAUM);
    }

    @IsTest
    private static void getAUMInvocableTest() {
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new WhaleWisdomCalloutMock());
        Account acc1 = new Account();
        acc1.Name = 'test1';
        acc1.EIN__c = '20-3760303';
        
        Account acc2 = new Account();
        acc2.Name = 'test2';
        
        Account acc3 = new Account();
        acc3.Name = 'test3';
        insert new List<Account>{acc1, acc2, acc3};

        WhaleWisdomUtility.updateAUMInvocable();
        Test.stopTest();

        List<Account> accounts = [SELECT Id, AUM__c FROM Account];
        System.assertEquals(3, accounts.size());
        Decimal expectedAUM = 123661679000.0 / 1000000;
        Integer numAccountsWithAUM = 0;
        for(Account acc : accounts){
            if(acc.AUM__c != null){
                numAccountsWithAUM ++;
                System.assertEquals(expectedAUM, acc.AUM__c);
            }
        }
        System.assertEquals(1, numAccountsWithAUM);
    }

    @IsTest
    private static void getAUMBulkTest() {
        List<Account> accountsToInsert = new List<Account>();
        for (Integer i = 0; i < 5; i++) {
            Account acc = new Account();
            acc.Name = 'test' + String.valueOf(i);
            acc.EIN__c = '20-3760303' + String.valueOf(i);
            accountsToInsert.add(acc);
        }

        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new WhaleWisdomCalloutMock());
        insert accountsToInsert;
        Test.stopTest();

        List<Account> accounts = [SELECT Id, AUM__c FROM Account WHERE AUM__c != null];
        System.assertEquals(5, accounts.size());
    }
}