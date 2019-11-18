
var OAuth = require('./OAuth');

var client_id = null;
var client_secret = null;
var redirect_url = null;
var user_identifier = null;
var mysql_module = "./mysql/mysql_util" ;
var iamurl = "accounts.zoho.com";
var baseURL = "www.zohoapis.com";
var version = "v2";
var mysql_username = "root";
var mysql_password = "";
var default_user_identifier = "zcrm_default_user";

 var ZCRMRestClient = function(){};

 ZCRMRestClient.initialize = function(configJSON){

    
 return new Promise(function(resolve,reject){

    if(configJSON){

        ZCRMRestClient.initializeWithValues(configJSON);
        resolve();

    }

    var PropertiesReader = require('properties-reader');
    var properties = PropertiesReader('resources/oauth_configuration.properties');
    var client_id  = properties.get('zoho.crm.clientid');
    var client_secret = properties.get('zoho.crm.clientsecret');
    var redirect_url = properties.get('zoho.crm.redirecturl');
    var iam_url =properties.get('zoho.crm.iamurl')?properties.get('zoho.crm.iamurl'):iamurl;

    var config_properties = PropertiesReader('resources/configuration.properties');
    
    mysql_module = config_properties.get('crm.api.tokenmanagement')?config_properties.get('crm.api.tokenmanagement'):mysql_module;

    baseURL = config_properties.get('crm.api.url')?config_properties.get('crm.api.url'):baseURL;
    
    mysql_username = config_properties.get('mysql.username')?config_properties.get('mysql.username'):mysql_username;

    mysql_password = config_properties.get('mysql.password')?config_properties.get('mysql.password'):mysql_password;
    

    if(config_properties.get('crm.api.user_identifier')){

        ZCRMRestClient.setUserIdentifier(config_properties.get('crm.api.user_identifier'));
    }
    else{

        ZCRMRestClient.setUserIdentifier(default_user_identifier);
    }

    if(!client_id || !client_secret || !redirect_url){

        throw new Error("Populate the oauth_configuration.properties file");

    }

    ZCRMRestClient.setClientId(client_id);
    ZCRMRestClient.setClientSecret(client_secret);
    ZCRMRestClient.setRedirectURL(redirect_url);
    ZCRMRestClient.setIAMUrl(iam_url);
    

    resolve();

    })
 }

 ZCRMRestClient.initializeWithValues = function(configJSON){


    var client_id  = configJSON.client_id;
    var client_secret = configJSON.client_secret;
    var redirect_url = configJSON.redirect_url;
    var iam_url = configJSON.iamurl?configJSON.iamurl:iamurl;
    mysql_module = configJSON.mysql_module?configJSON.mysql_module:mysql_module;
   
    baseURL = configJSON.baseurl?configJSON.baseurl:baseURL;
    version = configJSON.version?configJSON.version:version;

    ZCRMRestClient.setClientId(client_id);
    ZCRMRestClient.setClientSecret(client_secret);
    ZCRMRestClient.setRedirectURL(redirect_url); 
    

 }

 ZCRMRestClient.generateAuthTokens = function(user_identifier,grant_token){

    return new Promise(function(resolve,reject){

        if(!user_identifier){

            user_identifier = ZCRMRestClient.getUserIdentifier();
        }

    var config = ZCRMRestClient.getConfig(grant_token);
    new OAuth(config,"generate_token");
    var api_url = OAuth.constructurl("generate_token");

    OAuth.generateTokens(api_url).then(function(response){

        if(response.statusCode!=200){

            throw new Error("Problem occured while generating access token from grant token. Response : "+JSON.stringify(response));

        }
           
        var mysql_util = require(mysql_module);
        var resultObj = ZCRMRestClient.parseAndConstructObject(response);
        resultObj.user_identifier = user_identifier;
       
        if(resultObj.access_token){

            mysql_util.saveOAuthTokens(resultObj).then(function(save_resp){
            
             ZCRMRestClient.setUserIdentifier(user_identifier),
             
             resolve(resultObj)
            
            }  

         );
        }
        else{
        
            throw new Error("Problem occured while generating access token and refresh token from grant token.Response : "+JSON.stringify(response));
        }
    })
})
}


ZCRMRestClient.generateAuthTokenfromRefreshToken = function(user_identifier,refresh_token){

    return new Promise(function(resolve,reject){

        if(!user_identifier){

            user_identifier = ZCRMRestClient.getUserIdentifier();
        }

    var config = ZCRMRestClient.getConfig_refresh(refresh_token);
    new OAuth(config,"refresh_access_token");
    var api_url = OAuth.constructurl("generate_token");

    OAuth.generateTokens(api_url).then(function(response){
        
        if(response.statusCode!=200){

            throw new Error("Problem occured while generating access token from refresh token . Response : "+JSON.stringify(response));

        }
        var mysql_util = require(mysql_module);
        var resultObj = ZCRMRestClient.parseAndConstructObject(response);
        
        resultObj.user_identifier = user_identifier;
        resultObj.refresh_token = refresh_token;

        if(resultObj.access_token){

            mysql_util.saveOAuthTokens(resultObj).then(function(save_response){
            
             ZCRMRestClient.setUserIdentifier(user_identifier),
             resolve(resultObj)
             
            }

         );
        }
         else{
            throw new Error("Problem occured while generating access token from refresh token. Response : "+JSON.stringify(response));
         
         }
        
        
    })
})
};


ZCRMRestClient.getConfig = function(grant_token){

    var config = {};

    config.client_id = ZCRMRestClient.getClientId();
    config.client_secret = ZCRMRestClient.getClientSecret();
    config.code = grant_token;
    config.redirect_uri = ZCRMRestClient.getRedirectURL();
    config.grant_type = "authorization_code";

    return config;

};

ZCRMRestClient.getConfig_refresh = function(refresh_token){

        var config = {};

        config.client_id = ZCRMRestClient.getClientId();
        config.client_secret = ZCRMRestClient.getClientSecret(); 
        config.refresh_token = refresh_token;
        config.grant_type = "refresh_token";

        return config;

}

ZCRMRestClient.setClientId = function(clientid){

    client_id = clientid;
}

ZCRMRestClient.setClientSecret = function(clientsecret){

    client_secret = clientsecret;

}

ZCRMRestClient.setRedirectURL = function(redirecturl){

    redirect_url = redirecturl;
}

ZCRMRestClient.setUserIdentifier = function(useridentifier){

    user_identifier = useridentifier;

}

ZCRMRestClient.setIAMUrl = function(iam_url){

    iamurl = iam_url;
}

ZCRMRestClient.setBaseURL = function(baseurl){

    baseURL = baseurl;
}

ZCRMRestClient.getClientId = function(){

    return client_id;

}

ZCRMRestClient.getClientSecret = function(){

    return client_secret;

}

ZCRMRestClient.getRedirectURL = function(){

    return redirect_url;
}

ZCRMRestClient.getUserIdentifier = function(){

    if(!user_identifier){
        
        return default_user_identifier;
    }
    return user_identifier;
}

ZCRMRestClient.getMySQLModule = function(){

    return mysql_module;
}

ZCRMRestClient.getAPIURL = function(){

    return baseURL;
}

ZCRMRestClient.getVersion = function(){

    return version;
}
ZCRMRestClient.getIAMUrl = function(){

    return iamurl;
}
ZCRMRestClient.getMySQLUserName = function(){

    return mysql_username;
}
ZCRMRestClient.getMYSQLPassword = function(){

    return mysql_password;

}
ZCRMRestClient.parseAndConstructObject = function(response){

    var body = response["body"];
    body = JSON.parse(body);

    var date = new Date();
    var current_time = date.getTime();

    var resultObj = {};
    
    if(body.access_token){

        resultObj.access_token = body.access_token;

        if(body.refresh_token){

            resultObj.refresh_token = body.refresh_token;
        }
        if(!body.expires_in_sec){
            body.expires_in = body.expires_in*1000;
        }
        resultObj.expires_in = body.expires_in+current_time;
    }
    return resultObj;

}

 ZCRMRestClient.API = require('./crmapi');

 module.exports = ZCRMRestClient;