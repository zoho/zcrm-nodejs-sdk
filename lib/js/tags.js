var util = require('./util');
var tags = function tags(){
    return {
        getTags : function (input){
            return util.promiseResponse(util.constructRequestDetails(input, "settings/tags", HTTP_METHODS.GET, true));//No I18N
        },
        getTagCount : function (input){
            return util.promiseResponse(util.constructRequestDetails(input, "settings/tags/{id}/actions/records_count", HTTP_METHODS.GET, true));//No I18N
        },
        createTags : function (input){
            return util.promiseResponse(util.constructRequestDetails(input, "settings/tags", HTTP_METHODS.POST, true));//No I18N
        },
        updateTags : function (input){
            return util.promiseResponse(util.constructRequestDetails(input, "settings/tags", HTTP_METHODS.PUT, true));//No I18N
        },
        addTagsToMultipleRecords : function (input){
            return util.promiseResponse(util.constructRequestDetails(input, input.module + "/actions/add_tags", HTTP_METHODS.POST, false));//No I18N
        },
        removeTagsFromMultipleRecords : function (input){
            return util.promiseResponse(util.constructRequestDetails(input, input.module + "/actions/remove_tags", HTTP_METHODS.POST, false));//No I18N
        },
        addTags :function(input){
            return util.promiseResponse(util.constructRequestDetails(input, input.module + "/{id}/actions/add_tags", HTTP_METHODS.POST, false));//No I18N
        },
        removeTags :function(input){
            return util.promiseResponse(util.constructRequestDetails(input, input.module + "/{id}/actions/remove_tags", HTTP_METHODS.POST, false));//No I18N
        },
        delete :function(input){
            return util.promiseResponse(util.constructRequestDetails(input, "settings/tags/" + input.tagId, HTTP_METHODS.DELETE, false));//No I18N
        },
        merge :function(input){
            return util.promiseResponse(util.constructRequestDetails(input, "settings/tags/" + input.mergeTagId + "/actions/merge", HTTP_METHODS.POST, false));//No I18N
        },
        update : function(input){
            return util.promiseResponse(util.constructRequestDetails(input, "settings/tags/" + input.tagId , HTTP_METHODS.PUT, false));//No I18N
        }
    }
}

module.exports = tags;