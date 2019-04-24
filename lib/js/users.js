const util = require('./util');

const users = function users() {
  return {
    get: function(input) {
      return util.promiseResponse(util.constructRequestDetails(input, 'users/{id}', HTTP_METHODS.GET, true));// No I18N
    }
  };
};


module.exports = users;
