'use strict';
const PropertiesReader = require('properties-reader');
const OAuth = require('./OAuth');

const STATIC_CONFIG_LOCATIONS = [
  'resources/oauth_configuration.properties',
  'resources/configuration.properties'
];
const DEFAULTS = {
  user_identifier: 'zcrm_default_user',
  mysql_module: './mysql/mysql_util',
  iamurl: 'accounts.zoho.com',
  base_url: 'www.zohoapis.com',
  mysql_username: 'root',
  mysql_password: ''
};
const LOCAL_MODULE = './local/local_util';

/**
 * Static configuration data used to create requests to the ZCRM endpoints and manage access tokens
 */
const data = {
  client_id: null,
  client_secret: null,
  redirect_url: null,
  user_identifier: null,
  refresh_token: null,
  mysql_module: null,
  iamurl: null,
  base_url: null,
  mysql_username: null,
  mysql_password: null,
  version: 'v2' // The version is always v2
};

const ZCRMRestClient = function() {};

/**
 * Globally initializes the Zoho CRM Client. Configurations will be used from the following order, where higher items
 * supersede lower items:
 * 1. Provided configJSON argument
 * 2. Static configuration files in the `resources` directory
 * 3. Environment Variables
 * 4. Pre-defined defaults (when available)
 *
 * @param {object} configJSON Configuration object
 * @return {Promise} Promise will resolve immediately
 */
ZCRMRestClient.initialize = function(configJSON) {
  // 1. Check to see if the config json has anything good
  if (typeof configJSON === 'object') {
    for (const dataKey in data) {
      if (configJSON[dataKey]) data[dataKey] = configJSON[dataKey];
    }
  }

  // 2. Check for the configuration resources
  const config = PropertiesReader('');
  STATIC_CONFIG_LOCATIONS.forEach((location) => {
    try {
      config.append(location);
    } catch (e) {
      // If an error occurs it's probably because the file doesn't exist. That's okay
    }
  });
  data.iamurl = data.iamurl || config.get('zoho.crm.iamurl') || null;
  data.client_id = data.client_id || config.get('zoho.crm.client_id') || config.get('zoho.crm.clientid') || null;
  data.client_secret = data.client_secret || config.get('zoho.crm.client_secret') || config.get('zoho.crm.clientsecret') || null;
  data.redirect_url = data.redirect_url || config.get('zoho.crm.redirect_url') || config.get('zoho.crm.redirecturl') || null;
  data.refresh_token = data.refresh_token || config.get('zoho.crm.refresh_token') || config.get('zoho.crm.refreshtoken') || null;
  data.base_url = data.base_url || config.get('crm.api.base_url') || config.get('crm.api.url') || null;
  data.user_identifier = data.user_identifier || config.get('crm.api.user_identifier') || null;
  data.mysql_module = data.mysql_module || config.get('crm.api.mysql_module') || config.get('crm.api.tokenmanagement') || null;
  data.mysql_username = data.mysql_username || config.get('mysql.username') || null;
  data.mysql_password = data.mysql_password || config.get('mysql.password') || null;

  // 3. Check for environment variables
  data.iamurl = data.iamurl || process.env.ZCRM__iamurl || null;
  data.client_id = data.client_id || process.env.ZCRM__client_id || null;
  data.client_secret = data.client_secret || process.env.ZCRM__client_secret || null;
  data.redirect_url = data.redirect_url || process.env.ZCRM__redirect_url || null;
  data.refresh_token = data.refresh_token || process.env.ZCRM__refresh_token || null;
  data.base_url = data.base_url || process.env.ZCRM__base_url || null;
  data.user_identifier = data.user_identifier || process.env.ZCRM__user_identifier || null;
  data.mysql_module = data.mysql_module || process.env.ZCRM__mysql_module || null;
  data.mysql_username = data.mysql_username || process.env.ZCRM__mysql_username || null;
  data.mysql_password = data.mysql_password || process.env.ZCRM__mysql_password || null;

  // 4. Apply applicable defaults
  for (const defaultKey in DEFAULTS) {
    if (data[defaultKey] === null) data[defaultKey] = DEFAULTS[defaultKey];
  };

  // Make sure everything has been given a value
  const missingValues = [];
  for (const key in data) {
    // Skip the refresh token - it is optional
    if (key === 'refresh_token') continue;
    if (data[key] === null) missingValues.push(key);
  }
  if (missingValues.length > 0) {
    throw new Error(`The following configuration values were not given values: ${missingValues.join(', ')}`);
  }

  // Check for the local storage option
  if (data.mysql_module === 'local') data.mysql_module = LOCAL_MODULE;

  return Promise.resolve(ZCRMRestClient);
};

/**
 * Helper method resets the client by setting all data values to null
 *
 * @return {Promise} Promise will resolve immediately with a reference to the rest client
 */
ZCRMRestClient.reset = function() {
  for (const key in data) {
    // Ignore "version"
    if (key === 'version') continue;
    data[key] = null;
  }

  return Promise.resolve(ZCRMRestClient);
};

/**
 * Depreciated. This method wraps `ZCRMRestClient.initialize` for backwards compatibility
 *
 * @param {object} configJSON Configuration object
 * @return {Promise} Promise will resolve immediately
 */
ZCRMRestClient.initializeWithValues = function(configJSON) {
  return ZCRMRestClient.initialize(configJSON);
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
        throw new Error('Problem occurred while generating access token from grant token. Response : '+JSON.stringify(response));
      }

      const mysql_util = require(ZCRMRestClient.getMySQLModule());
      const resultObj = ZCRMRestClient.parseAndConstructObject(response);
      resultObj.user_identifier = user_identifier;

      if (resultObj.access_token) {
        mysql_util.saveOAuthTokens(resultObj).then(function(save_resp) {
          ZCRMRestClient.setUserIdentifier(user_identifier),

          resolve(resultObj);
        }

        );
      } else {
        throw new Error('Problem occurred while generating access token and refresh token from grant token.Response : '+JSON.stringify(response));
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
        throw new Error('Problem occurred while generating access token from refresh token . Response : '+JSON.stringify(response));
      }
      const mysql_util = require(ZCRMRestClient.getMySQLModule());
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
        throw new Error('Problem occurred while generating access token from refresh token. Response : '+JSON.stringify(response));
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

ZCRMRestClient.setRefreshToken = function(refreshToken) {
  data.refresh_token = refreshToken;
};

ZCRMRestClient.setClientId = function(clientid) {
  data.client_id = clientid;
};

ZCRMRestClient.setClientSecret = function(clientsecret) {
  data.client_secret = clientsecret;
};

ZCRMRestClient.setRedirectURL = function(redirecturl) {
  data.redirect_url = redirecturl;
};

ZCRMRestClient.setUserIdentifier = function(useridentifier) {
  data.user_identifier = useridentifier;
};

ZCRMRestClient.setIAMUrl = function(iam_url) {
  data.iamurl = iam_url;
};

ZCRMRestClient.setBaseURL = function(baseurl) {
  data.base_url = baseurl;
};

ZCRMRestClient.getRefreshToken = function() {
  return data.refresh_token;
};

ZCRMRestClient.getClientId = function() {
  return data.client_id;
};

ZCRMRestClient.getClientSecret = function() {
  return data.client_secret;
};

ZCRMRestClient.getRedirectURL = function() {
  return data.redirect_url;
};

ZCRMRestClient.getUserIdentifier = function() {
  return data.user_identifier;
};

ZCRMRestClient.getMySQLModule = function() {
  return data.mysql_module;
};

ZCRMRestClient.getAPIURL = function() {
  return data.base_url;
};

ZCRMRestClient.getVersion = function() {
  return data.version;
};
ZCRMRestClient.getIAMUrl = function() {
  return data.iamurl;
};
ZCRMRestClient.getMySQLUserName = function() {
  return data.mysql_username;
};
ZCRMRestClient.getMYSQLPassword = function() {
  return data.mysql_password;
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
