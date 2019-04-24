
const modules = require('./modules');
const settings = require('./settings');
const actions = require('./actions');
const users = require('./users');
const org = require('./org');
const attachments = require('./attachments');
const functions = require('./functions');

global.HTTP_METHODS;

global.HTTP_METHODS = {
  GET: 'GET', // No I18N
  POST: 'POST', // No I18N
  PUT: 'PUT', // No I18N
  DELETE: 'DELETE'// No I18N
};

const API = (function(argument) {
  return {

    MODULES: new modules(),
    SETTINGS: new settings(),
    ACTIONS: new actions(),
    USERS: new users(),
    ORG: new org(),
    ATTACHMENTS: new attachments(),
    FUNCTIONS: new functions()
  };
})(this);

module.exports = API;
