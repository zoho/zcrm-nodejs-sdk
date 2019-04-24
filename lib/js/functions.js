const util = require('./util');
const url = 'functions/{api_name}/actions/execute';

const functions = function functions() {
  return {

    executeFunctionsInGet: function(input) {
      return util.promiseResponse(util.constructRequestDetails(input, url, HTTP_METHODS.GET, true));// No I18N
    },

    executeFunctionsInPost: function(input) {
      return util.promiseResponse(util.constructRequestDetails(input, url, HTTP_METHODS.POST, true));// No I18N
    }
  };
};

module.exports = functions;
