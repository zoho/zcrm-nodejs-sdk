
var mysql_util = {};
var mysql = require('mysql');
mysql_util.saveOAuthTokens = function(config_obj){
    return new Promise(function(resolve,reject){
        var con = getConnection();
        var sql = "INSERT INTO oauthtokens (useridentifier, accesstoken,refreshtoken,expirytime) VALUES ('"+config_obj.useridentifier+"','"+config_obj.accesstoken+"','"+config_obj.refreshtoken+"',"+config_obj.expirytime+")";
        mysql_util.deleteOAuthTokens(config_obj.useridentifier).then(function(){
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

mysql_util.getOAuthTokens = function(useridentifier){ 
    return new Promise(function(resolve,reject){
        var con = getConnection();
        con.connect(function(err){
            if(err) throw err;

            var sql = "Select * from oauthtokens where useridentifier = '"+useridentifier+"'";
            con.query(sql,function(err,tokens){
            if(err) {
                throw new Error(err);
                con.end();
            }
            con.end();
            resolve(tokens[0]);
            });
        });
    })
}

mysql_util.deleteOAuthTokens = function(useridentifier){
    return new Promise(function(resolve,reject){
        var con = getConnection();
        var sql = "delete from oauthtokens where useridentifier='"+useridentifier+"'";
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