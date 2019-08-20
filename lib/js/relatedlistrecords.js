
var util = require('./util');
var relatedlistrecords = function relatedlistrecords(){
    return {
        getRelatedRecords :function(input){
            if (input.relatedrecordid){
                return util.promiseResponse(util.constructRequestDetails(input, input.module + "/{id}/" + input.relatedlistapiname + "/" +input.relatedrecordid, HTTP_METHODS.GET, false));//No I18N
            }
            else{
                return util.promiseResponse(util.constructRequestDetails(input, input.module + "/{id}/" + input.relatedlistapiname, HTTP_METHODS.GET, false));//No I18N
            }
        },
        addRelation :function(input){
            return util.promiseResponse(util.constructRequestDetails(input, input.module + "/{id}/" + input.junctionapiname + "/" +input.junctionId, HTTP_METHODS.PUT, false));//No I18N
        },
        removeRelation :function(input){
            return util.promiseResponse(util.constructRequestDetails(input, input.module + "/{id}/" + input.junctionapiname + "/" +input.junctionId, HTTP_METHODS.DELETE, false));//No I18N
        }
    }
}

module.exports = relatedlistrecords;