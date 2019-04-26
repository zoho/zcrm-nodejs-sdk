# Node JS SDK for Zoho CRM
## Abstract

Node SDK is a wrapper for Zoho CRM APIs. Hence invoking a Zoho CRM API from your Node application is just a function call which provide the most appropriate response.

This SDK supports both single user as well as multi user authentication.

## Registering a Zoho Client
Since Zoho CRM APIs are authenticated with OAuth2 standards, you should register your client app with Zoho. To register your app:

1. Visit this page: [https://accounts.zoho.com/developerconsole](https://accounts.zoho.com/developerconsole).
2. Click on “Add Client ID”.
3. Enter Client Name, Client Domain and Redirect URI.
4. Select the Client Type as "Web based".
5. Click “Create”.
6. Your Client app would have been created and displayed by now.
7. The newly registered app's Client ID and Client Secret can be found by clicking Options → Edit (Options is the three dot icon at the right corner).

## Generating self-authorized grant and refresh token
For self client apps, the self authorized grant token should be generated from the Zoho Developer Console (https://accounts.zoho.com/developerconsole)

1. Visit https://accounts.zoho.com/developerconsole
2. Click Options → Self Client of the client for which you wish to authorize.
3. Enter one or more (comma separated) valid Zoho CRM scopes that you wish to authorize in the “Scope” field and choose the time of expiry. Provide “aaaserver.profile.READ” scope along with Zoho CRM scopes. Valid scopes can be found [here](https://www.zoho.com/crm/help/developer/api/oauth-overview.html#plink5)
3. Copy the grant token for backup.
4. Generate refresh_token from grant token by making a POST request with the URL below https://accounts.zoho.com/oauth/v2/token?code={grant_token}&redirect_uri={redirect_uri}&client_id={client_id}&client_secret={client_secret}&grant_type=authorization_code
5.  Copy the refresh token for backup.

Please note that the generated grant token is valid only for the stipulated time you chose while generating it. Hence, the access and refresh tokens should be generated within that time.

Each time server is restarted, this function has to be called and both the configuration files should be populated with proper values before calling this function, else exception will be thrown.

## Installation of Node CRM SDK
Node JS SDK will be installed and a package named 'zcrmsdk' will be created in the installation directory.

```
npm install zcrmsdk
```
Once installed it can be used in the code as below,

```
const ZCRMRestClient = require('zcrmsdk');
```

# Configuration
There are 3 ways to configure the Zoho CRM SDK. Different methods can be used simultaneously, and higher priority methods will override lower priority methods. In order of priority these methods are:
1. Declare values in a JS object passed to the `initialize` function
2. Declare values in resource configuration files
3. Declare values in environment variables

Any non-declared values will be assigned defaults, if available

## Values
The following values can be set as part of the configuration:

### client_id
`REQUIRED` The Client ID given to a registered zoho client app

### client_secret
`REQUIRED` The Client Secret given to a registered zoho client app

### redirect_url
`REQUIRED` The redirect url provided when registering a zoho client app. No requests will be made to this URL - it is used for additional security validation and much match the provided redirect url exactly

### refresh_token
`OPTIONAL` If using the Zoho CRM API in "Self Client" mode, a refresh token can be generated. This token lasts forever and can be used to generate access tokens whenever needed

### iamurl
`OPTIONAL. Default: accounts.zoho.com` The account endpoint to use for Zoho CRM operations. This endpoint is for US accounts, EU accounts can also be used by setting the value to `accounts.zoho.eu`

### base_url
`OPTIONAL. Default: www.zohoapis.com` The domain used when making requests to the zoho api. This domain defines what region to access, the default being the US region. Other available regions are:
- Europe - `www.zohoapis.eu`
- China - `www.zohoapis.com.cn`
- India - `www.zohoapis.in`

### user_identifier
`OPTIONAL. Default: zcrm_default_user` A unique identifier that can be used to differentiate access tokens within the SDK

### mysql_module
`OPTIONAL. Default: ./mysql/mysql_util` The file location of the module used to store access tokens, relative to the `node_modules/zcrmsdk/lib/js/utils.js` file. The following values can also be used to activate different pre-made token storage mechanisms:
- `local` - Tokens will be stored in-memory. This does mean that on server reset tokens will need to be regenerated. This method works best when a `refresh_token` is defined

### mysql_username
`OPTIONAL. Defailt: root` The mysql username to use when using the default (mysql) token storage module

### mysql_password
`OPTIONAL. Default: '' (The empty string)` The mysql password to use when using the default (mysql) token storage module

## JS Object Configuration
Before the Zoho CRM SDK can be used it must be initialized. This is done by calling the `initialize` function of the [ZCRMRestClient](lib/js/ZCRMRestClient.js). A JS object can optionally be passed to this initialization function that will apply values to the above variables. The keys of the provided JS object match the variable names listed above; the provided object should have the following form:
``` JSON
{
  "client_id": "required {string}",
  "client_secret": "required {string}",
  "redirect_url": "required {string}",
  "refresh_token": "optional {string}",
  "iamurl": "optional {string}",
  "base_url": "optional {string}",
  "user_identifier": "optional {string}",
  "mysql_module": "optional {string}",
  "mysql_username": "optional {string}",
  "mysql_password": "optional {string}"
};
```

## Resource File Configuration
After the JS object values are added the SDK will check for two files in the [resources](resources) directory at the root of your project, `configuration.properties` and `oauth_configuration.properties`. These files can be used interchangeably, however it is recommended that secret values be added to the Oauth configuration file and non-secret values are added to the non-oauth configuration file to avoid mistakenly uploading API credentials to your project manager

These `.properties` files follow the same format of `.ini` configuration files. See the [configuration](resources/configuration.properties) and [oauth_configuration](resources/oauth_configuration.properties) files for formatting examples. Historical aliases are also available for backwards compatibility and are defined in these example files. Note that if a variable is set along with its alias, the original variable (non-alias) will be used and the alias value will be ignored

## Environment Variable Configuration
If a value is not defined already, the system will check for environment variables to define values. All Envornment variables match the variable names listed above, with a `ZCRM__` tag preceding it. Examples:
```
ZCRM__client_id = client_id
ZCRM__base_url = base_url
ZCRM__mysql_module = mysql_module
etc...
```

## Default Token Storage

To use the default token storage provided by the SDK, the following are to be done:

**Mysql should be running in default port in localhost.**

Database with name **zohooauth** should be created and a table with below configurations should be present in the database. Table, named **"oauthtokens"**, should have the columns **"useridentifier" (varchar) "accesstoken" (varchar), "refreshtoken" (varchar) and "expirytime" (bigint)**.

Once the configuration is set, storage and retrieval of tokens will be handled by the SDK.

## Custom Token Storage
If the user wants to utilize their own token storage mechanism, they can create a token management module and add the relative path that module in the `mysql_module` configuration variable 

This module should contain the below methods. All of these modules must return a Promise:
- **saveOAuthTokens(token_obj)**
- **updateOAuthTokens(token_obj)**
		Irrespective of response, the next execution happens. So care should be taken by the user in handling their module.
- **getOAuthTokens()**
		The expected response for this method : JSON array containing json response with expirytime, refreshtoken and accesstoken fields.

# API Usage
**Note: All functions return promises in zcrm node sdk.**
## Initialize 

Below snippet has to be called before starting the app

```
let ZCRMRestClient = require('zcrmsdk');

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
let input ={};
input.module = "Leads";

let params = {};
params.page = 0;
params.per_page = 5;
input.params = params;

crmclient.API.MODULES.get(input).then(function(response){

    let result = "<html><body><b> Top 5 Leads</b>";
    let data = response.body;
    data = JSON.parse(data);
    data = data.data;
    for (i in data){

        let record = data[i];
        let name = record.Full_Name;
        
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
All errors will be thrown explicitly and care should be taken in catching the same.
