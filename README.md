# Overview

This is the documentation for the application "pubnub".

### Current Version: 1

Supported versions: 
    * Version 1 at /api/v1 OR /api 

Roles: 
    * unauthenticated 
    * authenticated_without_role 

Storage interfaces: 
    * AnyPresence Storage (Local) 
    * PubNub (Http) 


# Installation

## Node and NPM

The link at the bottom of this section contains all the installers for node.
Check this application's package.json file in the root directory for the correct
version to run against. It will be in the "engines" section, like so:

```json
"engines": {
  "node": "0.12.6",
  "npm": "2.11.2"
},

```

From the above example, you would find the v0.12.6 installer for your platform
and use that to setup node. Please note that the installer also includes NPM and
should already be the correct version listed in the pacakge.json.

### [Node Distributables](https://nodejs.org/dist/)

## Dependencies

Once you have node and NPM installed, you can install the global dependencies
required by the application as well as all the local dependencies the application
requires to run. All of those commands should be executed from the application's
root directory, unless noted otherwise.

First, install grunt-cli in order to execute grunt tasks:

```
npm install grunt-cli -g
```

Next, install all of the application's local dependencies. This could take a while
as it downloads and compiles all dependencies.

```
npm install
```

Please not that if you're using local storage you will need to install MongoDB
and have it running on your system locally. Visit the link below for
instructions on setting up MongoDB for your platform:

### [MongoDB Installation Instructions](http://docs.mongodb.org/manual/installation/)

## Setup

Everything should be in place to run the application. First, we'll need to seed
the initial database with the admin account. Execute the following command:

```
grunt seed
```

Once that has finished, you can locate your default username and password by
executing the following command (on Linux or Mac OS):

```
grep -A1 email tasks/config/createAdmin.js
```

Which should produce something like:

```
email: "test@fizz.com",
password: "a9c6bd1ac688b671"
```

Otherwise, the fields are located in the file:

```
tasks/config/createAdmin.js
```

## Startup

To start the server simply execute:

```
node app
```

And browse to:

### http://localhost:1337/admin

You can also adjust environment variables when executing the app. For example,
you can adjust the port by executing:

```
PORT=1338 node app
```

You can also use this to execute the app in **production** vs **development**
mode.

```
NODE_ENV=production node app
```

Providing no argument for NODE_ENV starts the app in **development** mode by default.

The sails framework can also be started in interactive mode with a console.
To use the console, first make sure that the application isn't running.
Then, execute the following command:

```
npm run-script console
```


## Testing

To run the application's test suite, execute the following command:

```
npm test
```

You can add custom API test files to:

```
test/server/
```

Any tests in this folder will be included in the test suite.

# API Consumption
## Publish
   **/api/v1/publishes** OR **/api/publishes**

Example payload:
```
{"channel":"Unquestionable pretentiousness","message":"Pasturing wandering","pubkey":"Proxy misinterpreting","sig":"Lithium coddled","subkey":"Nascent parishioners","timestamp":"Breathtaking misinterpreting"}```

### Create
To create a Publish, make a POST like below using a body similar
to the example payload.

```
POST /api/publishes
```

If you want to create a Publish in your custom code:

```javascript
/* First parameter is the name of the action you'd like to execute.
 * params are additional URL parameters that you'd like to send with the outgoing request.
 * values should be an object containing the fields for the new object.
 * context is the request context used for interpolating values within the call, this is
 *  always req.context
 * The last parameter is an error first callback function.
 */
V1Publish.request('create', params, values, req.context, function(err, result) {
  if (err) {
    // Handle error
  } else {
    // result is the created object
  }
});
```

### Read
To request a specific Publish object, make a GET using the following
URL:

```
GET /api/publishes/<id>
```

Replace "id" with the id value for the object.

The read route also supports scopes, both custom and default. To learn more about
execute scopes see the section below.

If you want to find a Publish in your custom code:

```javascript
/* First parameter is the name of the action you'd like to execute.
 * params are additional URL parameters that you'd like to send with the outgoing request.
 * values should be an object containing the fields for the new object - not used in read calls.
 * context is the request context used for interpolating values within the call, this is
 *  always req.context
 * The last param is an error first callback function.
 */
var params = { limit: 10 };
V1Publish.request('read', params, values, req.context, function(err, result) {
  if (err) {
    // Handle error
  } else {
    // result is the found object
  }
});
```

### Update
To update an object, make PUT or POST to the following URL:

```
PUT or POST /api/publishes/<id>
```

Replace "id" with the id value for the object.
The body of the call should contain the new values.

If you want to update a Publish in your custom code:

```javascript
/* First parameter is the name of the action you'd like to execute.
 * params are additional URL parameters that you'd like to send with the outgoing request.
 * values should be an object containing the fields to be updated.
 * context is the request context used for interpolating values within the call, this is
 *  always req.context
 * The last param is an error first callback function.
 */
V1Publish.request('update', params, values, req.context, function(err, result) {
  if (err) {
    // Handle error
  } else {
    // result is the updated object
  }
});
```

### Destroy
To destroy an object, make a DELETE to the following URL:

```
DELETE /api/publishes/<id>
```

Replace "id" with the id value for the object.

If you want to destroy a Publish in your custom code:

```javascript
/* First parameter is the name of the action you'd like to execute.
 * params are additional URL parameters that you'd like to send with the outgoing request.
 * values should be an object containing the fields for the new object - not used in delete calls.
 * context is the request context used for interpolating values within the call, this is
 *  always req.context
 * The last param is an error first callback function.
 */
V1Publish.request('delete', params, values, req.context, function(err) {
  if (err) {
    // Handle error
  }
});
```

### Scopes

Available scopes for Publish:

Name | Javascript Name | Description  
-----|-----------------|--------------
all | allScope | Returns all instances  
exact_match | exactMatchScope | Returns all instances that match the provided fields exactly  
count | countScope | Counts all instances  
count_exact_match | countExactMatchScope | Counts all instances that match the provided fields exactly  

To execute a scope query:

```
GET /api/publishes?scope=<scope_name>
```

Replace "scope_name" with the value in the name column in the above table. Some scopes
may require additional query parameters, for example:

```
GET /api/publishes?scope=custom&query[first_name]=bob
```

Use query[field] pattern to send a value to the scope operation.

## Push Notifications

### Messages

Verb | Path | Description | Body |
-----|------|-------------|------|
POST | /api/push_notifications/message | Creates a message | { "channel":"MyChannel", "badge":"myBadge", "alert":"myAlert", "payload":"myPayload" }  |
GET | /api/push_notifications/message | Gets the collection of existing messages | |  
PUT | /api/push_notifications/message | Updates a given message | { time:"10/10/2014", receiver:"1234", is_channel:true, apple_badge:"3", apple_alert:"\uD83D\uDCE7 \u2709 You have a new message", apple_sound:"ping.aiff", apple_expiry:"3600", google_collapseKey: "key", google_delayWhileIdle:false, google_timeToLive:"3600", payload:"Hello there!" } |
DELETE | /api/push_notifications/message | Deletes a given message | { "id": "549049e9cd339cf576028a17" }

### Channels

Verb | Path | Description | Body |
-----|------|-------------|------|
POST | /api/push_notifications/channel | Creates a channel | { "name":"MyChannelName" } |
GET | /api/push_notifications/channel | Gets a collection of existing channels |  |
GET | /api/push_notifications/channel/:id | Gets a channel by id | |
PUT | /api/push_notifications/channel | Updates a given channel | { "name":"MyChannelNameUpdated", "id":1234 } |
DELETE | /api/push_notifications/channel | Deletes a channel by id | { "id":1234 } |
POST | /api/push_notifications/channel/subscribe | Subscribe given device to channel | { "deviceId":"548efb930f658fdf1db21b40", "channelId":"54903e8c265377b94a062be1" } |
POST | /api/push_notifications/channel/unsubscribe | Unsubscribe given device from channel | { "deviceId":"548efb930f658fdf1db21b40", "channelId":"54903e8c265377b94a062be1" } |

### Devices

Verb | Path | Description | Body |
-----|------|-------------|------|
POST | /api/push_notifications/device | Creates a device | { "identifier": "FFxxFF1", "password": "xxxxxxx", "provider_name": "dsfsdfsdfsdfsdfsdfsdf" } |
GET | /api/push_notifications/device | Gets a collection of existing devices | |
GET | /api/push_notifications/device/:id | Gets a given device by id | |
