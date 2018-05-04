var util = require('./util');

var modules = function modules()
{
    
    return {
        get : function(input)
        {
            return util.promiseResponse(util.constructRequestDetails(input, input.module + "/{id}", HTTP_METHODS.GET, false));//No I18N
        },
        post : function(input)
        {
            return util.promiseResponse(util.constructRequestDetails(input, input.module + "/{id}", HTTP_METHODS.POST, false));//No I18N
        },
        put : function(input)
        {
            return util.promiseResponse(util.constructRequestDetails(input, input.module + "/{id}", HTTP_METHODS.PUT, false));//No I18N
        },
        delete : function (input)
        {
            return util.promiseResponse(util.constructRequestDetails(input, input.module + "/{id}", HTTP_METHODS.DELETE, false));//No I18N
        },
        getAllDeletedRecords : function (input)
        {
            if (input.params)
            {
                input.params.type = "all";
            }
            else
            {
                input.params = {
                    "type" : "all"//No I18N
                };
            }

            return util.promiseResponse(util.constructRequestDetails(input, input.module + "/deleted", HTTP_METHODS.GET, false));//No I18N
        },
        getRecycleBinRecords : function (input)
        {
            if (input.params)
            {
                input.type = "recycle";
            }
            else
            {
                input.params = {
                    "type" : "recycle"//No I18N
                };
            }

            return util.promiseResponse(util.constructRequestDetails(input, input.module + "/deleted", HTTP_METHODS.GET, false));//No I18N
        },
        getPermanentlyDeletedRecords : function (input)
        {
            if (input.params)
            {
                input.type = "permanent";
            }
            else
            {
                input.params = {
                    "type" : "permanent"//No I18N
                };
            }

            return util.promiseResponse(util.constructRequestDetails(input, input.module + "/deleted", HTTP_METHODS.GET, false));//No I18N
        },
        search : function (input)
        {
            return util.promiseResponse(util.constructRequestDetails(input, input.module + "/search", HTTP_METHODS.GET, false));//No I18N
        }
    }
}

module.exports = modules;