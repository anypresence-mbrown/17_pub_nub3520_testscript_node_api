var sails = require('sails');
var util = require('util');
var _ = require('lodash');
var authService = require('../services/auth/AuthService');

var scope = function (req) {
    var scopeName = req.query['scope'] || 'all';
    var limitParam = parseInt(req.query['limit']);
    var offsetParam = parseInt(req.query['offset']);
    var limit = isNaN(limitParam) ? null : limitParam;
    var offset = isNaN(offsetParam) ? null : offsetParam;
    sails.log.debug("scopeName " + scopeName + ", limit " + limit + ", offset " + offset);
    var scopeFunction = Device[scopeName + 'Scope'] || Device.allScope;
    sails.log.debug("scopeFunction is " + scopeName + " and query is " + util.inspect(req.query));
    return scopeFunction(req.query.query || {}, req.user || {}, offset, limit);
};

var DeviceController = {
    find: function (req, res) {
        sails.log.debug('DeviceController.find::');
        var id = req.param('id');
        sails.log.debug("req.param('id') is " + id);
        if (!id) {
            var queryScope = scope(req);
            queryScope.then(function (devices) {
                sails.log.debug("DeviceController.find::Objects of scope call are " + util.inspect(devices));
                if (authService.currentUserIsSystemAdmin(req)) {
                    for (var i = 0; i < devices.length; i++) {
                        ModelScrubber.scrub(devices[i], _.keys(Device.attributes));
                    }
                } else {
                    return res.send(403, "Unauthorized.");
                }
                sails.log.debug("DeviceController.find::Responding with devices " + util.inspect(devices));
                return res.send(200, devices);
            }).error(function (err) {
                sails.log.error("error :" + util.inspect(err));
                return res.send(500);
            });
        }
        else {
            Device.findOneById(id).then(function (obj) {
                sails.log.debug("DeviceController.find::Object of findOneById returned " + util.inspect(obj));
                if (obj === undefined) {
                    return res.send(404);
                }
                else {
                    sails.log.debug("DeviceController.find::Scrubbing non-readable fields out");
                    if (authService.requiresAuth(req) && !authService.currentUserIsSystemAdmin(req)) {
                        ModelScrubber.scrub(obj, authService.readableFields(req));
                    }
                    else {
                        ModelScrubber.scrub(obj, _.keys(Device.attributes));
                    }
                    sails.log.debug("DeviceController.find::Responding with object " + util.inspect(obj));
                    return res.send(200, obj);
                }
            }).error(function (err) {
                sails.log.error("DeviceController.find::error :" + util.inspect(err));
                return res.send(500);
            });
        }
    } //find
    ,
    unregister: function(req, res) {
        var token = req.body["identifier"]

        if (!token) {
            return res.send(400)
        }

        Device.findOne({identifier: token}).then(function (obj) {
            if (obj === undefined) {
                return res.send(422);
            } else {
                obj.destroy(function (err) {
                    if (err) {
                        sails.log.error("DeviceController.destroy::error :" + util.inspect(err));
                        return res.send(500);
                    } else {
                        // Unsubscribe the device from all channels it's subscribed to
                        Channel.find().then(function (channels) {
                            if (channels && channels.length > 0) {
                                async.each(channels, function(channel, callback) {
                                            subscriptionService.unsubscribeFromChannel(obj, channel.name).
                                            then(function(channel) {
                                                return callback();
                                            })
                                            .catch(function(err) {
                                                if (err instanceof Error) {
                                                    // Stop processing the channels and return a 500.
                                                    return callback(err);
                                                } else {
                                                    // If not an instance of Error, continue with other 
                                                    // channels.
                                                    return callback();
                                                }
                                            });
                                },
                                function(err) {
                                    if (err) {
                                        sails.log.error(util.inspect(err));
                                        return res.send(500);
                                    } else {
                                        return res.send(204);
                                    }
                                });
                            } else {
                                // No channels to process.
                                return res.send(204);
                            }
                        });
                    }
                });
            }
        });
    },
    destroy: function (req, res) {
        sails.log.debug("DeviceController.destroy::");
        var id = req.param('id') || req.url.substr(req.url.lastIndexOf("/") + 1);
        sails.log.debug("DeviceController.destroy::req.param('id') is " + id);
        if (id === undefined) {
            sails.log.debug("DeviceController.destroy::id cant be null");
            return res.send(422);
        }
        else {
            Device.findOneById(id).then(function (obj) {
                sails.log.debug("DeviceController.destroy::Find one by id pulled object " + util.inspect(obj));
                if (obj === undefined) {
                    return res.send(422);
                }
                else {
                    obj.destroy(function (err) {
                        if (err) {
                            sails.log.error("DeviceController.destroy::error :" + util.inspect(err));
                            return res.send(500);
                        }
                        else {
                            Channel.find().then(function (channels) {
                                if (channels && channels.length > 0) {
                                    var executions = 0;
                                    for (var i = 0; i < channels.length; i++) {
                                        var devicePosition = -1;
                                        if(!channels[i].devices){
                                            channels[i].devices = [];
                                        }
                                        for (var j = 0; j < channels[i].devices.length; j++) {
                                            if (channels[i].devices[j].id === id) {
                                                devicePosition = j;
                                            }
                                        }
                                        if (devicePosition != -1) {
                                            channels[i].devices.splice(devicePosition, 1);
                                            Channel.update({id: channels[i].id}, channels[i])
                                                    .then(function (obj) {
                                                        executions++;
                                                        if (executions == channels.length) {
                                                            return res.send(204);
                                                        }
                                                    })
                                                    .error(function (err) {
                                                        sails.log.error("DeviceController.destroy::error :" + util.inspect(err));
                                                        return res.send(500, err);
                                                    });
                                        } else {
                                            executions++;
                                            if (executions == channels.length) {
                                                return res.send(204);
                                            }
                                        }
                                        if (executions == channels.length) {
                                            return res.send(204);
                                        }
                                    }
                                } else {
                                    return res.send(204);
                                }
                            });
                        }
                    });
                }
            }).error(function (err) {
                sails.log.error("DeviceController.destroy::error :" + util.inspect(err));
                return res.send(500);
            });
        }
    } //destroy
    ,
    update: function (req, res) {
        sails.log.debug("DeviceController.update::");
        var updatedDevice = req.body;
        var id = req.param('id') || req.url.substr(req.url.lastIndexOf("/") + 1);

        if (!id || !req.body) return res.send(422);

        delete updatedDevice['id'];

        Device.update({id: id}, updatedDevice)
                .then(function (obj) {
                    if (obj.length === 0) return res.send(422);
                    return res.send(204);
                })
                .error(function (err) {
                    return res.send(500, err);
                });
    } //update
    ,
    create: function (req, res) {
        sails.log.debug("DeviceController.create::");
        var device = req.body;
        ModelScrubber.scrub(device, Device.attributes);

        if (!device.identifier) {
            return res.send(400);
        }

        Device.findOrCreate({identifier: device.identifier})
                .then(function (val) {
                    if (authService.requiresAuth(req) && !authService.currentUserIsSystemAdmin(req)) {
                        ModelScrubber.scrub(val, authService.readableFields(req));
                    }
                    else {
                        ModelScrubber.scrub(val, _.keys(Device.attributes));
                    }
                    Device.update({id: val.id}, device)
                        .then(function (updatedDevice) {
                            return res.send(201, device);
                        })
                        .error(function (err) {
                            return res.send(500);
                        });
                })
                .error(function (err) {
                    sails.log.debug("DeviceController.create::error : " + util.inspect(err));
                    return res.send(500, err);
                })
    } //create
    ,
    findById: function (req, res) {
        var objectId = req.url.substr(req.url.lastIndexOf("/") + 1);
        if (objectId) {
            Device.findOneById(objectId).then(function (obj) {
                sails.log.debug("DeviceController.findById::Find one by id pulled object " + util.inspect(obj));
                if (obj === undefined) {
                    return res.send(404);
                }
                else {
                    return res.send(obj);
                }
            }).error(function (err) {
                sails.log.error("DeviceController.findById::error :" + util.inspect(err));
                return res.send(500);
            });
        } else {
            return res.send(404);
        }
    } //findById
};

module.exports = DeviceController;
