'use strict';
const packageJson = require('../package.json');
const path = require('path');

const zoho = require(path.join(__dirname, '..', packageJson.main));

(async () => {
  await zoho.initialize();

  const input = {
    module: 'Leads',
    params: {
      page: 0,
      per_page: 5
    }
  };

  const result = await zoho.API.MODULES.get(input);

  console.log(result.body);
})();
