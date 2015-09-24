var assert = require('assert');
var createRequest = require('../../../utils').createRequest;
var createResponse = require('../../../utils').createResponse;
var passportStub = require ('passport-stub');
var superagent = require('superagent');
var util = require('util');
var _ = require('lodash');

var fakeUsers = {
  'admin': {"password":"password","passwordConfirmation":"password","passwordDigest":"Pseudoclassical Hippuris","role":"admin","username":"Nephritis disenablement","xSessionId":"Overfinished leontocephalous"},
  'non_admin': {"password":"password","passwordConfirmation":"password","passwordDigest":"Unapposite noncontrolled","role":"non_admin","username":"Cooperia rabid","xSessionId":"Mucedinous oxyphthalic"},
};

_.forEach(_.keys(fakeUsers), function (key) {
  fakeUsers[key].isAdmin = function(){
    return true;
  };
});

var agent, objects = [];

function createSubscribeDeviceToChannelObject(channelName, deviceId) {
  return {channelName: channelName, deviceId: deviceId};
}

function createSubscribeDeviceToChannelObjectWithProvider(channelName, deviceId, provider) {
  return {channelName: channelName, deviceId: deviceId, provider: provider};
}

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
  });
}

var callback = function() {
  done();
};

describe('Unit Tests for Channel Controller', function () {
  beforeEach(function (done){
    agent = superagent.agent();
    objects = [];
    done();
  });
  
  afterEach(function(done) {
    passportStub.logout();
    done();
  });
  
  describe('when search for an existing channel', function () {
    var channel = {
      "name": "My Test Channel"
    };
    var channelId = null;
    before(function (done) {
      var callback = function() {
        Channel.create(channel).then(function (obj) {
          channelId = obj.id;
          done();
        }).error(function (err) {
          assert.fail(err);
          done();
        });
      };
      cleanup(callback);
    });
    it('should return a representation of it with http status code 200', function (done) {
      passportStub.login(fakeUsers['admin']);
      
      agent.get("http://localhost:" + (process.env.TEST_PORT || 1337) + "/api/push_notifications/channel/" + channelId).set('Content-Type', 'application/json').end(function (err, res) {
        if (err) return done(err);
        assert.equal(res.status, 200);
        done(err);
        
      });
    });
  });
  
  describe('when no resource id provided', function () {
    var channel = {
      "name": "My Test Channel"
    };
    var response = createResponse(200, channel);
    before(function (done) {
      
      var callback = function() {
        Channel.create(channel).then(function (obj) {
          done();
        }).error(function (err) {
          assert.fail(err);
          done();
        });
      };
      cleanup(callback);
    });
    it('should return all the channels', function (done) {
      passportStub.login(fakeUsers['admin']);
      
      agent.get("http://localhost:" + (process.env.TEST_PORT || 1337) + "/api/push_notifications/channel").set('Content-Type', 'application/json').end(function (err, res) {
        if (err) return done(err);
        assert.equal(res.status, 200);
        done(err);
        
      });
    });
  });
  
  describe('when provided id does not match an existing channel', function () {
    // var response = createResponse(404, null);
    it('should return 404 and no representation', function (done) {
      var inexistentChannelId = "1556065554";
      
      agent.get("http://localhost:" + (process.env.TEST_PORT || 1337) + "/api/push_notifications/channel/" + inexistentChannelId).set('Content-Type', 'application/json').end(function (err, res) {
        if (err) return done(err);
        assert.equal(res.status, 404);
        done(err);
        
      });
    });
  });
  
  describe('when trying to destroy an existing resource', function () {
    var channel = {
      "name": "My Test Channel"
    };
    var channelId;
    before(function (done) {
      var callback = function() {
        Channel.create(channel).then(function (obj) {
          channelId = obj.id;
          done();
        }).error(function (err) {
          assert.fail(err);
          done();
        });
      };
      cleanup(callback);
    });
    it('should return 204 and no body response', function (done) {
      agent.del("http://localhost:" + (process.env.TEST_PORT || 1337) + "/api/push_notifications/channel/" + channelId).set('Content-Type', 'application/json').end(function (err, res) {
        if (err) return done(err);
        assert.equal(res.status, 204);
        done(err);
        
      });
      
    });
  });
  
  describe('when trying to update an existing resource', function () {
    var channel = {
      "name": "My Test Channel"
    };
    var updatedChannel = {
      "name": "My Test Channel Updated!!!"
    };
    var response = createResponse(204, null);
    var channelId;
    var channelName;
    before(function (done) {
      var callback = function() {
        Channel.create(channel).then(function (obj) {
          channelId = obj.id;
          done();
        }).error(function (err) {
          assert.fail(err);
          done();
        });
      };
      cleanup(callback);
      
    });
    it('should return 204 and no body response', function (done) {
      agent.put("http://localhost:" + (process.env.TEST_PORT || 1337) + "/api/push_notifications/channel/" + channelId).send(updatedChannel).set('Content-Type', 'application/json').end(function (err, res) {
        if (err) return done(err);
        assert.equal(res.status, 204);
        done(err);
        
      });
    });
    after(function(done){
      Channel.findOneById(channelId).then(function(updatedChannelObject){
        assert.equal(updatedChannelObject.name, updatedChannel.name, "Updated field must match value provided in updated representation");
        done();
      });
    });
  });
  
  describe('when trying to subscribe an existing device to a channel', function () {
    var channel = {
      "name": "My Test Channel"
    };
    var device = {
      "identifier": "bla",
      "password": "pass",
      "provider_name": "APPLE"
    };
    var response = createResponse(204, null);
    var channelId;
    var channelName;
    var deviceId;
    
    before(function (done) {
      var callback = function() {
        Channel.create(channel).then(function (createdChannel) {
          channelId = createdChannel.id;
          channelName = createdChannel.name;
          Device.create(device).then(function(createdDevice){
            deviceId = createdDevice.id;
            done();
          });
        }).catch(function (err) {
          done(err);
        });
      };
      cleanup(callback);
    });
    
    it('should return 204 and no body response', function (done) {
      agent.post("http://localhost:" + (process.env.TEST_PORT || 1337) + "/api/push_notifications/channel/subscribe").send(createSubscribeDeviceToChannelObjectWithProvider(channelName, deviceId)).set('Content-Type', 'application/json').end(function (err, res) {
        if (err) return done(err);
        assert.equal(res.status, 204);
        done(err);
        
      });
    });
    
    after(function(done){
      Channel.findOne({name: channelName})
      .then(function(updatedChannelObject){
        assert.ok(updatedChannelObject);
        assert.equal(updatedChannelObject.devices.length, 1);
        assert.equal(updatedChannelObject.devices[0].id, deviceId, "Updated channel must contain the id of the subscribed device in its representation");
        done();
      })
      .catch(function(err) {
        done(err);
      });
    });
    
    
  });
  
  describe('when missing deviceId param on subscription request', function () {
    var channel = {
      "name": "My Test Channel"
    };
    
    before(function(done) {
      var callback = function() {
        Channel.create(channel).then(function (createdChannel) { 
          done();
        });
      };
      cleanup(callback);
    });
    
    it('should return 400 bad request', function (done) {
      agent.post("http://localhost:" + (process.env.TEST_PORT || 1337) + "/api/push_notifications/channel/subscribe").send(createSubscribeDeviceToChannelObjectWithProvider(channel.name, null)).set('Content-Type', 'application/json').end(function (err, res) {
        if (err) return done(err);
        assert.equal(res.status, 400);
        done(err);        
      });
    });
    
    after(function(done){
      Channel.count().then(function(val) {
        assert.equal(val, 1);
        done();
      });
    });
  });
  
  describe('when deviceId and provider exists for subscription request', function () {
    var channel = {
      "name": "Valid"
    };
    var deviceAttributes = {
      "identifier": "bla",
      "password": "pass",
      "provider_name": "Google"
    };
    var device;
    
    before(function(done) {
      var callback = function() {
        Device.create(deviceAttributes)
          .then(function(result) {
            device = result;
            return Channel.create(channel);
          })
          .then(function(result) {
            done();
          })
          .catch(function(err) {
            done(err);
          });
      };
      cleanup(callback);
    });
    
    it('should return 204 and no body response', function (done) {
      agent.post("http://localhost:" + (process.env.TEST_PORT || 1337) + "/api/push_notifications/channel/subscribe").send(createSubscribeDeviceToChannelObjectWithProvider(channel.name, device.id, "Google")).set('Content-Type', 'application/json').end(function (err, res) {
        if (err) return done(err);
        assert.equal(res.status, 204);
        done(err);
      });
    });
    
    after(function(done){
      Channel.count().then(function(val) {
        assert.equal(val, 1);
        
        Device.findOne({id: device.id}).then(function(obj) {
          assert.equal(obj.provider_name, "Google");
          done();
        });
      });
    });
  });
  
  describe('when missing channelName param on subscription request', function () {
    var deviceName = "123";
    before(function(done) {
      var callback = function() {
        done();
      };
      cleanup(callback);
    });
    it('should return 422 and no body response', function (done) {
      agent.post("http://localhost:" + (process.env.TEST_PORT || 1337) + "/api/push_notifications/channel/subscribe").send(createSubscribeDeviceToChannelObjectWithProvider(null, deviceName, "Google")).set('Content-Type', 'application/json').end(function (err, res) {
        if (err) return done(err);
        assert.equal(res.status, 422);
        done(err);
      });
    });
    after(function(done){
      Channel.count().then(function(val) {
        assert.equal(val, 0);
        done();
      });
    });
  });
  
  describe('when missing both deviceId and channelId params on subscription request', function () {
    before(function(done) {
      var callback = function() {
        done();
      };
      cleanup(callback);
    });
    it('should return 422 and no body response', function (done) {
      //channelController.subscribe(createSubscribeDeviceToChannelRequest(null, null), response);
      agent.post("http://localhost:" + (process.env.TEST_PORT || 1337) + "/api/push_notifications/channel/subscribe").send(createSubscribeDeviceToChannelObjectWithProvider(null, null, "Google")).set('Content-Type', 'application/json').end(function (err, res) {
        if (err) return done(err);
        assert.equal(res.status, 422);
        done(err);
      });
    });
    after(function(done){
      Channel.count().then(function(val) {
        assert.equal(val, 0);
        done();
      });
    });
  });
  
  
  describe('when trying to unsubscribe an existing device from a channel', function () {
    var channelAttributes = {
      "name": "My Test Channel"
    };
    var deviceAttributes = {
      "identifier": "bla",
      "password": "pass",
      "provider_name": "APPLE"
    };
    var channel, device;
    
    before(function (done) {
      Channel.create(channelAttributes)
        .then(function (createdChannel) {
          channel = createdChannel;
          return Device.create(deviceAttributes); 
        })
        .then(function(createdDevice){
          device = createdDevice;
          channel.devices = [];
          channel.devices.push(device.id);
          done();
        })
        .catch(function(err) {
          assert.fail(err);
          done();
        });
    });
    
    it('should return 204 and no body response', function (done) {
      agent.post("http://localhost:" + (process.env.TEST_PORT || 1337) + "/api/push_notifications/channel/unsubscribe").send(createSubscribeDeviceToChannelObject(channel.name, device.id)).set('Content-Type', 'application/json').end(function (err, res) {
        if (err) return done(err);
        assert.equal(res.status, 204);
        done(err);
      });
    });
    
    after(function(done){
      
      Channel.findOneById(channel.id).then(function(updatedChannelObject){
        assert.equal(updatedChannelObject.devices.length, 0, "Updated channel must contain no devices since the only subscribed device was removed");
        done();
      });
    });
  });
  
  
  describe('when missing deviceId param on unsubscription request', function () {
    it('should return 422 and no body response', function (done) {
      var channelId = "123";
      
      agent.post("http://localhost:" + (process.env.TEST_PORT || 1337) + "/api/push_notifications/channel/unsubscribe").send(createSubscribeDeviceToChannelObject(null, null)).set('Content-Type', 'application/json').end(function (err, res) {
        if (err) return done(err);
        assert.equal(res.status, 422);
        done(err);
      });
    });
    after(function(done){
      done();
    });
  });
  
  describe('when missing channelId param on unsubscription request', function () {
    it('should return 422 and no body response', function (done) {
      var deviceId = "123";
      
      agent.post("http://localhost:" + (process.env.TEST_PORT || 1337) + "/api/push_notifications/channel/unsubscribe").send(createSubscribeDeviceToChannelObject(null, deviceId)).set('Content-Type', 'application/json').end(function (err, res) {
        if (err) return done(err);
        assert.equal(res.status, 422);
        done(err);
      });
    });
    after(function(done){
      done();
    });
  });
  
});
