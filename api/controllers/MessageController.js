var sails = require('sails');
var util = require('util');
var _ = require('lodash');
var authService = require('../services/auth/AuthService');
var Messaging = require('../messaging/messaging');
var availableProviders = require('../messaging/provider/providers').availableProviders;


var scope = function (req) {
    var scopeName = req.query['scope'] || 'all';
    var limitParam = parseInt(req.query['limit']);
    var offsetParam = parseInt(req.query['offset']);
    var limit = isNaN(limitParam) ? null : limitParam;
    var offset = isNaN(offsetParam) ? null : offsetParam;
    sails.log.debug("scopeName " + scopeName + ", limit " + limit + ", offset " + offset);
    var scopeFunction = Message[scopeName + 'Scope'] || Message.allScope;
    sails.log.debug("scopeFunction is " + scopeName + " and query is " + util.inspect(req.query));
    return scopeFunction(req.query.query || {}, req.user || {}, offset, limit);
};

var MessageController = {
    find: function (req, res) {
        sails.log.debug('MessageController.find::');
        var id = req.param('id');

        if (id === undefined) {
            var queryScope = scope(req);
            if (!authService.currentUserIsSystemAdmin(req)) {
                return res.send(403, "Unauthorized.");
            }
            queryScope.then(function (objs) {
                sails.log.debug("MessageController.find::Objects of scope call are " + util.inspect(objs));
                for (var j = 0; j < objs.length; j++) {
                    ModelScrubber.scrub(objs[j], _.keys(Message.attributes));
                }
                sails.log.debug("MessageController.find::Responding with objs " + util.inspect(objs));
                return res.json(objs);
            }).error(function (err) {
                sails.log.error("MessageController.find::error :" + util.inspect(err));
                return res.send(500);
            });
        }
        else {
            Message.findOneById(id).then(function (obj) {
                sails.log.debug("MessageController.find::Object of findOneById returned " + util.inspect(obj));
                if (obj === undefined) {
                    return res.send(404);
                }
                else {
                    sails.log.debug("MessageController.find::Scrubbing non-readable fields out");
                    if (authService.requiresAuth(req) && !authService.currentUserIsSystemAdmin(req)) {
                        ModelScrubber.scrub(obj, authService.readableFields(req));
                    }
                    else {
                        ModelScrubber.scrub(obj, _.keys(Message.attributes));
                    }
                    sails.log.debug("MessageController.find::Responding with object " + util.inspect(obj));
                    return res.send(200, obj);
                }
            }).error(function (err) {
                sails.log.error("MessageController.find::error :" + util.inspect(err));
                return res.send(500);
            });
        }
    } //find
    ,
    destroy: function (req, res) {
        sails.log.debug("MessageController.destroy");
        var id = req.param('id');
        sails.log.debug("MessageController.find::req.param('id') is " + id);
        if (id === undefined) {
            res.send(404);
        }
        else {
            Message.findOneById(id).then(function (obj) {
                sails.log.debug("MessageController.find::Find one by id pulled object " + util.inspect(obj));
                if (obj === undefined) {
                    res.send(404);
                }
                else {
                    obj.destroy(function (err) {
                        if (err) {
                            sails.log.error("MessageController.find::error :" + util.inspect(err));
                            res.send(500);
                        }
                        else {
                            res.send(204);
                        }
                    });
                }
            }).error(function (err) {
                sails.log.error("MessageController.find::error :" + util.inspect(err));
                return res.send(500);
            });
        }
    } //destroy
    ,
    update: function (req, res) {
        var reqObj = req.body;
        var id = req.param('id');
        if (!id) return res.send(422);
        delete reqObj['id'];
        Message.update({id: id}, reqObj)
                .then(function (obj) {
                    if (obj.length === 0) return res.send(204);
                    return res.send(204);
                })
                .error(function (err) {
                    return res.send(500, err);
                });
    } //update
    ,
    create: function (req, res) {
        sails.log.debug("MessageController.create::");
        // 1. Let's check if the receiver of the message is a channel or not. If it's a channel, we will need to call Channel
        // controller in order to obtain the devices attached to it.
        if (req.body.is_channel) {
            var lookup = {}
            if (req.body.receiver) {
                lookup["id"] = req.body.receiver;
            } else if (req.body.channelName) {
                lookup["name"] = req.body.channelName;
            }
            Channel.findOne(lookup).then(function (channel) {
                sails.log.debug("MessageController.create::Channel object returned: " + util.inspect(channel));
                if (channel === undefined) {
                    sails.log.debug("Requested Channel used for creating message does not exist");
                    return res.send(404);
                }
                else {
                    sails.log.debug("Scrubbing non-readable fields out of given Channel");
                    // 2. Next, we have to create the message object that is going to be persisted
                    var message = transformMessage(req.body);
                    var returnedDevices = [];
                    ModelScrubber.scrub(message, Message.attributes);
                    Message.create(message)
                            .then(function (val) {
                                if (!channel.devices) {
                                    res.send(201, val);
                                }
                                var executions = 0;
                                for (var i = 0; i < channel.devices.length; i++) {
                                    // 3. Let's iterate through devices subscribed to the channel to send the given message
                                    Device.findOneById(channel.devices[i].id).then(function (device) {
                                        sails.log.debug("MessageController.create::Object of findOneById returned " + util.inspect(device));
                                        if (device === undefined) {
                                            return res.send(422);
                                        } else {
                                            returnedDevices.push(device);
                                            executions++;
                                        }
                                        if (executions == channel.devices.length) {
                                            for (var j = 0; j < availableProviders.length; j++) {
                                                var providerDevices = returnedDevices.filter(function (d) {
                                                    return d.provider_name.toUpperCase() === availableProviders[j];
                                                });
                                                message.receiver = providerDevices;
                                                // 4. Sending filtered message per provider to the messaging API
                                                try {
                                                    Messaging.getMessagingApi(availableProviders[j]).sendMessage(message.payload, message);
                                                } catch(ex) {
                                                    sails.log.error("Unable to send message: " + util.inspect(ex));
                                                    // TODO: The message should be appear in the UI as well
                                                }
                                            }
                                            if (!channel.messages) {
                                                channel.messages = [];
                                            }
                                            channel.messages.push(val.id);
                                            Channel.update({id: channel.id}, channel).then(function(obj){
                                                res.send(201, val);
                                            }).error(function (err) {
                                                sails.log.error("MessageController.create::error :" + util.inspect(err));
                                                return res.send(500);
                                            });
                                        }
                                    }).error(function (err) {
                                        sails.log.error("MessageController.create::error :" + util.inspect(err));
                                        return res.send(500);
                                    })
                                }
                            })
                            .error(function (err) {
                                return res.send(500, err);
                            });
                }
            }).error(function (err) {
                sails.log.error("MessageController.create::error :" + util.inspect(err));
                return res.send(500);
            });
        }
        else {
            // This is the case when a message is directly sent to a particular, specific device
            var message = transformMessage(req.body);
            ModelScrubber.scrub(message, Message.attributes);
            Message.create(message)
                    .then(function (val) {
                        Device.findOneById(req.body.receiver).then(function (device) {
                            sails.log.debug("MessageController.create::Object of findOneById returned " + util.inspect(device));
                            if (device === undefined) {
                                return res.send(422);
                            }
                            else {
                                message.receiver = [device];
                                Messaging.getMessagingApi(device.providerName).sendMessage(message.payload, message);
                                res.send(201, val);
                            }
                        }).error(function (err) {
                            sails.log.error("MessageController.create::error :" + util.inspect(err));
                            return res.send(500);
                        })
                    }).error(function (err) {
                        sails.log.error("MessageController.create::error :" + util.inspect(err));
                        return res.send(500);
                    }); //createchannel
        }
    },
    findById: function (req, res) {
        var objectId = req.url.substr(req.url.lastIndexOf("/") + 1);
        if (objectId) {
            Message.findOneById(objectId).then(function (obj) {
                sails.log.debug("DeviceController.findById::Find one by id pulled object " + util.inspect(obj));
                if (obj === undefined) {
                    res.send(404);
                }
                else {
                    return res.send(obj);
                }
            }).error(function (err) {
                sails.log.error("MessageController.findById::error :" + util.inspect(err));
                return res.send(500);
            });
        } else {
            return res.send(404);
        }
    } //findById
};

/**
 * Given a request body, transform it to a message object
 * @param requestBody the request body
 * @returns {
 *  {
 *    time: number,
 *    alert: (invalidMessagingConfigurationAlertNotString.configuration.apple_alert|*|exports.attributes.apple_alert|transformAttributesForExactMatch.apple_alert),
 *    badge: (invalidMessagingConfigurationObjectBadgeNotNunber.configuration.apple_badge|*|exports.attributes.apple_badge|transformAttributesForExactMatch.apple_badge),
 *    sound: (invalidMessagingConfigurationSoundNotString.configuration.apple_sound|*|exports.attributes.apple_sound|transformAttributesForExactMatch.apple_sound),
 *    collapseKey: (*|collapseKey|Message.collapseKey), delayWhileIdle: (*|delayWhileIdle|Message.delayWhileIdle), timeToLive: (*|timeToLive|Message.timeToLive),
 *    apiKey: *,
 *    receiver: (*|exports.attributes.receiver|transformAttributesForExactMatch.receiver),
 *    is_channel: (*|exports.attributes.is_channel|transformAttributesForExactMatch.is_channel),
 *    expiry: (*|applePushNotification.Notification.expiry|number),
 *    payload: *
 *  }
 *  }
 */
function transformMessage(requestBody) {
    return {
        "time": new Date().getTime(),
        "apple_alert": requestBody.apple_alert || requestBody.alert,
        "apple_badge": requestBody.apple_badge || requestBody.badge,
        "apple_sound": requestBody.apple_sound || requestBody.sound,
        "apple_expiry": requestBody.expiry || requestBody.apple_expiry,
        "apple_content_available": requestBody.apple_content_available || requestBody.content_available,
        "google_collapseKey": requestBody.collapseKey || requestBody.google_collapseKey,
        "google_delayWhileIdle": requestBody.delayWhileIdle || requestBody.google_delayWhileIdle,
        "google_timeToLive": requestBody.timeToLive || requestBody.google_timeToLive,
        "google_apiKey": requestBody.apiKey || requestBody.google_apiKey,
        "receiver": requestBody.receiver,
        "is_channel": requestBody.is_channel,
        "payload": requestBody.payload
    }
}

module.exports = MessageController;
