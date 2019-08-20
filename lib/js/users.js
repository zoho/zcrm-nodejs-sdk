var util = require('./util');
var users = function users(){
    return {
        get : function (input){
            return util.promiseResponse(util.constructRequestDetails(input, "users/{id}", HTTP_METHODS.GET, false));//No I18N
        },
        create : function (input){
            return util.promiseResponse(util.constructRequestDetails(input, "users/{id}", HTTP_METHODS.POST, false));//No I18N
        },
        update : function (input){
            return util.promiseResponse(util.constructRequestDetails(input, "users/{id}", HTTP_METHODS.PUT, false));//No I18N
        },
        delete : function (input){
            return util.promiseResponse(util.constructRequestDetails(input, "users/{id}", HTTP_METHODS.DELETE, false));//No I18N
        },
        search : function (input){
            return util.promiseResponse(util.constructRequestDetails(input, "users/search", HTTP_METHODS.GET, false));//No I18N
        }
    }
}

module.exports = users;