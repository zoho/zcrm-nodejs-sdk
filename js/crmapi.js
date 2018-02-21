
var modules = require('./modules');
var settings = require('./settings');
var actions = require('./actions');
var users = require('./users');
var org = require('./org');
var attachments = require('./attachments');
var functions = require('./functions');

global.HTTP_METHODS

global.HTTP_METHODS = {
    GET : "GET",//No I18N
    POST : "POST",//No I18N
    PUT : "PUT",//No I18N
    DELETE : "DELETE"//No I18N
};

var API = (function (argument) {
	return {
                
                MODULES : new modules(),
                SETTINGS : new settings(),
                ACTIONS : new actions(),
                USERS : new users(),
                ORG : new org(),
                ATTACHMENTS : new attachments(),
                FUNCTIONS :new functions()
			}
		
})(this)

module.exports = API;