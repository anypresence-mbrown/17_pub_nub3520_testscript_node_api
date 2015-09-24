var sails = require('sails');
var util = require('util');
var _ = require('lodash');
var authService = require('../services/auth/AuthService');
var subscriptionService = require('../services/push_notifications/SubscriptionService')
var Promise=require('bluebird');

var scope = function (req) {
  var scopeName = req.query['scope'] || 'all';
  var limitParam = parseInt(req.query['limit']);
  var offsetParam = parseInt(req.query['offset']);
  var limit = isNaN(limitParam) ? null : limitParam;
  var offset = isNaN(offsetParam) ? null : offsetParam;
  sails.log.debug("scopeName " + scopeName + ", limit " + limit + ", offset " + offset);
  var scopeFunction = Channel[scopeName + 'Scope'] || Channel.allScope;
  sails.log.debug("scopeFunction is " + scopeName + " and query is " + util.inspect(req.query));
  return scopeFunction(req.query.query || {}, req.user || {}, offset, limit);
};

var ChannelController = {
  find: function (req, res) {
    sails.log.debug('ChannelController.find::');
    var id = req.param('id');
    sails.log.debug("ChannelController.find::req.param('id') is " + id);
    if (!id) {
      var queryScope = scope(req);
      queryScope.then(function (objs) {
        sails.log.debug("ChannelController.find::Objects of scope call are " + util.inspect(objs));
        if (authService.currentUserIsSystemAdmin(req)) {
          for (var i = 0; i < objs.length; i++) {
            ModelScrubber.scrub(objs[i], _.keys(Channel.attributes));
          }
        } else {
          return res.send(403, "Unauthorized.");
        }
        sails.log.debug("ChannelController.find::Responding with representation: " + util.inspect(objs));
        return res.send(200, objs);
      }).error(function (err) {
        sails.log.error("ChannelController.find::error :" + util.inspect(err));
        return res.send(500);
      });
    }
    else {
      Channel.findOneById(id).then(function (obj) {
        sails.log.debug("ChannelController.find::Object of findOneById returned: " + util.inspect(obj));
        if (obj === undefined) {
          return res.send(404);
        }
        else {
          sails.log.debug("ChannelController.find::Scrubbing non-readable fields out");
          if (authService.requiresAuth(req) && !authService.currentUserIsSystemAdmin(req)) {
            ModelScrubber.scrub(obj, authService.readableFields(req));
          }
          else {
            ModelScrubber.scrub(obj, _.keys(Channel.attributes));
          }
          sails.log.debug("ChannelController.find::Responding with object " + util.inspect(obj));
          return res.send(200, obj);
        }
      }).error(function (err) {
        sails.log.error("ChannelController.find::error :" + util.inspect(err));
        return res.send(500);
      });
    }
  } //find
  ,
  destroy: function (req, res) {
    sails.log.debug("ChannelController.destroy::");
    var id = req.param('id') || req.param('channelId') || req.url.substr(req.url.lastIndexOf("/") + 1);;
    sails.log.debug("req.param('id') or req.param('channelId') is " + id);
    if (id === undefined) {
      res.send(422);
    }
    else {
      Channel.findOneById(id).then(function (obj) {
        sails.log.debug("ChannelController.destroy::Find one by id pulled object " + util.inspect(obj));
        if (obj === undefined) {
          res.send(422);
        }
        else {
          obj.destroy(function (err) {
            if (err) {
              sails.log.error("ChannelController.destroy::error :" + util.inspect(err));
              res.send(500);
            }
            else {
              res.send(204);
            }
          });
        }
      }).error(function (err) {
        sails.log.error("ChannelController.destroy::error :" + util.inspect(err));
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
    Channel.update({id: id}, reqObj)
    .then(function (obj) {
      if (obj.length === 0) return res.send(422);
      return res.send(204);
    })
    .error(function (err) {
      return res.send(500, err);
    });
  } //update
  ,
  
  subscribe: function (req, res) {
    var deviceId = req.param('deviceId');
    var channelName = req.param('channelName');
    var channelId = req.param('channelId');
    var deviceProvider = req.param('provider');
    
    if (!(channelId || channelName)) {
      return res.send(422);
    }
    
    Device.findOne({id: deviceId})
      .then(function (device) {
        if (!device) return res.send(400);
        
        if (authService.requiresAuth(req) && !authService.currentUserIsSystemAdmin(req)) {
          ModelScrubber.scrub(device, authService.readableFields(req));                 
        }  else {
          ModelScrubber.scrub(device, _.keys(Device.attributes));
        }
        
        subscriptionService.subscribeIntoChannel(device, channelName)
          .then(function(device) {
            if (!device.provider_name && _.isEmpty(device.provider_name)) {
              device.provider_name = deviceProvider || 'Apple';
              Device.update({id: device.id}, device)
              .then(function (updatedDevice) {
                return res.send(204);
              })
              .error(function (err) {
                return res.send(500);
              });
            } else {
              return res.send(204);
            }
          })
          .catch(function(err) {
            console.log('shit  blew up:');
            console.log(err);
            return res.send(500);
          });
      })
      .catch(function(err) {
        return res.send(500);
      });
  }, //subscribe
  
  unsubscribe: function (req, res) {
    sails.log.debug("ChannelController.unsubscribe::");
    var deviceId = req.param('deviceId');
    var channelId = req.param('channelId');
    var channelName = req.param('channelName');
    
    if (!deviceId || !(channelId || channelName)) {
      return res.send(422);
    }
    
    Device.findOne({id: deviceId}).then(function (device) {
      if (device === undefined) {
        sails.log.debug("ChannelController.unsubscribe::Does not exist a device with provided Id: " + util.inspect(device));
        return res.send(422);
      }
      else {
        sails.log.debug("ChannelController.unsubscribe::Scrubbing non-readable fields out");
        if (authService.requiresAuth(req) && !authService.currentUserIsSystemAdmin(req)) {
          ModelScrubber.scrub(device, authService.readableFields(req));
        }
        else {
          ModelScrubber.scrub(device, _.keys(Device.attributes));
        }
        sails.log.debug("Responding with object " + util.inspect(device));
        
        subscriptionService.unsubscribeFromChannel(device, channelName).
        then(function(device) {
          return res.send(204);
        })
        .catch(function(err) {
          if (err instanceof Error) {
            return res.send(500);
          } else {
            console.log("Error is: " + err);
            return res.send(422);
          }
        });
      }
    }).error(function (err) {
      sails.log.error("ChannelController.unsubscribe::error :" + util.inspect(err));
      return res.send(500);
    });
  }, //unsubscribe
  
  create: function (req, res) {
    sails.log.error("ChannelController.create::");
    var channel = req.body;
    if (!channel) return res.send(404);
    ModelScrubber.scrub(channel, Channel.attributes);
    Channel.create(channel)
    .then(function (val) {
      if (authService.requiresAuth(req) && !authService.currentUserIsSystemAdmin(req)) {
        ModelScrubber.scrub(val, authService.readableFields(req));
      }
      else {
        ModelScrubber.scrub(val, _.keys(Channel.attributes));
      }
      res.send(201, val);
    })
    .error(function (err) {
      return res.send(500, err);
    })
  } //create
  ,
  findDeviceChannels: function (req, res) {
    var id = req.param('id');
    if (id) {
      Device.findOneById(id).then(function (device) {
        sails.log.debug("DeviceController.findDeviceChannels::Find channels to which a device is subscribed to");
        if (device === undefined) {
          return res.send(404);
        }
        else {
          Channel.native(function (err, collection) {
            collection.aggregate(
              {$match: {"devices.identifier": device.identifier}},
              function (err, channels) {
                if (err) return res.send(500, err);
                return res.send(200, channels);
              })
          });
        }
      }).error(function (err) {
        sails.log.error("DeviceController.findDeviceChannels::error :" + util.inspect(err));
        return res.send(500);
      });
    } else {
      return res.send(404);
    }
  }, //findDeviceChannels
  findById: function (req, res) {
    var objectId = req.url.substr(req.url.lastIndexOf("/") + 1);
    if (objectId) {
      Channel.findOneById(objectId).then(function (obj) {
        sails.log.debug("ChannelController.findById::Find one by id pulled object " + util.inspect(obj));
        if (obj === undefined) {
          res.send(404);
        }
        else {
          return res.send(obj);
        }
      }).error(function (err) {
        sails.log.error("ChannelController.findById::error :" + util.inspect(err));
        return res.send(500);
      });
    } else {
      return res.send(404);
    }
  } //findById
};

module.exports = ChannelController;
