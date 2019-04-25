'use strict';
const packageJson = require('../package.json');
const path = require('path');

const zoho = require(path.join(__dirname, '..', packageJson.main));

(async () => {
  await zoho.initialize();

  const newSalesOrder = {
    module: 'Sales_orders',
    body: {
      data: [
        {
          Subject: 'API Test SO',
          Account_Name: 'Pyramid Model Consortium',
          Product_Details: [
            {
              product: {
                id: '1717725000005607107'
              },
              quantity: 1
            }
          ],
          Status: 'Delivered',
          Due_Date: '2019-04-25'
        }
      ]
    }
  };

  const postResult = await zoho.API.MODULES.post(newSalesOrder);
  console.log(postResult.body);
})();
