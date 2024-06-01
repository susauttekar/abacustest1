public with sharing class WhaleWisdomUtility {
    public static WhaleWisdom_Integration__c integrationData;

    @InvocableMethod(label='Get AUM From WhaleWisdom' description='Update the AUM field for all accounts that have an EIN' callout=true)
    public static void updateAUMInvocable() {
        WhaleWisdomBatchable batch = new WhaleWisdomBatchable();
        batch.isInvocable = true;
        Database.executeBatch(batch, 5);
    }

    public static void updateAUMFromTrigger(List<Account> accounts) {
        WhaleWisdomBatchable batch = new WhaleWisdomBatchable();
        batch.accounts = [SELECT Id, AUM__c, EIN__c FROM Account WHERE Id IN :accounts];
        batch.isInvocable = false;
        Database.executeBatch(batch, 5);
    }

    public static List<Account> updateAUM(List<Account> accounts){
        integrationData = WhaleWisdom_Integration__c.getOrgDefaults();
        for(Account acc : accounts){
            try{
                String irsNum = acc.EIN__c.remove('-').normalizeSpace();
                if(irsNum.endsWith(' ')){
                    irsNum = irsNum.removeEnd(' ');
                }
                System.debug('irsNum: ' + irsNum);
                String filerId;
                filerId = getFilerId(irsNum);
                HoldingsCalloutWrapper holdings = getHoldings(filerId);
                if(holdings.results.size() > 0){
                    if(holdings.results[0].records.size() > 0){
                        Decimal aum = 0;
                        for(HoldingsWrapper holding : holdings.results[0].records[0].holdings){
                            if(holding.current_mv != null){
                                aum += holding.current_mv;
                            }
                        }
                        // convert aum to millions
                        acc.AUM__c = aum / 1000000;
                        acc.AUM_Updated_by_WhaleWisdom__c = System.now();
                    }
                }
            }catch(Exception ex){
                System.debug('error: ' + ex.getMessage());
                continue;
            }
        }
        update accounts;
        return accounts;
    }

    @TestVisible
    private static String getFilerId(String irsNum) {
        // 043312097 is a valid test irsnum, 488510 is the filerid
        String args = '{"command":"filer_lookup","irs_number":"' + irsNum + '"}';
        String response = makeCallout(args);
        FilersCalloutWrapper data = (FilersCalloutWrapper) JSON.deserialize(response, FilersCalloutWrapper.class);
        System.debug('response data: ' + data);
        if(data.filers.size() > 0){
            return data.filers[0].id;
        }else{
            throw new WhaleWisdomException('No filer id found for ' + irsNum);
        }
    }

    @TestVisible
    private static HoldingsCalloutWrapper getHoldings(String filerId) {
        // to test, filer id 349 is berkshire
        String args = '{"command":"holdings","filer_ids":[' + filerId + '],"columns":[12]}';
        String response = makeCallout(args);
        HoldingsCalloutWrapper data = (HoldingsCalloutWrapper) JSON.deserialize(response, HoldingsCalloutWrapper.class);
        System.debug('response data: ' + data);
        return data;
    }

    @TestVisible
    private static String makeCallout(String args){
        String url = getURL(args);
        HttpResponse resp = sendRequest(url, 'GET');
        if(resp.getStatusCode() < 400){
            return resp.getBody();
        }else{
            return null;
        }
    }

    @TestVisible
    private static String getURL(String args){
        String url = integrationData.Base_URL__c;
        String timestamp = Datetime.now().formatGMT('yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\'');
        String encodedSig = createSignature(args, timestamp);
        url += '.json?args=' + args + '&api_shared_key=' + EncodingUtil.urlEncode(integrationData.Shared_Access_Key__c, 'UTF-8') + '&api_sig=' + encodedSig + '&timestamp=' + EncodingUtil.urlEncode(timestamp, 'UTF-8');
        return url;
    }

    @TestVisible
    private static String createSignature(String args, String timestamp){
        Blob signature = Crypto.generateMac('hmacSHA1', Blob.valueOf(args + '\n' + timestamp), Blob.valueOf(integrationData.Secret_Access_Key__c));
        return EncodingUtil.base64Encode(signature);
    }

    @TestVisible
    private static HttpResponse sendRequest(String url, String method){
        Http http = new Http();
        HttpRequest req = new HttpRequest();
        req.setEndpoint(url);
        req.setMethod(method);
        HttpResponse resp = http.send(req);
        System.debug('response: ' + resp.getBody());
        System.debug('response status: ' + resp.getStatusCode());
        return resp;
    }

    public class HoldingsCalloutWrapper{
        List<ResultsWrapper> results;
    }
    public class ResultsWrapper{
        String filer_name;
        String filer_id;
        List<RecordsWrapper> records;
    }
    public class RecordsWrapper{
        String date_last_filed;
        String quarter;
        String quarter_id;
        List<HoldingsWrapper> holdings;
    }
    public class HoldingsWrapper{
        Decimal current_mv;
    }

    public class FilersCalloutWrapper{
        List<FilersWrapper> filers;
    }
    public class FilersWrapper{
        String id;
    }

    public class WhaleWisdomException extends Exception{}
}