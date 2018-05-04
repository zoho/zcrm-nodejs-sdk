
var mysql_util = {};
var mysql = require('mysql');

mysql_util.saveOAuthTokens = function(config_obj){

return new Promise(function(resolve,reject){
  
    var con = getConnection();

    var sql = "INSERT INTO oauthtokens (useridentifier, accesstoken,refreshtoken,expirytime) VALUES ('"+config_obj.user_identifier+"','"+config_obj.access_token+"','"+config_obj.refresh_token+"',"+config_obj.expires_in+")";

    mysql_util.deleteOAuthTokens().then(function(){

    con.connect(function(err){

    if(err){
        throw new Error(err);
    }

    con.query(sql,function(err,result){

    if (err) {
        throw new Error(err);
        con.end();
    }

    con.end();

    resolve();

    })


})
    
})
    
})
}

mysql_util.getOAuthTokens = function(){ 

    return new Promise(function(resolve,reject){

        var con = getConnection();

        var crmclient = require('../ZCRMRestClient');
        con.connect(function(err){

            if(err) throw err;

        var sql = "Select * from oauthtokens where useridentifier = '"+crmclient.getUserIdentifier()+"'";

        con.query(sql,function(err,result){

        if(err) {
            throw new Error(err);
            con.end();
        }

        con.end();

        resolve(result);
        });

    });
    })
  
}

mysql_util.updateOAuthTokens = function(config_obj){

    
    return new Promise(function(resolve,reject){

    var con = getConnection();
    var crmclient = require('../ZCRMRestClient');
        
    con.connect(function(err){

        if(err) throw err;

    var sql = "update oauthtokens set accesstoken = '"+config_obj.access_token+"' , expirytime="+config_obj.expires_in+" where useridentifier = '"+crmclient.getUserIdentifier()+"'";

    con.query(sql,function(err,result){
        
        if(err) {
            throw new Error(err);
            con.end();
        }

        con.end();

        resolve(result);

    })
})  
});
}


mysql_util.deleteOAuthTokens = function(){

    return new Promise(function(resolve,reject){

        var con = getConnection();

        var crmclient = require('../ZCRMRestClient');

        var sql = "delete from oauthtokens where useridentifier='"+crmclient.getUserIdentifier()+"'";

        con.connect(function(err){

            if(err) throw err;
        
        con.query(sql,function(err,result){

            if(err) {
                throw new Error(err);
            }

            con.end();
            
            resolve(result);
        })


    })
})

}


function getConnection(){

    var crmclient = require('../ZCRMRestClient');
    var con = mysql.createConnection({

            host: "localhost",
            user: crmclient.getMySQLUserName(),
            password: crmclient.getMYSQLPassword(),
            database: "zohooauth"

        });

        return con;

}

module.exports = mysql_util;