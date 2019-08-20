var util = require('./util');
var url = "functions/{api_name}/actions/execute";
var functions = function functions(){
    return{
        executeFunctionsInGet :function(input){
            return util.promiseResponse(util.constructRequestDetails(input, url , HTTP_METHODS.GET, true));//No I18N
        },
        executeFunctionsInPost :function(input){
            return util.promiseResponse(util.constructRequestDetails(input, url , HTTP_METHODS.POST, true));//No I18N
        },
        executeFunctionsInPut :function(input){
            return util.promiseResponse(util.constructRequestDetails(input, url , HTTP_METHODS.PUT, true));//No I18N
        },
        executeFunctionsInDelete :function(input){
            return util.promiseResponse(util.constructRequestDetails(input, url , HTTP_METHODS.DELETE, true));//No I18N
        }
    }
}

module.exports = functions;
