
var util = require('./util');
var attachments = function attachments(){
    return {
        getAttachment : function (input){
            return util.promiseResponse(util.constructRequestDetails(input, input.module+ "/{id}/Attachments", HTTP_METHODS.GET, false));//No I18N
        },
        uploadAttachment : function (input){
            return util.promiseResponse(util.constructRequestDetails(input, input.module+ "/{id}/Attachments", HTTP_METHODS.POST, false));//No I18N
        },
        deleteAttachment : function (input){
            return util.promiseResponse(util.constructRequestDetails(input, input.module+ "/{id}/Attachments/"+input.attachmentId, HTTP_METHODS.DELETE, false));//No I18N
        },
        downloadAttachment : function (input){
            input.download_file = true;
            return util.promiseResponse(util.constructRequestDetails(input, input.module+ "/{id}/Attachments/"+input.attachmentId, HTTP_METHODS.GET, false));//No I18N
        },
        uploadLink : function (input){
            return util.promiseResponse(util.constructRequestDetails(input, input.module+ "/{id}/Attachments", HTTP_METHODS.POST, false));//No I18N
        },
        uploadPhoto : function (input){
            return util.promiseResponse(util.constructRequestDetails(input, input.module+ "/{id}/photo", HTTP_METHODS.POST, false));//No I18N
        },
        downloadPhoto : function (input){
            input.download_file = true;
            return util.promiseResponse(util.constructRequestDetails(input, input.module + "/{id}/photo", HTTP_METHODS.GET, false));//No I18N
        },
        deletePhoto : function (input){
            return util.promiseResponse(util.constructRequestDetails(input, input.module + "/{id}/photo", HTTP_METHODS.DELETE, false));//No I18N
        }
    }
}

module.exports = attachments;