var OAuth = require('./OAuth');
var client_id = null;
var client_secret = null;
var redirect_uri = null;
var user_identifier = null;
var persistence_handler = "./mysql/mysql_util" ;
var iam_url = "accounts.zoho.com";
var base_url = "www.zohoapis.com";
var version = "v2";
var mysql_username = "root";
var mysql_password = "";
var token_file_path = null;
 var ZCRMRestClient = function(){};

 ZCRMRestClient.initialize = function(configJSON){
    return new Promise(function(resolve,reject){
        if(configJSON){
            var mandatory_values = ['client_id','client_secret','redirect_uri']
            mandatory_values.forEach(function (key) {
                if (!configJSON[key]){
                    throw new Error('Missing configuration for Zoho OAuth service: '+ key);
                }
            })
            
            var clientid  = configJSON.client_id;
            var clientsecret = configJSON.client_secret;
            var redirecturi = configJSON.redirect_uri;
            var iamurl = configJSON.iam_url?configJSON.iam_url:iam_url;
            var persistencehandler;
            if (configJSON.persistence_handler){
                if(configJSON.persistence_handler == "in_memory"){
                    persistencehandler = "./inmemorypersistence/inmemory_util";
                }
                else if(configJSON.persistence_handler == "file"){
                    persistencehandler = "./filepersistence/file_util";
                    if (configJSON.token_file_path){
                        ZCRMRestClient.setTokenFilePath(configJSON.token_file_path)
                    }
                    else{
                        throw new Error("for file persistence token file path must be given");
                    }
                }
                else{
                    persistencehandler = configJSON.persistence_handler;
                }
            }else{
                persistencehandler = persistence_handler;
            }
            var baseurl = configJSON.base_url?configJSON.base_url:base_url;
            var apiversion = configJSON.version?configJSON.version:version;
            var mysqlusername = configJSON.mysql_username?configJSON.mysql_username:mysql_username;
            var mysqlpassword = configJSON.mysql_password?configJSON.mysql_password:mysql_password;
            var useridentifier = configJSON.user_identifier;
            ZCRMRestClient.setClientId(clientid);
            ZCRMRestClient.setClientSecret(clientsecret);
            ZCRMRestClient.setRedirectURI(redirecturi);
            ZCRMRestClient.setIAMUrl(iamurl);
            ZCRMRestClient.setPersistenceHandler(persistencehandler);
            ZCRMRestClient.setBaseURL(baseurl);
            ZCRMRestClient.setVersion(apiversion);
            ZCRMRestClient.setMySQLUserName(mysqlusername);
            ZCRMRestClient.setMYSQLPassword(mysqlpassword);
            ZCRMRestClient.setUserIdentifier(useridentifier);
            resolve();
        }
        else{
            throw new Error("Configuration json must be passed ");
        }
    })
}

 ZCRMRestClient.generate_access_token = function(grant_token){
    return new Promise(function(resolve,reject){
        var config = ZCRMRestClient.getConfig(grant_token);
        new OAuth(config,"generate_token");
        var api_url = OAuth.constructurl("generate_token");
        OAuth.generateTokens(api_url).then(function(token_response){
            if(token_response.statusCode!=200){
                throw new Error("Problem occured while generating access token from grant token. Response : "+JSON.stringify(token_response));
            }
            var persistence_util = require(persistence_handler);
            var oauthtoken = ZCRMRestClient.parseAndConstructObject(token_response);
            if(!oauthtoken.accesstoken){
                throw new Error("Problem occured while generating access token and refresh token from grant token.Response : "+JSON.stringify(token_response));
            }
            var config = ZCRMRestClient.getConfigUserEmail(oauthtoken.accesstoken);
            new OAuth(config,"get_useremail_id");
            var api_url = OAuth.constructurl("get_useremail_id");
            OAuth.get_user_email_from_iam(api_url).then(function(iam_response){
                var body = ZCRMRestClient.parseAndConstructObject(iam_response);
                if(!body.Email){
                    throw new Error("Problem occured while getting email id from the access token.Response : "+JSON.stringify(iam_response));
                }
                oauthtoken.useridentifier = body.Email;
                persistence_util.saveOAuthTokens(oauthtoken).then(function(){
                    resolve(oauthtoken);
                });
            });
        })
    })
}
ZCRMRestClient.generate_access_token_from_refresh_token = function(user_identifier,refresh_token){
    return new Promise(function(resolve,reject){
        ZCRMRestClient.refresh_access_token(user_identifier,refresh_token).then(function(oauthtoken){
            resolve(oauthtoken);
        })
    }) 
}

ZCRMRestClient.refresh_access_token = function(user_identifier,refresh_token){
    if(!refresh_token){
        throw new Error("refresh token not provided!");
    }
    if(!user_identifier){
        throw new Error("user identifier not provided!")
    }
    return new Promise(function(resolve,reject){
        var config = ZCRMRestClient.getConfig_refresh(refresh_token);
        new OAuth(config,"refresh_access_token");
        var api_url = OAuth.constructurl("generate_token");
        OAuth.generateTokens(api_url).then(function(token_response){
            if(token_response.statusCode!=200){
                throw new Error("Problem occured while generating access token from refresh token . Response : "+JSON.stringify(token_response));
            }
            var persistence_util = require(persistence_handler);
            var oauthtoken = ZCRMRestClient.parseAndConstructObject(token_response);
            oauthtoken.useridentifier = user_identifier;
            oauthtoken.refreshtoken = refresh_token;
            if(oauthtoken.accesstoken){
                persistence_util.saveOAuthTokens(oauthtoken).then(function(){
                    resolve(oauthtoken)
                });
            }
            else{
                throw new Error("Problem occured while generating access token from refresh token. Response : "+JSON.stringify(token_response));
            }
        })
    })
};


ZCRMRestClient.getConfig = function(grant_token){
    var config = {};
    config.client_id = ZCRMRestClient.getClientId();
    config.client_secret = ZCRMRestClient.getClientSecret();
    config.code = grant_token;
    config.redirect_uri = ZCRMRestClient.getRedirectURI();
    config.grant_type = "authorization_code";
    return config;
}

ZCRMRestClient.getConfigUserEmail = function(access_token){
    var config = {};
    config.access_token = access_token;
    return config;
}

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
ZCRMRestClient.setRedirectURI = function(redirecturi){
    redirect_uri = redirecturi;
}
ZCRMRestClient.setUserIdentifier = function(useridentifier){
    user_identifier = useridentifier;
}
ZCRMRestClient.setPersistenceHandler = function(persistencehandler){
    persistence_handler =  persistencehandler;
}
ZCRMRestClient.setMySQLUserName = function(mysqlusername){
    mysql_username = mysqlusername;
}
ZCRMRestClient.setMYSQLPassword = function(mysqlpassword){
    mysql_password = mysqlpassword;
}
ZCRMRestClient.setIAMUrl = function(iamurl){
    iam_url = iamurl;
}
ZCRMRestClient.setBaseURL = function(baseurl){
    baseurl = baseurl;
}
ZCRMRestClient.setVersion = function(apiversion){
    version = apiversion;
}
ZCRMRestClient.setTokenFilePath = function(tokenfilepath){
    token_file_path = tokenfilepath;
}
ZCRMRestClient.getClientId = function(){
    return client_id;
}
ZCRMRestClient.getClientSecret = function(){
    return client_secret;
}
ZCRMRestClient.getRedirectURI = function(){
    return redirect_uri;
}
ZCRMRestClient.getUserIdentifier = function(){
    return user_identifier;
}
ZCRMRestClient.getPersistenceHandler = function(){
    return persistence_handler;
}
ZCRMRestClient.getAPIURL = function(){
    return base_url;
}
ZCRMRestClient.getVersion = function(){
    return version;
}
ZCRMRestClient.getIAMUrl = function(){
    return iam_url;
}
ZCRMRestClient.getMySQLUserName = function(){
    return mysql_username;
}
ZCRMRestClient.getMYSQLPassword = function(){
    return mysql_password;
}
ZCRMRestClient.getTokenFilePath = function(){
    return token_file_path;
}
ZCRMRestClient.parseAndConstructObject = function(token_response){
    var body = token_response["body"];
    body = JSON.parse(body);
    var date = new Date();
    var current_time = date.getTime();
    var oauthtoken = {};
    if(body.access_token){
        oauthtoken.accesstoken = body.access_token;
        if(body.refresh_token){
            oauthtoken.refreshtoken = body.refresh_token;
        }
        oauthtoken.expirytime = body.expires_in+current_time;
    }
    else{
        oauthtoken = body ;
    }
    return oauthtoken;
}

 ZCRMRestClient.API = require('./crmapi');

 module.exports = ZCRMRestClient;