
var config = null;
var qs = require('querystring');
var httpclient = require('request');
var actionvsurl = {
    generate_token:'/oauth/v2/token',
    get_useremail_id:'/oauth/user/info'
}
var mand_configurations = {
    generate_token : ['client_id','client_secret','redirect_uri','code','grant_type'],
    refresh_access_token : ['client_id','client_secret','grant_type','refresh_token'],
    get_useremail_id : ['access_token']
}
var OAuth = function (configuration,action) {
    if (!configuration ){
        throw new Error('Missing configuration for Zoho OAuth2 service');
    }
    assertConfigAttributesAreSet(configuration, mand_configurations[action]);
    config = configuration;
};

function assertConfigAttributesAreSet(configuration, attributes) {
    attributes.forEach(function (attribute) {
        if (!configuration[attribute]){
            throw new Error('Missing configuration for Zoho OAuth service: '+ attribute);
        }
    });
}

OAuth.constructurl=function(action){
    var crmclient = require('./ZCRMRestClient');
    var url = "https://"+crmclient.getIAMUrl()+actionvsurl[action];
    if( action!="get_useremail_id" ){
        url = url + '?' + qs.stringify(config);
        config = null;
    }
    return url;
}

OAuth.generateTokens=function(url){
    return new Promise(function(resolve,reject){
        httpclient.post(url,{

        },function (err, tokenresponse) {
            if(err){
                resolve(err);
            }
            resolve(tokenresponse);
        });
    })
}
OAuth.get_user_email_from_iam=function(url){
    var authorization_header ={}
    authorization_header.Authorization = 'Zoho-oauthtoken '+config.access_token
    return new Promise(function(resolve,reject){
        httpclient.post({
            uri : url,
            method : HTTP_METHODS.GET,
            headers : authorization_header
        },function (err, iam_response) {
            if(err){
                resolve(err);
            }
            resolve(iam_response);
        });
    })
}

module.exports = OAuth;