
function promiseResponse(request) {

    var crmclient = require('./ZCRMRestClient');
    var OAuth = require('./OAuth');
   
    return new Promise(function(resolve,reject){
    var mysql_util = require(crmclient.getMySQLModule());

    mysql_util.getOAuthTokens(crmclient.getUserIdentifier()).then(function(response){

    var date = new Date();
    var current_time = date.getTime();
    
    var expires_in = response[0].expirytime;
    var refresh_token = response[0].refreshtoken;

    if(current_time > expires_in){

        var config = crmclient.getConfig_refresh(refresh_token)
        
        new OAuth(config,'refresh_access_token');
        var url = OAuth.constructurl('generate_token');

        OAuth.generateTokens(url).then(function(response){
        var result_obj = crmclient.parseAndConstructObject(response);

         mysql_util.updateOAuthTokens(result_obj).then(function(response){

         makeapicall(request).then(function(response){

         resolve(response);
         
        })
    });
    })
    }

    else{

        makeapicall(request).then(function(response){

         resolve(response);

        })
    }
    })
    })
}


function makeapicall(request){

    return new Promise(function(resolve,reject){

     var crmclient = require('./ZCRMRestClient');   
     var httpclient = require('request');
     var OAuth = require('./OAuth');
     var mysql_util = require(crmclient.getMySQLModule());
     var qs = require('querystring');
   
    mysql_util.getOAuthTokens(crmclient.getUserIdentifier()).then(function(result_obj){
    var access_token = result_obj[0].accesstoken;
    var baseUrl = "https://"+crmclient.getAPIURL()+"/crm/"+crmclient.getVersion() +"/"+ request.url;
    if (request.params) 
        {
            baseUrl = baseUrl + '?' + request.params;
        }


        var api_headers = {};
        var encoding ="utf8";
        var req_body = null;
        var formData = null;

        if (request.download_file){
            encoding = "binary";//No I18N
        }

       var form_Data = null;

        if (request.x_file_content) {

            var FormData = require('form-data');
            form_Data = new FormData();        
            form_Data.append('file', request.x_file_content);//No I18N           
            req_body = form_Data;            
            api_headers = form_Data.getHeaders();          
           
        }
        else{

            req_body = request.body || null;
    
        }
        
        if(request.headers){

            var header_keys = Object.keys(request.headers);
            
            for(i in header_keys){

                api_headers[header_keys[i]] = request.headers[header_keys[i]];
            }
        }

        api_headers.Authorization = 'Zoho-oauthtoken '+access_token;
        api_headers["User-Agent"] = 'Zoho CRM Node SDK';

        

        
    httpclient({

        uri : baseUrl,
        method : request.type,
        headers : api_headers,
        body:req_body,
        encoding: encoding

    },function(error,response,body){

        if(error){

                resolve(error);
            }

        if(response.statusCode == 204){

             var respObj = {
                            "message" : "no data", //No I18N
                            "status_code" : "204" //No I18N
                        }
                        resolve(JSON.stringify(respObj));


        }else{

            
            if (request.download_file){

                            var filename;
                            var disposition =response.headers["content-disposition"];//No I18N
                            if (disposition && disposition.indexOf('attachment') !== -1) {
                                var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                                var matches = filenameRegex.exec(disposition);
                                if (matches != null && matches[1]) { 
                                  filename = matches[1].replace(/['"]/g, '');
                                    filename = filename.replace('UTF-8','');
                                }
                            }

                            response.filename = filename;
                            resolve(response);
                            
                        }
                        else{   
                         resolve(response);
                        }
                        
    }
    });

    })
})
    
}


function createParams(parameters)
{
   
    var params, key;
    for (key in parameters)
    {
        if (parameters.hasOwnProperty(key)) {
            if (params)
            {
                params = params + key + '=' + parameters[key] + '&';
            }
            else
            {
                params = key + '=' + parameters[key] + '&';
            }
        }
    }
   
    return params;
}

function constructRequestDetails(input, url, type, isModuleParam)
{

    var requestDetails = {};

    requestDetails.type = type;

    if (input != undefined)
    {
        if (input.id)
        {
            url = url.replace("{id}", input.id);
        }
        else
        {
            url = url.replace("/{id}", "");
        }
        if(input.api_name){

            url = url.replace("{api_name}",input.api_name);


            var params = {};
            if(input.params){
                
                params = input.params;
            }
            params.auth_type = "oauth";
            input.params = params;
        }
        else{

            url = url.replace("/{api_name}","");

        }
        if (input.params)
        {
            requestDetails.params = createParams(input.params) + (input.module && isModuleParam ? "module=" + input.module : "");//No I18N
        }
        if (!requestDetails.params && isModuleParam)
        {
            requestDetails.params = "module=" + input.module;//No I18N
        }
        if (input.body && (type == HTTP_METHODS.POST || type == HTTP_METHODS.PUT))
        {
            requestDetails.body = JSON.stringify(input.body);
        }
        if (input.x_file_content)
        {
            requestDetails.x_file_content = input.x_file_content;   
        }
        if (input.download_file)
        {
            requestDetails.download_file = input.download_file;  
        }
        if(input.headers){

            requestDetails.headers = input.headers;
        }
    }
    requestDetails.url = url;

    return requestDetails;

   
}

module.exports  = {

    constructRequestDetails : constructRequestDetails,
    promiseResponse : promiseResponse,

}