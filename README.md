# Node JS SDK for Zoho CRM

## Abstract

Node SDK is a wrapper for Zoho CRM APIs. Hence invoking a Zoho CRM API from your Node application is just a function call which provide the most appropriate response.

This SDK supports both single user as well as multi user authentication.

## Registering a Zoho Client

Since Zoho CRM APIs are authenticated with OAuth2 standards, you should register your client app with Zoho. To register your app:

- Visit this page https://accounts.zoho.com/developerconsole.
- Click on “Add Client ID”.
- Enter Client Name, Client Domain and Redirect URI.
- Select the Client Type as "Web based".
- Click “Create”.
- Your Client app would have been created and displayed by now.
- The newly registered app's Client ID and Client Secret can be found by clicking Options → Edit. (Options is the three dot icon at the right corner).

## Installation of Node CRM SDK

Node JS SDK will be installed and a package named 'zcrmsdk' will be created in the installation directory.

```console
npm install zcrmsdk
```

Once installed it can be used in the code as below,

```javascript
var ZCRMRestClient = require('zcrmsdk')
```

## Configurations

Your OAuth Client details should be given to the SDK as a property file. In the SDK, you need to configure a file named oauth_configuration.properties. Please place the respective values in that file. You can place it under resources/ package from where the SDK is used.

zcrmsdk will try reading file from `'resources/oauth_configuration.properties'`

Please fill the values for the following keys alone.
Based on your domain(EU,CN), please change the value of crm.iamurl. Default value set as US domain.

```ini
[zoho]
crm.iamurl=
crm.clientid=
crm.clientsecret=
crm.redirecturl=
```

`crm.clientid`, `crm.clientsecret`, and `crm.redirecturl` are your OAuth client’s configurations that you get after registering your Zoho client. `crm.iamurl` is the accounts URL. It may be `accounts.zoho.com` or `accounts.zoho.eu`. If `crm.iamurl` is not specified, the default URL will be `accounts.zoho.com`.

In `configuration.properties` file:

```ini
[crm]
api.url=
api.user_identifier=
api.tokenmanagement=

[mysql]
username=
password=
```
`api.url` is the URL used to call APIs (default `www.zohoapis.com`).
`api.user_identifier` will be empty by default. For single user authentication, this key can be filled with the respective email id so that all API calls use this user's authentication.
`api.tokenmanagement` can be used to provide an alternative token storage function. If not specified the default implementation (MySQL) will be used.
`username` and `password` are the credentials used to access MySQL
The above keys specified in `configuration.properties` file are all optional.

`user_identifier` can be set by either:
1. Specifying `api.user_identifier` in the `configuration.properties` file or
1. Via code by using set `setUserIdentifier()`

If `user_identifier` is not set the default value (`zcrm_default_user`) will be used.


## Token Storage Mechanism

To use the default token storage mechanism:
**MySQL should be running on the default port (3306) on localhost.**
Create a database named `zohooauth` with a table named `"oauthtokens"` with the columns `"useridentifier" (varchar), "accesstoken" (varchar), "refreshtoken" (varchar), and "expirytime" (bigint)`.

With this configuration in place, storage and retrieval of tokens will be handled by the SDK.

### Custom Token Storage
If you want to use another token storage mechanism, you can declare it in `configuration.properties` by specifying the respective module in `api.tokenmanagement`.

This module should contain the methods:
- `saveOAuthTokens(token_obj)`
- `updateOAuthTokens(token_obj)`
- `getOAuthTokens()` - shall return a JSON array containing `expirytime`, `refreshtoken` and `accesstoken` fields.

## Generating self-authorized grant and refresh token

For self client apps, the self authorized grant token should be generated from the Zoho Developer Console (https://accounts.zoho.com/developerconsole)

- Visit https://accounts.zoho.com/developerconsole
- Click Options → Self Client of the client for which you wish to authorize.
- Enter one or more (comma separated) valid Zoho CRM scopes that you wish to authorize in the “Scope” field and choose the time of expiry. Provide “aaaserver.profile.READ” scope along with Zoho CRM scopes.
- Copy the grant token for backup.
- Generate refresh_token from grant token by making a POST request with the URL below https://accounts.zoho.com/oauth/v2/token?code={grant_token}&redirect_uri={redirect_uri}&client_id={client_id}&client_secret={client_secret}&grant_type=authorization_code
- Copy the refresh token for backup.

Please note that the generated grant token is valid only for the stipulated time you chose while generating it. Hence, the access and refresh tokens should be generated within that time.

Each time server is restarted, this function has to be called and both the configuration files should be populated with proper values before calling this function, else exception will be thrown.

**All functions return promises in zcrm node sdk.**


## Initialize

Below snippet has to be called before starting the app

```
var ZCRMRestClient = require('zcrmsdk');

ZCRMRestClient.initialize().then(function(){

    ...

});
```

## Generating access and refresh token from granttoken

```
ZCRMRestClient.generateAuthTokens(user_identifier,grant_token).then(function(auth_response){

    console.log("access token :"+auth_response.access_token);
    console.log("refresh token :"+auth_response.refresh_token);
    console.log("expires in :"+auth_response.expires_in);

});
```

## Generating access token from refresh token

This will be handled by sdk itself if the access and refresh token is generated by sdk.Developer need not call this explicitly.

```
ZCRMRestClient.generateAuthTokenfromRefreshToken(user_identifier,refresh_token).then(function(auth_response){

    console.log("access token :"+auth_response.access_token);
    console.log("refresh token :"+auth_response.refresh_token);
    console.log("expires in :"+auth_response.expires_in);

});
```

## Sample API Calls

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



## Hierarchy
zcrmsdk

 ```
   API
     ORG
       get
     MODULES
       get
       post
       put
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
     ATTACHMENTS
       uploadFile
       deleteFile
       downloadFile
       uploadLink
       uploadPhoto
       downloadPhoto
       deletePhoto
     FUNCTIONS
       executeFunctionsInGet
       executeFunctionsInPost
 ```

As appearing in the hierarchy, zcrmsdk entity class has instance variables to fetch its own properties and to fetch data of its immediate child entities through an API call.

For example, to call an API to get module data, the request should be zcrmsdk.API.MODULES.{operation_type}. The operation types can be GET, POST, PUT, DELETE or CREATE.

## Response Handling
All API calls will give the actual API response given by Zoho APIs, except file download.

For file download, the response will contain an extra field filename.

## Error Handling:
All errors will be thrown explicitly and care should be taken to catch them.
