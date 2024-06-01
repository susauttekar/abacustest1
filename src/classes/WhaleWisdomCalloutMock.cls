global with sharing class WhaleWisdomCalloutMock implements HttpCalloutMock {
    global static Boolean isSuccess = true;
    global HttpResponse respond(HttpRequest req) {
        HttpResponse response = new HttpResponse();
        String body;
        if(isSuccess){
            response.setStatusCode(200);
            if(req.getEndpoint().contains('holdings')){
                body = '{"results": [{"filer_name": "BERKSHIRE HATHAWAY INC","filer_id": 349,"records": [{"date_last_filed": "2022-11-14","quarter": "2022-09-30","quarter_id": 87,"holdings": [{"current_mv": 123661679000.0}]}]}]}';
            } else if(req.getEndpoint().contains('filer_lookup')){
                body = '{"filers":[{"id": 1335}]}';
            }
        }
        response.setBody(body);
        return response;
    }
}