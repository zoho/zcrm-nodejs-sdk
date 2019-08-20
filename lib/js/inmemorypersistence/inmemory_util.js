
var oauthtokens=[];
var In_memory = {};
In_memory.saveOAuthTokens = function(config_obj){
    return new Promise(function(resolve,reject){
        In_memory.updateOAuthTokens(config_obj).then(function(){
           resolve();
        })
    })
}

In_memory.getOAuthTokens = function(user_identifier){ 
    return new Promise(function(resolve,reject){
        token = oauthtokens.find((tokenobject) => tokenobject.useridentifier === user_identifier);
        resolve(token);
    })
}

In_memory.updateOAuthTokens = function(tokenobject){
    return new Promise(function(resolve,reject){
        var found = 0;
        for (var tokenindex = 0, token_number = oauthtokens.length; tokenindex < token_number; tokenindex++) {
            if(oauthtokens[tokenindex].useridentifier == tokenobject.useridentifier){
                oauthtokens[tokenindex].refreshtoken = tokenobject.refreshtoken
                oauthtokens[tokenindex].accesstoken = tokenobject.accesstoken
                oauthtokens[tokenindex].expirytime = tokenobject.expirytime
                found = 1;
            }
        }
        if(!found){
            oauthtokens.push(tokenobject);
        }
        resolve();
    })
}

module.exports = In_memory;