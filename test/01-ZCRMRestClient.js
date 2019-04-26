'use strict';

const ZCRMRestClient = require('../lib/js/ZCRMRestClient.js');

describe('Zoho CRM Rest Client Tests', function() {
  describe('Instantiation', () => {
    it('should initialize correctly with JSON values', async () => {
      console.log(ZCRMRestClient.getClientId());
    });
  });
});
