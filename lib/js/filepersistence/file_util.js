const fs = require('fs');
var crmclient = require('../ZCRMRestClient');
var file_persistence = {};
file_persistence.saveOAuthTokens = function(config_obj){
    return new Promise(function(resolve,reject){
        file_persistence.updateOAuthTokens(config_obj).then(function(){
           resolve();
        })
    })
}

file_persistence.getOAuthTokens = function(user_identifier){ 
    return new Promise(function(resolve,reject){
        var found = 0;
        if (fs.existsSync(crmclient.getTokenFilePath() + '/zcrm_oauthtokens.txt')){
            var token_as_string = fs.readFileSync(crmclient.getTokenFilePath() + '/zcrm_oauthtokens.txt', 'utf8');
            tokens = JSON.parse(token_as_string);
            for(token in tokens.tokens){
                if(tokens.tokens[token].useridentifier == user_identifier){
                    resolve(tokens.tokens[token]);
                    found = 1;
                }
            }
            if(found == 0){
                resolve();
            }
        }
    })
}

file_persistence.updateOAuthTokens = function(tokenobject){
    return new Promise(function(resolve,reject){
        var tokens = {}
        if (fs.existsSync(crmclient.getTokenFilePath() + '/zcrm_oauthtokens.txt')){
            var token_as_string = fs.readFileSync(crmclient.getTokenFilePath() + '/zcrm_oauthtokens.txt', 'utf8');
            tokens = JSON.parse(token_as_string);
            for(token in tokens.tokens){
               
                if(tokens.tokens[token].useridentifier == tokenobject.useridentifier){
                    tokens.tokens.splice(token)
                }
            }
            tokens.tokens.push(tokenobject);
        }
        else{
            tokens.tokens = [tokenobject]
        }
        token_as_string = JSON.stringify(tokens);
        fs.writeFile(crmclient.getTokenFilePath() + '/zcrm_oauthtokens.txt', token_as_string, function (err) {
            if (err) throw err;
            resolve();
        });
    })
}

module.exports = file_persistence;