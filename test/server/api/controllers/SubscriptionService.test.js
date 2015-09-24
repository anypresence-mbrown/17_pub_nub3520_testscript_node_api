var assert = require('assert');
var createRequest = require('../../../utils').createRequest;
var createResponse = require('../../../utils').createResponse;
var passportStub = require ('passport-stub');
var superagent = require('superagent');
var util = require('util');
var _ = require('lodash');
var subscriptionService = require('../../../../api/services/push_notifications/SubscriptionService')
var Promise=require('bluebird');


var fakeUsers = {
  'admin': {"password":"password","passwordConfirmation":"password","passwordDigest":"Pseudoclassical Hippuris","role":"admin","username":"Nephritis disenablement","xSessionId":"Overfinished leontocephalous"},
  'non_admin': {"password":"password","passwordConfirmation":"password","passwordDigest":"Unapposite noncontrolled","role":"non_admin","username":"Cooperia rabid","xSessionId":"Mucedinous oxyphthalic"}
};

_.forEach(_.keys(fakeUsers), function (key) {
  if (key == 'admin') {
    fakeUsers[key].isAdmin = function(){
      return true;
    };
  } else {
    fakeUsers[key].isAdmin = function(){
      return false;
    };
  }
});

var agent, objects = [];

function cleanup(callback) {
  Channel.find({}, function(err, values) {
    assert(!err);
    _.forEach(values, function(obj) {
      obj.destroy();
    });
    
    Device.find({}, function(err, values) {
      assert(!err);
      _.forEach(values, function(obj) {
        obj.destroy();
      });
      
      callback();
    });
  })
}

function createDevice(deviceId) {
  return {id: deviceId}
}

describe('Unit Tests for Subscription Services', function () {
  
  describe('When subscribing', function () {
    var channel = {
      "name": "My Test Channel"
    };
    var device = {
      "identifier": "bla",
      "password": "pass",
      "provider_name": "APPLE"
    };
    
    var deviceId ;
    before(function (done) {
      var callback = function() {
        Channel.create(channel).then(function (createdChannel) {
          channelId = createdChannel.id;
          channelName = createdChannel.name;
          Device.create(device).then(function(createdDevice){
            deviceId = createdDevice.indentifier;
            done();
          });
        }).error(function (err) {
          assert.fail(err);
          done();
        });
      };
      cleanup(callback);
    });
    it('should subscribe successfully', function (done) {
      device["id"] = deviceId;
      subscriptionService.subscribeIntoChannel(device, channelName).then(function(device) {
        done();
      }).catch(function(err) {
        assert.fail(err);
        done();
      });
      
    });
    after(function (done) {
      Channel.findOne({name: channelName}).then(function(channel){
        assert.ok(channel);
        assert.equal(channel.devices.length, 1);
        assert.equal(channel.devices[0].identifier, device.identifier, "Updated channel must contain the id of the subscribed device in its representation");
        done();
      });
    });
  });
  
  describe('When unsubscribing', function () {
    var channel = {
      "name": "My Test Channel"
    };
    var device = {
      "identifier": "bla",
      "password": "pass",
      "provider_name": "APPLE"
    };
    
    var deviceId ;
    before(function (done) {
      var callback = function() {
        Channel.create(channel).then(function (createdChannel) {
          channelId = createdChannel.id;
          channelName = createdChannel.name;
          Device.create(device).then(function(createdDevice){
            deviceId = createdDevice.indentifier;
            done();
          });
        }).error(function (err) {
          assert.fail(err);
          done();
        });
      };
      cleanup(callback);
    });
    it('should subscribe successfully', function (done) {
      device["id"] = deviceId;
      subscriptionService.subscribeIntoChannel(device, channelName).then(function(device) {
        Channel.findOne({name: channelName}).then(function(channel){
          assert.ok(channel);
          assert.equal(channel.devices.length, 1);
          assert.equal(channel.devices[0].identifier, device.identifier, "Updated channel must contain the id of the subscribed device in its representation");
          
          subscriptionService.unsubscribeFromChannel(device, channelName).then(function(device) {
            done();
          });
        });
        
      }).catch(function(err) {
        assert.fail(err);
        done();
      });
      
    });
    after(function (done) {
      Channel.findOne({name: channelName}).then(function(channel) {
        assert.equal(channel.devices.length, 0);
        done();
      });
      
    });
  });
  
});
