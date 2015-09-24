var util = require('util');
var sails = require('sails');
var fs = require('fs');
var inflection = require('inflection');
var utilities = require('./utilities');


module.exports.routes = function () {


    //
    // The following routes are for authentication
    //
    var routes = {
        'GET /': 'AdminController.index',
        'GET /admin': 'AdminController.index',
        'GET /admin/index': 'AdminController.index',
        'GET /admin/objectCounts': 'AdminController.countAll',
        'GET /health-check': 'APHealthCheckController.healthcheck',
        'POST /auth/:strategy/callback': 'APAuthenticatedSessionsController.login',
        'PUT /auth/:strategy/callback': 'APAuthenticatedSessionsController.login',
        'GET /auth/:strategy/callback': 'APAuthenticatedSessionsController.login',
        'PATCH /auth/:strategy/callback': 'APAuthenticatedSessionsController.login',
        'DELETE /auth/:strategy/callback': 'APAuthenticatedSessionsController.login',
        
        'POST /auth/signout': 'APAuthenticatedSessionsController.logout',
        'GET /api/push_notifications/device' : 'DeviceController.find',
        'GET /api/push_notifications/device/:id' : 'DeviceController.findById',
        'DELETE /api/push_notifications/device' : 'DeviceController.destroy',
        'DELETE /api/push_notifications/device/:id' : 'DeviceController.destroy',
        'POST /api/push_notifications/device' : 'DeviceController.create',
        'POST /api/push_notifications/device/unregister' : 'DeviceController.unregister',
        'PUT /api/push_notifications/device' : 'DeviceController.update',
        'PUT /api/push_notifications/device/:id' : 'DeviceController.update',
        'GET /api/push_notifications/device/:id/channel' : 'ChannelController.findDeviceChannels',
        'GET /api/push_notifications/channel' : 'ChannelController.find',
        'GET /api/push_notifications/channel/:id' : 'ChannelController.findById',
        'DELETE /api/push_notifications/channel' : 'ChannelController.destroy',
        'DELETE /api/push_notifications/channel/:id' : 'ChannelController.destroy',
        'POST /api/push_notifications/channel' : 'ChannelController.create',
        'PUT /api/push_notifications/channel' : 'ChannelController.update',
        'PUT /api/push_notifications/channel/:id' : 'ChannelController.update',
        'POST /api/push_notifications/channel/subscribe' : 'ChannelController.subscribe',
        'POST /api/push_notifications/channel/unsubscribe' : 'ChannelController.unsubscribe',
        'GET /api/push_notifications/message' : 'MessageController.find',
        'DELETE /api/push_notifications/message' : 'MessageController.destroy',
        'POST /api/push_notifications/message' : 'MessageController.create',
        'PUT /api/push_notifications/message' : 'MessageController.update',
        'GET /api/push_notifications/message/:id' : 'MessageController.findById',
        'GET /api/activity' : 'ActivityController.find',
        'DELETE /api/activity/:id' : 'ActivityController.destroy',
        'POST /api/activity' : 'ActivityController.create',
        'PUT /api/activity' : 'ActivityController.update',
        'GET /api/activity/:id' : 'ActivityController.findById',
        'POST /api/activity/aggregate' : 'ActivityController.aggregate',
        'GET /api/info' : 'InfoController.find',

        

        // Begin Version 1
        
        "GET /api/v1/publishes/:id?.?(json)?": "V1PublishController.find",
        "POST /api/v1/publishes(.json)?": "V1PublishController.create",
        "PATCH /api/v1/publishes/:id.?(json)?": "V1PublishController.update",
        "PUT /api/v1/publishes/:id.?(json)?": "V1PublishController.update",
        "DELETE /api/v1/publishes/:id.?(json)?": "V1PublishController.destroy",
        
        // End Version 1

        // Begin Version Latest
        
        "GET /api/publishes/:id?.?(json)?": "V1PublishController.find",
        "POST /api/publishes(.json)?": "V1PublishController.create",
        "PATCH /api/publishes/:id.?(json)?": "V1PublishController.update",
        "PUT /api/publishes/:id.?(json)?": "V1PublishController.update",
        "DELETE /api/publishes/:id.?(json)?": "V1PublishController.destroy",
        
        // End Version Latest

    };

    return routes;

}();
