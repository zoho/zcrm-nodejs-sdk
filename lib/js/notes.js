
var util = require('./util');
var note = require
var notes = function notes(){
    return {
        getNotes :function(input){
            if (input.noteId){
                return util.promiseResponse(util.constructRequestDetails(input, input.module + "/{id}/Notes/" + input.noteId, HTTP_METHODS.GET, false));//No I18N
            }
            else{
                return util.promiseResponse(util.constructRequestDetails(input, input.module + "/{id}/Notes", HTTP_METHODS.GET, false));//No I18N
            }
        },
        addNotes :function(input){
            return util.promiseResponse(util.constructRequestDetails(input, input.module + "/{id}/Notes", HTTP_METHODS.POST, false));//No I18N
        },
        updateNotes :function(input){
            if (input.noteId){
                return util.promiseResponse(util.constructRequestDetails(input, input.module + "/{id}/Notes/" +input.noteId, HTTP_METHODS.PUT, false));//No I18N
            }
            else{
                return util.promiseResponse(util.constructRequestDetails(input, input.module + "/{id}/Notes" , HTTP_METHODS.PUT, false));//No I18N
            }
        },
        deleteNotes :function(input){
            return util.promiseResponse(util.constructRequestDetails(input, input.module + "/{id}/Notes/" +input.noteId, HTTP_METHODS.DELETE, false));//No I18N
        },
        getAttachment : function (input){
            return util.promiseResponse(util.constructRequestDetails(input, "Notes/"+ input.noteId +"/Attachments", HTTP_METHODS.GET, false));//No I18N
        },
        uploadAttachment : function (input){
            return util.promiseResponse(util.constructRequestDetails(input, "Notes/"+ input.noteId +"/Attachments", HTTP_METHODS.POST, false));//No I18N
        },
        deleteAttachment : function (input){
            return util.promiseResponse(util.constructRequestDetails(input, "Notes/"+ input.noteId +"/Attachments/"+input.attachmentId, HTTP_METHODS.DELETE, false));//No I18N
        },
        downloadAttachment : function (input){
            input.download_file = true;
            return util.promiseResponse(util.constructRequestDetails(input, "Notes/"+ input.noteId +"/Attachments/"+input.attachmentId, HTTP_METHODS.GET, false));//No I18N
        }
    }
}

module.exports = notes;