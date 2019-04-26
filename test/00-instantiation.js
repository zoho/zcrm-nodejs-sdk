'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

// Custom Modules
const ZCRMRestClient = require('../lib/js/ZCRMRestClient.js');
const modules = require('../lib/js/modules.js');
const settings = require('../lib/js/settings.js');
const actions = require('../lib/js/actions.js');
const users = require('../lib/js/users.js');
const org = require('../lib/js/org.js');
const attachments = require('../lib/js/attachments.js');
const functions = require('../lib/js/functions.js');

const legacyConfiguration = `
[crm]
api.url=
api.user_identifier=
api.tokenmanagement=

[mysql]
username=
password=
`;

const legacyOauthConfiguration = `
[zoho]
crm.iamurl=
crm.clientid=1000.XXXXXXXXXXXXXXXXXXXXXXXXXXXXX
crm.clientsecret=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
crm.redirecturl=https://XXXXXXXXXXXXXXXXXXXXXXXXX
crm.refreshtoken=1000.XXXXXXXXXXXXXXXXXXXXXXXXX.XXXXXXXXXXXXXXXXXXXXXXXXXXXX
`;

describe('Instantiation', function() {
  describe('ZCRMRestClient.js', () => {
    const confPath = path.normalize('./resources/configuration.properties');
    const oauthPath = path.normalize('./resources/oauth_configuration.properties');
    let confFileData, oauthFileData;

    before(() => {
      // We need to ensure legacy support. Do this, in part, but using legacy values in configuration files
      confFileData = fs.readFileSync(confPath);
      oauthFileData = fs.readFileSync(oauthPath);

      fs.writeFileSync(confPath, legacyConfiguration);
      fs.writeFileSync(oauthPath, legacyOauthConfiguration);
    });

    it('should return a promise when initializing', async () => {
      const initializePromise = ZCRMRestClient.initialize();
      assert.strictEqual(initializePromise, Promise.resolve(initializePromise));

      // Let initialization finish
      await initializePromise;
    });

    it('should have correct types for all keys', () => {
      const shouldBeFunction = [
        'initialize',
        'initializeWithValues',
        'generateAuthTokens',
        'generateAuthTokenfromRefreshToken',
        'getConfig',
        'getConfig_refresh',
        'setRefreshToken',
        'setClientId',
        'setClientSecret',
        'setRedirectURL',
        'setUserIdentifier',
        'setIAMUrl',
        'setBaseURL',
        'getRefreshToken',
        'getClientId',
        'getClientSecret',
        'getRedirectURL',
        'getUserIdentifier',
        'getMySQLModule',
        'getAPIURL',
        'getVersion',
        'getIAMUrl',
        'getMySQLUserName',
        'getMYSQLPassword',
        'parseAndConstructObject'
      ];
      shouldBeFunction.forEach((key) => assert.strictEqual(typeof ZCRMRestClient[key], 'function'));

      const shouldBeObject = ['API'];
      shouldBeObject.forEach((key) => assert.strictEqual(typeof ZCRMRestClient[key], 'object'));
    });

    it('should have correct API structure', () => {
      const expectedKeys = [
        'MODULES',
        'SETTINGS',
        'ACTIONS',
        'USERS',
        'ORG',
        'ATTACHMENTS',
        'FUNCTIONS'
      ];
      const actualKeys = Object.keys(ZCRMRestClient.API);

      expectedKeys.forEach((key) => assert(actualKeys.includes(key)));
    });

    it('should have correct values according to resource configurations', () => {
      const PropertiesReader = require('properties-reader');
      const config = PropertiesReader('resources/oauth_configuration.properties');
      config.append('resources/configuration.properties');

      const functionValueMap = {
        // Required oauth values
        getRefreshToken: config.get('zoho.crm.refreshtoken'),
        getClientId: config.get('zoho.crm.clientid'),
        getClientSecret: config.get('zoho.crm.clientsecret'),
        getRedirectURL: config.get('zoho.crm.redirecturl'),
        // Check defaults
        getUserIdentifier: 'zcrm_default_user',
        getMySQLModule: './mysql/mysql_util',
        getAPIURL: 'www.zohoapis.com',
        getVersion: 'v2',
        getIAMUrl: 'accounts.zoho.com',
        getMySQLUserName: 'root',
        getMYSQLPassword: ''
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
  describe('modules.js', () => {
    it('should have expected keys', () => {
      const expectedKeys = [
        'get',
        'post',
        'put',
        'delete',
        'getAllDeletedRecords',
        'getRecycleBinRecords',
        'getPermanentlyDeletedRecords',
        'search'
      ];
      const actualKeys = Object.keys(new modules());

      expectedKeys.forEach((key) => assert(actualKeys.includes(key)));
    });
  });
  describe('settings.js', () => {
    it('should have expected keys', () => {
      const expectedKeys = [
        'getFields',
        'getLayouts',
        'getCustomViews',
        'updateCustomViews',
        'getModules',
        'getRoles',
        'getProfiles',
        'getRelatedLists'
      ];
      const actualKeys = Object.keys(new settings());

      expectedKeys.forEach((key) => assert(actualKeys.includes(key)));
    });
  });
  describe('actions.js', () => {
    it('should have expected keys', () => {
      const expectedKeys = ['convert'];
      const actualKeys = Object.keys(new actions());

      expectedKeys.forEach((key) => assert(actualKeys.includes(key)));
    });
  });
  describe('users.js', () => {
    it('should have expected keys', () => {
      const expectedKeys = ['get'];
      const actualKeys = Object.keys(new users());

      expectedKeys.forEach((key) => assert(actualKeys.includes(key)));
    });
  });
  describe('org.js', () => {
    it('should have expected keys', () => {
      const expectedKeys = ['get'];
      const actualKeys = Object.keys(new org());

      expectedKeys.forEach((key) => assert(actualKeys.includes(key)));
    });
  });
  describe('attachments.js', () => {
    it('should have expected keys', () => {
      const expectedKeys = [
        'uploadFile',
        'deleteFile',
        'downloadFile',
        'uploadLink',
        'uploadPhoto',
        'downloadPhoto',
        'deletePhoto'
      ];
      const actualKeys = Object.keys(new attachments());

      expectedKeys.forEach((key) => assert(actualKeys.includes(key)));
    });
  });
  describe('functions.js', () => {
    it('should have expected keys', () => {
      const expectedKeys = ['executeFunctionsInGet', 'executeFunctionsInPost'];
      const actualKeys = Object.keys(new functions());

      expectedKeys.forEach((key) => assert(actualKeys.includes(key)));
    });
  });
});
