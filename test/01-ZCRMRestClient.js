'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const ZCRMRestClient = require('../lib/js/ZCRMRestClient.js');

const configuration = `
[crm]
api.base_url=resourceConfig_base_url
api.user_identifier=resourceConfig_user_identifier
api.mysql_module=resourceConfig_mysql_module

[mysql]
username=resourceConfig_mysql_username
password=resourceConfig_mysql_password
`;

const oauthConfiguration = `
[zoho]
crm.iamurl=resourceConfig_iamurl
crm.client_id=resourceConfig_client_id
crm.client_secret=resourceConfig_client_secret
crm.redirect_url=resourceConfig_redirect_url
crm.refresh_token=resourceConfig_refresh_token
`;

describe('Zoho CRM Rest Client Tests', function() {
  describe('Instantiation with resource configurations', () => {
    const confPath = path.normalize('./resources/configuration.properties');
    const oauthPath = path.normalize('./resources/oauth_configuration.properties');
    let confFileData, oauthFileData;

    before(() => {
      confFileData = fs.readFileSync(confPath);
      oauthFileData = fs.readFileSync(oauthPath);

      fs.writeFileSync(confPath, configuration);
      fs.writeFileSync(oauthPath, oauthConfiguration);
    });

    it('should initialize correctly with configuration file values', async () => {
      await ZCRMRestClient.reset();
      await ZCRMRestClient.initialize();

      const PropertiesReader = require('properties-reader');
      const config = PropertiesReader('resources/oauth_configuration.properties');
      config.append('resources/configuration.properties');

      const functionValueMap = {
        getRefreshToken: config.get('zoho.crm.refresh_token'),
        getClientId: config.get('zoho.crm.client_id'),
        getClientSecret: config.get('zoho.crm.client_secret'),
        getRedirectURL: config.get('zoho.crm.redirect_url'),
        getUserIdentifier: config.get('crm.api.user_identifier'),
        getMySQLModule: config.get('crm.api.mysql_module'),
        getAPIURL: config.get('crm.api.base_url'),
        getIAMUrl: config.get('zoho.crm.iamurl'),
        getMySQLUserName: config.get('mysql.username'),
        getMYSQLPassword: config.get('mysql.password')
      };
      for (const func in functionValueMap) {
        assert.strictEqual(ZCRMRestClient[func](), functionValueMap[func]);
      }
    });

    after(() => {
      // Replace configuration files
      fs.writeFileSync(confPath, confFileData);
      fs.writeFileSync(oauthPath, oauthFileData);
    });
  });

  describe('Instantiation without resource configurations', () => {
    const confPath = path.normalize('./resources/configuration.properties');
    const oauthPath = path.normalize('./resources/oauth_configuration.properties');
    let confFileData, oauthFileData;

    before(() => {
      // First save and remove the static resources files so that it doesn't interfere with the evnars
      confFileData = fs.readFileSync(confPath);
      oauthFileData = fs.readFileSync(oauthPath);

      fs.unlinkSync(confPath);
      fs.unlinkSync(oauthPath);
    });

    it('should fail to initialize without needed data', async () => {
      await ZCRMRestClient.reset();
      try {
        await ZCRMRestClient.initialize();
      } catch (e) {
        // We expect an error
        return;
      }

      assert.fail('Expected an error to be thrown');
    });

    it('should initialize correctly with JSON values', async () => {
      const data = {
        client_id: 'client_id',
        client_secret: 'client_secret',
        redirect_url: 'redirect_url',
        user_identifier: 'user_identifier',
        refresh_token: 'refresh_token',
        mysql_module: 'mysql_module',
        iamurl: 'iamurl',
        base_url: 'base_url',
        mysql_username: 'mysql_username',
        mysql_password: 'mysql_password'
      };
      await ZCRMRestClient.initialize(data);

      const functionValueMap = {
        getRefreshToken: data.refresh_token,
        getClientId: data.client_id,
        getClientSecret: data.client_secret,
        getRedirectURL: data.redirect_url,
        getUserIdentifier: data.user_identifier,
        getMySQLModule: data.mysql_module,
        getAPIURL: data.base_url,
        getIAMUrl: data.iamurl,
        getMySQLUserName: data.mysql_username,
        getMYSQLPassword: data.mysql_password
      };
      for (const func in functionValueMap) {
        assert.strictEqual(ZCRMRestClient[func](), functionValueMap[func]);
      }
    });

    it('should initialize correctly with envars', async () => {
      process.env.ZCRM__client_id = 'ZCRM__client_id';
      process.env.ZCRM__client_secret = 'ZCRM__client_secret';
      process.env.ZCRM__redirect_url = 'ZCRM__redirect_url';
      process.env.ZCRM__user_identifier = 'ZCRM__user_identifier';
      process.env.ZCRM__refresh_token = 'ZCRM__refresh_token';
      process.env.ZCRM__mysql_module = 'ZCRM__mysql_module';
      process.env.ZCRM__iamurl = 'ZCRM__iamurl';
      process.env.ZCRM__base_url = 'ZCRM__base_url';
      process.env.ZCRM__mysql_username = 'ZCRM__mysql_username';
      process.env.ZCRM__mysql_password = 'ZCRM__mysql_password';

      await ZCRMRestClient.reset();
      await ZCRMRestClient.initialize();

      const functionValueMap = {
        getRefreshToken: process.env.ZCRM__refresh_token,
        getClientId: process.env.ZCRM__client_id,
        getClientSecret: process.env.ZCRM__client_secret,
        getRedirectURL: process.env.ZCRM__redirect_url,
        getUserIdentifier: process.env.ZCRM__user_identifier,
        getMySQLModule: process.env.ZCRM__mysql_module,
        getAPIURL: process.env.ZCRM__base_url,
        getIAMUrl: process.env.ZCRM__iamurl,
        getMySQLUserName: process.env.ZCRM__mysql_username,
        getMYSQLPassword: process.env.ZCRM__mysql_password
      };
      for (const func in functionValueMap) {
        assert.strictEqual(ZCRMRestClient[func](), functionValueMap[func]);
      }
    });

    after(() => {
      // Replace configuration files
      fs.writeFileSync(confPath, confFileData);
      fs.writeFileSync(oauthPath, oauthFileData);
    });
  });
});
