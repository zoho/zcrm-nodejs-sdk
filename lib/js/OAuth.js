
let config = null;
const qs = require('querystring');
const httpclient = require('request');

const actionvsurl = {

  generate_token: '/oauth/v2/token'
};

const mand_configurations = {

  generate_token: ['client_id', 'client_secret', 'redirect_uri', 'code', 'grant_type'],
  refresh_access_token: ['client_id', 'client_secret', 'grant_type']
};


const OAuth = function(configuration, action) {
  if (!configuration) {
    throw new Error('Missing configuration for Zoho OAuth2 service');
  }
  assertConfigAttributesAreSet(configuration, mand_configurations[action]);
  config = configuration;
};


function assertConfigAttributesAreSet(configuration, attributes) {
  attributes.forEach(function(attribute) {
    if (!configuration[attribute]) {
      throw new Error('Missing configuration for Zoho OAuth service: '+ attribute);
    }
  });
}

OAuth.constructurl=function(action) {
  const crmclient = require('./ZCRMRestClient');
  const url = 'https://'+crmclient.getIAMUrl()+actionvsurl[action]+'?' + qs.stringify(config);
  return url;
};

OAuth.generateTokens=function(url) {
  return new Promise(function(resolve, reject) {
    httpclient.post(url, {

    }, function(err, response) {
      if (err) {
        resolve(err);
      }
      resolve(response);
    });
  });
};


module.exports = OAuth;


