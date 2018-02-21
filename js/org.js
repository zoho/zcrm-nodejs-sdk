
var util = require('./util');

var org = function org()
{ 
    return {
        get : function (input)
        {
            return util.promiseResponse(util.constructRequestDetails(input, "org", HTTP_METHODS.GET, true));//No I18N
        }
    }
}

module.exports = org;