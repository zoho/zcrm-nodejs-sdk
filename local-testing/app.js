'use strict';
const packageJson = require('../package.json');
const path = require('path');

const zoho = require(path.join(__dirname, '..', packageJson.main));

(async () => {
  await zoho.initialize();

  // Try creating a refresh token
  const tokens = await zoho.generateAuthTokenfromRefreshToken('trifoia', '1000.4aeea8bfe411f995fb7ba86606600854.fde8bfdfc61920f707b330942ccd7cc9');

  console.log(tokens);
})();
