var util = require('./util');

var settings = function settings()
{
    
    return {
        getFields : function (input)
        {
            return util.promiseResponse(util.constructRequestDetails(input, "settings/fields/{id}", HTTP_METHODS.GET, true));//No I18N
        },
        getLayouts : function (input)
        {
            return util.promiseResponse(util.constructRequestDetails(input, "settings/layouts/{id}", HTTP_METHODS.GET, true));//No I18N
        },
        getCustomViews : function (input)
        {
            return util.promiseResponse(util.constructRequestDetails(input, "settings/custom_views/{id}", HTTP_METHODS.GET, true));//No I18N
        },
        updateCustomViews : function (input)
        {
            return util.promiseResponse(util.constructRequestDetails(input, "settings/custom_views/{id}", HTTP_METHODS.PUT, true));//No I18N
        },
        getModules : function (input)
        {
            return util.promiseResponse(util.constructRequestDetails(input, "settings/modules" + ((input && input.module) ? "/" + input.module : ""), HTTP_METHODS.GET, false));//No I18N
        },
        getRoles : function (input)
        {
            return util.promiseResponse(util.constructRequestDetails(input, "settings/roles/{id}", HTTP_METHODS.GET, true));//No I18N
        },
        getProfiles : function (input)
        {
            return util.promiseResponse(util.constructRequestDetails(input, "settings/profiles/{id}", HTTP_METHODS.GET, true));//No I18N
        },
        getRelatedLists : function (input)
        {
            return util.promiseResponse(util.constructRequestDetails(input, "settings/related_lists/{id}", HTTP_METHODS.GET, true));//No I18N
        }
    }
}

module.exports = settings;