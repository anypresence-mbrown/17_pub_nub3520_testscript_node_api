var sails = require('sails');
var util = require('util');
var _ = require('lodash');
var authService = require('../auth/AuthService');
var Promise=require('bluebird');

module.exports = {
  unsubscribeFromChannel: function(device, channelName)  {
    return new Promise(function(resolve, reject) {
      Channel.findOne({name: channelName}).then(function (channel) {
        if (channel === undefined) {
          sails.log.debug("ChannelController.unsubscribe::Scrubbing non-readable fields out");
          reject("Channel doesn't exist");
        }
        else {
          if(!channel.devices){
            channel.devices = [];
          }
          channel.devices = channel.devices.filter(function (iteratedDevice) {
            return iteratedDevice.id !== device.id;
          });
          Channel.update({id: channel.id}, channel)
          .then(function (updatedChannel) {
            if (updatedChannel.length === 0) return reject("Unable to unsubscribe");
            resolve(channel);
          })
          .error(function (err) {
            reject(err);
          });
        }
      });
    });
  },
  
  subscribeIntoChannel: function(device, channelName) {
    return new Promise(function(resolve, reject){
      sails.log.debug("ChannelController.subscribe::Scrubbing non-readable fields out");
      sails.log.debug("ChannelController.subscribe::Responding with representation " + util.inspect(device));
      
      Channel.findOne({name: channelName}).then(function (channel) {
        sails.log.debug("ChannelController.subscribe::Does not exist a Channel with that id: " + util.inspect(channel));
        if (channel) {
          var elementAlreadyExists = _.find(channel.devices, function(channelDevices) { return channelDevices.id == device.id });
          if(!elementAlreadyExists){
            if(!channel.devices){
              channel.devices = [];
            }
            channel.devices.push(device);
            Channel.update({name: channelName}, channel)
            .then(function (updatedChannel) {
              sails.log.debug("Successfully updated channel " + channel.name + " . Added device with identifier: " + device.identifier);
              resolve(device);
            })
            .error(function (err) {
              console.log("Unable to update the channel.");
              reject(err);
            });
          } else {
            console.log("Device already subscribed");
            resolve(device);
          }
        } else {
          reject("ILLEGAL STATE: Channel " + channelName + " is not valid.");
        }
      }).error(function (err) {
        sails.log.error("ChannelController.subscribe::error :" + util.inspect(err));
        reject(err);
      });  
    });
    
  },
  
  
}
