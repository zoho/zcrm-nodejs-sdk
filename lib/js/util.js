
function promiseResponse(api_request) {
    var crmclient = require('./ZCRMRestClient');
    return new Promise(function(resolve,reject){
        var persistence_util = require(crmclient.getPersistenceHandler());
        if (!crmclient.getUserIdentifier()){
            throw new Error('Set user email id through config json or ZCRMRestClient!');
        }
        persistence_util.getOAuthTokens(crmclient.getUserIdentifier()).then(function(oauthtoken){
            if(!oauthtoken){
                throw new Error('No such user with email id ' +crmclient.getUserIdentifier() + " exists" );
            }
            var date = new Date();
            var expirytime = oauthtoken.expirytime;
            var current_time = date.getTime();
            if(expirytime - current_time > 15000 ){
                makeapicall(api_request,oauthtoken.accesstoken).then(function(api_response){
                    resolve(api_response);
                })
            }
            else{//refresh it
                var refresh_token = oauthtoken.refreshtoken;
                var user_identifier = oauthtoken.useridentifier
                crmclient.refresh_access_token(user_identifier,refresh_token).then(function(oauthtoken){
                    makeapicall(api_request,oauthtoken.accesstoken).then(function(api_response){
                        resolve(api_response);
                    })
                })
            }
        })
    })
}


function makeapicall(api_request,accesstoken){
    return new Promise(function(resolve,reject){
        var crmclient = require('./ZCRMRestClient');   
        var httpclient = require('request');
        var baseUrl = "https://"+crmclient.getAPIURL()+"/crm/"+crmclient.getVersion() +"/"+ api_request.url;
        if (api_request.params){
            baseUrl = baseUrl + '?' + api_request.params;
        }
        var api_headers = {};
        var encoding ="utf8";
        var req_body = null;
        if (api_request.download_file){
            encoding = "binary";//No I18N
        }
        var form_Data = null;
        if (api_request.x_file_content) {
            var FormData = require('form-data');
            form_Data = new FormData();        
            form_Data.append('file', request.x_file_content);//No I18N           
            req_body = form_Data;            
            api_headers = form_Data.getHeaders();          
        }
        else{
            req_body = api_request.body || null;
        }
        if(api_request.headers){
            var header_keys = Object.keys(api_request.headers);
            for(i in header_keys){
                api_headers[header_keys[i]] = api_request.headers[header_keys[i]];
            }
        }
        api_headers.Authorization = 'Zoho-oauthtoken '+accesstoken;
        api_headers["User-Agent"] = 'Zoho CRM Node SDK';
        httpclient({
            uri : baseUrl,
            method : api_request.type,
            headers : api_headers,
            body:req_body,
            encoding: encoding
        },function(error,api_response,body){
            if(error){
                    resolve(error);
                }
            if(api_response.statusCode == 204){
                var respObj = {
                                "message" : "no data", //No I18N
                                "status_code" : "204" //No I18N
                            }
                            resolve(JSON.stringify(respObj));
            }
            else{
                if (api_request.download_file){
                    var filename;
                    var disposition =api_response.headers["content-disposition"];//No I18N
                    if (disposition && disposition.indexOf('attachment') !== -1) {
                        var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                        var matches = filenameRegex.exec(disposition);
                        if (matches != null && matches[1]) { 
                        filename = matches[1].replace(/['"]/g, '');
                            filename = filename.replace('UTF-8','');
                        }
                    }
                    api_response.filename = filename;
                    resolve(api_response);
                }
                else{   
                    resolve(api_response);
                }
            }
        });
    })
}


function createParams(parameters){
    var params, key;
    for (key in parameters){
        if (parameters.hasOwnProperty(key)) {
            if (params){
                params = params + key + '=' + parameters[key] + '&';
            }
            else{
                params = key + '=' + parameters[key] + '&';
            }
        }
    }
    return params;
}

function constructRequestDetails(input, url, type, isModuleParam){
    var requestDetails = {};
    requestDetails.type = type;
    if (input != undefined){
        if (input.id){
            url = url.replace("{id}", input.id);
        }
        else{
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
        if (input.params){
            requestDetails.params = createParams(input.params) + (input.module && isModuleParam ? "module=" + input.module : "");//No I18N
        }
        if (!requestDetails.params && isModuleParam){
            requestDetails.params = "module=" + input.module;//No I18N
        }
        if (input.body && (type == HTTP_METHODS.POST || type == HTTP_METHODS.PUT)){
            requestDetails.body = JSON.stringify(input.body);
        }
        if (input.x_file_content){
            requestDetails.x_file_content = input.x_file_content;   
        }
        if (input.download_file){
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