
const OAuth = require('./OAuth');

let client_id = null;
let client_secret = null;
let redirect_url = null;
let user_identifier = null;
let mysql_module = './mysql/mysql_util';
let iamurl = 'accounts.zoho.com';
let baseURL = 'www.zohoapis.com';
let version = 'v2';
let mysql_username = 'root';
let mysql_password = '';
const default_user_identifier = 'zcrm_default_user';

const ZCRMRestClient = function() {};

ZCRMRestClient.initialize = function(configJSON) {
  return new Promise(function(resolve, reject) {
    if (configJSON) {
      ZCRMRestClient.initializeWithValues(configJSON);
      resolve();
    }

    const PropertiesReader = require('properties-reader');
    const properties = PropertiesReader('resources/oauth_configuration.properties');
    const client_id = properties.get('zoho.crm.clientid');
    const client_secret = properties.get('zoho.crm.clientsecret');
    const redirect_url = properties.get('zoho.crm.redirecturl');
    const iam_url =properties.get('zoho.crm.iamurl')?properties.get('zoho.crm.iamurl'):iamurl;

    const config_properties = PropertiesReader('resources/configuration.properties');

    mysql_module = config_properties.get('crm.api.tokenmanagement')?config_properties.get('crm.api.tokenmanagement'):mysql_module;

    // Check for the local storage option
    if (mysql_module === 'local') mysql_module = './local/local_util';

    baseURL = config_properties.get('crm.api.url')?config_properties.get('crm.api.url'):baseURL;

    mysql_username = config_properties.get('mysql.username')?config_properties.get('mysql.username'):mysql_username;

    mysql_password = config_properties.get('mysql.password')?config_properties.get('mysql.password'):mysql_password;


    if (config_properties.get('crm.api.user_identifier')) {
      ZCRMRestClient.setUserIdentifier(config_properties.get('crm.api.user_identifier'));
    } else {
      ZCRMRestClient.setUserIdentifier(default_user_identifier);
    }

    if (!client_id || !client_secret || !redirect_url) {
      throw new Error('Populate the oauth_configuration.properties file');
    }

    ZCRMRestClient.setClientId(client_id);
    ZCRMRestClient.setClientSecret(client_secret);
    ZCRMRestClient.setRedirectURL(redirect_url);
    ZCRMRestClient.setIAMUrl(iam_url);


    resolve();
  });
};

ZCRMRestClient.initializeWithValues = function(configJSON) {
  const client_id = configJSON.client_id;
  const client_secret = configJSON.client_secret;
  const redirect_url = configJSON.redirect_url;
  mysql_module = configJSON.mysql_module?configJSON.mysql_module:mysql_module;

  baseURL = configJSON.baseurl?configJSON.baseurl:baseURL;
  version = configJSON.version?configJSON.version:version;

  ZCRMRestClient.setClientId(client_id);
  ZCRMRestClient.setClientSecret(client_secret);
  ZCRMRestClient.setRedirectURL(redirect_url);
};

ZCRMRestClient.generateAuthTokens = function(user_identifier, grant_token) {
  return new Promise(function(resolve, reject) {
    if (!user_identifier) {
      user_identifier = ZCRMRestClient.getUserIdentifier();
    }

    const config = ZCRMRestClient.getConfig(grant_token);
    new OAuth(config, 'generate_token');
    const api_url = OAuth.constructurl('generate_token');

    OAuth.generateTokens(api_url).then(function(response) {
      if (response.statusCode!=200) {
        throw new Error('Problem occured while generating access token from grant token. Response : '+JSON.stringify(response));
      }

      const mysql_util = require(mysql_module);
      const resultObj = ZCRMRestClient.parseAndConstructObject(response);
      resultObj.user_identifier = user_identifier;

      if (resultObj.access_token) {
        mysql_util.saveOAuthTokens(resultObj).then(function(save_resp) {
          ZCRMRestClient.setUserIdentifier(user_identifier),

          resolve(resultObj);
        }

        );
      } else {
        throw new Error('Problem occured while generating access token and refresh token from grant token.Response : '+JSON.stringify(response));
      }
    });
  });
};


ZCRMRestClient.generateAuthTokenfromRefreshToken = function(user_identifier, refresh_token) {
  return new Promise(function(resolve, reject) {
    if (!user_identifier) {
      user_identifier = ZCRMRestClient.getUserIdentifier();
    }

    const config = ZCRMRestClient.getConfig_refresh(refresh_token);
    new OAuth(config, 'refresh_access_token');
    const api_url = OAuth.constructurl('generate_token');

    OAuth.generateTokens(api_url).then(function(response) {
      if (response.statusCode!=200) {
        throw new Error('Problem occured while generating access token from refresh token . Response : '+JSON.stringify(response));
      }
      const mysql_util = require(mysql_module);
      const resultObj = ZCRMRestClient.parseAndConstructObject(response);

      resultObj.user_identifier = user_identifier;
      resultObj.refresh_token = refresh_token;

      if (resultObj.access_token) {
        mysql_util.saveOAuthTokens(resultObj).then(function(save_response) {
          ZCRMRestClient.setUserIdentifier(user_identifier),
          resolve(resultObj);
        }

        );
      } else {
        throw new Error('Problem occured while generating access token from refresh token. Response : '+JSON.stringify(response));
      }
    });
  });
};


ZCRMRestClient.getConfig = function(grant_token) {
  const config = {};

  config.client_id = ZCRMRestClient.getClientId();
  config.client_secret = ZCRMRestClient.getClientSecret();
  config.code = grant_token;
  config.redirect_uri = ZCRMRestClient.getRedirectURL();
  config.grant_type = 'authorization_code';

  return config;
};

ZCRMRestClient.getConfig_refresh = function(refresh_token) {
  const config = {};

  config.client_id = ZCRMRestClient.getClientId();
  config.client_secret = ZCRMRestClient.getClientSecret();
  config.refresh_token = refresh_token;
  config.grant_type = 'refresh_token';

  return config;
};

ZCRMRestClient.setClientId = function(clientid) {
  client_id = clientid;
};

ZCRMRestClient.setClientSecret = function(clientsecret) {
  client_secret = clientsecret;
};

ZCRMRestClient.setRedirectURL = function(redirecturl) {
  redirect_url = redirecturl;
};

ZCRMRestClient.setUserIdentifier = function(useridentifier) {
  user_identifier = useridentifier;
};

ZCRMRestClient.setIAMUrl = function(iam_url) {
  iamurl = iam_url;
};

ZCRMRestClient.setBaseURL = function(baseurl) {
  baseURL = baseurl;
};

ZCRMRestClient.getClientId = function() {
  return client_id;
};

ZCRMRestClient.getClientSecret = function() {
  return client_secret;
};

ZCRMRestClient.getRedirectURL = function() {
  return redirect_url;
};

ZCRMRestClient.getUserIdentifier = function() {
  if (!user_identifier) {
    return default_user_identifier;
  }
  return user_identifier;
};

ZCRMRestClient.getMySQLModule = function() {
  return mysql_module;
};

ZCRMRestClient.getAPIURL = function() {
  return baseURL;
};

ZCRMRestClient.getVersion = function() {
  return version;
};
ZCRMRestClient.getIAMUrl = function() {
  return iamurl;
};
ZCRMRestClient.getMySQLUserName = function() {
  return mysql_username;
};
ZCRMRestClient.getMYSQLPassword = function() {
  return mysql_password;
};
ZCRMRestClient.parseAndConstructObject = function(response) {
  let body = response['body'];
  body = JSON.parse(body);

  const date = new Date();
  const current_time = date.getTime();

  const resultObj = {};

  if (body.access_token) {
    resultObj.access_token = body.access_token;

    if (body.refresh_token) {
      resultObj.refresh_token = body.refresh_token;
    }

    resultObj.expires_in = body.expires_in+current_time;
  }
  return resultObj;
};

ZCRMRestClient.API = require('./crmapi');

module.exports = ZCRMRestClient;
