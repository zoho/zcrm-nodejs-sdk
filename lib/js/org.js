var util = require('./util');
var org = function org(){ 
    return {
        get : function (input){
            return util.promiseResponse(util.constructRequestDetails(input, "org", HTTP_METHODS.GET, false));//No I18N
        },
        getOrgTax : function (input){
            return util.promiseResponse(util.constructRequestDetails(input, "org/taxes/{id}", HTTP_METHODS.GET, false));//No I18N
        },
        createOrgTax : function (input){
            return util.promiseResponse(util.constructRequestDetails(input, "org/taxes", HTTP_METHODS.POST, false));//No I18N
        },
        updateOrgTax : function (input){
            return util.promiseResponse(util.constructRequestDetails(input, "org/taxes", HTTP_METHODS.PUT, false));//No I18N
        },
        deleteOrgTax : function (input){
            return util.promiseResponse(util.constructRequestDetails(input, "org/taxes/{id}", HTTP_METHODS.DELETE, false));//No I18N
        }
    }
}
module.exports = org;