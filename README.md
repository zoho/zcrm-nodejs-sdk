##Node JS SDK for Zoho CRM
VERSION: 1.0.0
##Abstract

Node SDK is a wrapper for Zoho CRM APIs. Hence invoking a Zoho CRM API from your Node application is just a function call which provide the most appropriate response.

This SDK supports both single user as well as multi user authentication.

##Registering a Zoho Client

Since Zoho CRM APIs are authenticated with OAuth2 standards, you should register your client app with Zoho. To register your app:

	- Visit this page https://accounts.zoho.com/developerconsole.

	- Click on “Add Client ID”.

	- Enter Client Name, Client Domain and Redirect URI.

	- Select the Client Type as "Web based".

	- Click “Create”.

	- Your Client app would have been created and displayed by now.

	- The newly registered app's Client ID and Client Secret can be found by clicking Options → Edit. (Options is the three dot icon at the right corner).

##Installation of Node CRM SDK

Node JS SDK will be installed and a package named 'zcrmsdk' will be created in the installation directory.

>npm install zcrmsdk

Once installed it can be used in the code as below,

>var ZCRMRestClient = require('zcrmsdk')

##API Usage

##Configurations

From version 1.0.0 onwards the configurations(OAuth Client details and Configuration details) can be sent only through a JSON object. 
```
configJSON={
  "client_id":"{client_id}",
  "client_secret":"{client_secret}",
  "redirect_uri":"{redirect_uri}",
  "user_identifier":"{user_email_id}",
  "persistence_handler":"{persistence preference}"
  "token_file_path":"path/to/token",
  "iam_url":"{IAM_URL}",
  "base_url":"{api_URL}"
  "version":"{api_version}",
  "mysql_username" : "{mysql_username}",
  "mysql_password" : "{mysql_password}"
};
crmclient.initialize(configJSON);
```

client_id,client_secret,redirect_uri is mandatory, 

user identifier can be set either by passing it in the configJSON or by calling crmclient.setUserIdentifier(user_identifier);

persistence_handler key is optional and in the absence of the key,default inbuilt mysql db will be used for token storage for which the user can provide optional keys mysql_username(default:root) and mysql_password(default:"").

Persistence:
file persistence can be used by passing "file" to the persistence_handler key, token_file_path must contain the absolute path of the folder in which the oauthtokens.txt will be created or used for token related activities.
in_memory persistence can be used by passing "in_memory" to the persistence_handler key, the tokens must be generated before every session in this mode.
The user can also implement his own persistence. The path to the persistence file has to be passed to persistence_handler key. The implementation must contain saveOAuthTokens() and getOAuthTokens() method which must return promise. . getOauthTokens() must return the tokens as a JSONObject. the expected response would contain the following field:-
accesstoken,refreshtoken,expirytime and useridentifier.

base_url is the URL used to call APIs. By default, the URL is www.zohoapis.com.
iam_url the URL for token related functions. By default, the URL is accounts.zoho.com
version is the api version, By default, the version is v2.
api.user_identifier will be empty by default. For single user authentication, this key can be filled with the respective email id, so that all calls happens by using this user's authentication.

##Token Storage Mechanism

To use the default token storage provided by the SDK, the following are to be done:

**Mysql should be running in default port in localhost.**

Database with name **zohooauth** should be created and a table with below configurations should be present in the database. Table, named **"oauthtokens"**, should have the columns **"useridentifier" (varchar) "accesstoken" (varchar), "refreshtoken" (varchar) and "expirytime" (bigint)**.

Once the configuration is set, storage and retrieval of tokens will be handled by the SDK.

##Generating self-authorized grant and refresh token

For self client apps, the self authorized grant token should be generated from the Zoho Developer Console (https://accounts.zoho.com/developerconsole)


	- Visit https://accounts.zoho.com/developerconsole

	- Click Options → Self Client of the client for which you wish to authorize.

	- Enter one or more (comma separated) valid Zoho CRM scopes that you wish to authorize in the “Scope” field and choose the time of expiry. Provide “aaaserver.profile.READ” scope along with Zoho CRM scopes.
	        - Copy the grant token for backup.

	        - Generate refresh_token from grant token by making a POST request with the URL below https://accounts.zoho.com/oauth/v2/token?code={grant_token}&redirect_uri={redirect_uri}&client_id={client_id}&client_secret={client_secret}&grant_type=authorization_code

	        - Copy the refresh token for backup.

Please note that the generated grant token is valid only for the stipulated time you chose while generating it. Hence, the access and refresh tokens should be generated within that time.

Each time server is restarted, this function has to be called and both the configuration JSON should be populated with proper values before calling this function, else exception will be thrown.

**All functions return promises in zcrm node sdk.**


##Initialize 

Below snippet has to be called before starting the app

```
var ZCRMRestClient = require('zcrmsdk');
configJSON={
  "client_id":"{client_id}",
  "client_secret":"{client_secret}",
  "redirect_uri":"{redirect_uri}",
  "user_identifier":"{user_email_id}",
  "persistence_handler":"{persistence preference}"
  "token_file_path":"path/to/token",
  "iam_url":"{IAM_URL}",
  "base_url":"{api_URL}"
  "version":"{api_version}",
  "mysql_username" : "{mysql_username}",
  "mysql_password" : "{mysql_password}"
};
ZCRMRestClient.initialize(configJSON).then(function(){

    ...

});

```

##Generating access and refresh token from granttoken

```

ZCRMRestClient.generate_access_token(grant_token).then(function(token){

    console.log("access token :"+token.accesstoken);
    console.log("refresh token :"+token.refreshtoken);
    console.log("expires in :"+token.expirytime);

});

```

##Generating access token from refresh token

If the token expires and refresh token is available in the token storage, then the sdk will refresh the token by itself, however if the user wishes to refresh the token and or generate access token through it , following method can be used
```
ZCRMRestClient.generate_access_token_from_refresh_token(user_identifier,refresh_token).then(function(token){

    console.log("access token :"+token.accesstoken);
    console.log("refresh token :"+token.refreshtoken);
    console.log("expires in :"+token.expirytime);

});

```

##Sample API Calls 

```
var input ={};
input.module = "Leads";

var params = {};
params.page = 0;
params.per_page = 5;
input.params = params;

crmclient.API.MODULES.get(input).then(function(response){

    var result = "<html><body><b> Top 5 Leads</b>";
    var data = response.body;
    data = JSON.parse(data);
    data = data.data;
    for (i in data){

        var record = data[i];
        var name = record.Full_Name;
        
        result+="<br><span>"+name+"</span>";

    }

    result+="</body></html>";

})
```



##Hierarchy
zcrmsdk

 ```
   API
     ORG
       get
       getOrgTax
       createOrgTax
       updateOrgTax
       deleteOrgTax
     MODULES
       get
       create
       update
       upsert
       delete
       getAllDeletedRecords
       getRecycleBinRecords
       getPermanentlyDeletedRecords
       search
     SETTINGS
       getFields
       getLayouts
       getCustomViews
       updateCustomViews
       getModules
       getRoles
       getProfiles
       getRelatedLists
     ACTIONS
       convert
     USERS
       get
       create
       delete
       update
       search
     ATTACHMENTS
       getAttachment
       uploadAttachment
       deleteAttachment
       downloadAttachment
       uploadLink
       uploadPhoto
       downloadPhoto
       deletePhoto
     FUNCTIONS
       executeFunctionsInGet
       executeFunctionsInPost
       executeFunctionsInPut
       executeFunctionsInDelete
     NOTES
       getNotes
       addNotes
       updateNotes
       deleteNotes
       getAttachment
       uploadAttachment
       deleteAttachment
       downloadAttachment
     RELATEDLISTRECORDS
       getRelatedRecords
       addRelation
       removeRelation
     TAGS
       getTags 
       getTagCount 
       createTags
       updateTags 
       addTagsToMultipleRecords 
       removeTagsFromMultipleRecords 
       addTags 
       removeTags
       delete 
       merge
       update 
       
      
 ```


As appearing in the hierarchy, zcrmsdk entity class has instance variables to fetch its own properties and to fetch data of its immediate child entities through an API call.

For example, to call an API to get module data, the request should be zcrmsdk.API.MODULES.{operation_type}. The operation types can be GET, POST, PUT, DELETE or CREATE.



##Response Handling
All API calls will give the actual API response given by Zoho APIs, except file download.

For file download, the response will contain an extra field filename.

##Error Handling:
All errors will be thrown explicitly and care should be taken in catching the same.



