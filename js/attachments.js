
var util = require('./util');
var attachments = function attachments()
{
    
    return {
        uploadFile : function (input)
        {
            return util.promiseResponse(util.constructRequestDetails(input, input.module+ "/{id}/Attachments", HTTP_METHODS.POST, false));//No I18N
        },
        deleteFile : function (input)
        {
            return util.promiseResponse(util.constructRequestDetails(input, input.module+ "/{id}/Attachments/"+input.relatedId, HTTP_METHODS.DELETE, false));//No I18N
        },
        downloadFile : function (input)
        {
            input.download_file = true;
            return util.promiseResponse(util.constructRequestDetails(input, input.module+ "/{id}/Attachments/"+input.relatedId, HTTP_METHODS.GET, false));//No I18N
        },
        uploadLink : function (input)
        {
            return util.promiseResponse(util.constructRequestDetails(input, input.module+ "/{id}/Attachments", HTTP_METHODS.POST, false));//No I18N
        },
        uploadPhoto : function (input)
        {
            return util.promiseResponse(util.constructRequestDetails(input, input.module+ "/{id}/photo", HTTP_METHODS.POST, false));//No I18N
        },
        downloadPhoto : function (input)
        {
            input.download_file = true;
            return util.promiseResponse(util.constructRequestDetails(input, input.module + "/{id}/photo", HTTP_METHODS.GET, false));//No I18N
        },
        deletePhoto : function (input)
        {
            return util.promiseResponse(util.constructRequestDetails(input, input.module + "/{id}/photo", HTTP_METHODS.DELETE, false));//No I18N
        }
    }
}

module.exports = attachments;