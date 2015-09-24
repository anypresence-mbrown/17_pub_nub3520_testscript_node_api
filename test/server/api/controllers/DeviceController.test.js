var assert = require('assert');
var createRequest = require('../../../utils').createRequest;
var createResponse = require('../../../utils').createResponse;
var passportStub = require ('passport-stub');
var superagent = require('superagent');
var util = require('util');
var _ = require('lodash');


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

function createDevice(deviceId) {
    return {id: deviceId}
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
    })
}



describe('Unit Tests for Device Controller', function () {
    beforeEach(function (done){
      agent = superagent.agent();
      objects = [];
      done();
    });

    afterEach(function(done) {
      passportStub.logout();
      done();
    });

    describe('when search for an existing device', function () {
        var device = {
            "identifier": "bla",
            "password": "pass",
            "provider_name": "APPLE"
        };

        var deviceId = null;
        before(function (done) {
            Device.create(device).then(function (obj) {
                deviceId = obj.id;
                done();
            }).error(function (err) {
                assert.fail(err);
                done();
            });
        });
        it('should return a representation of it with http status code 200', function (done) {
            passportStub.login(fakeUsers['admin']);

            agent.get("http://localhost:" + (process.env.TEST_PORT || 1337) + "/api/push_notifications/device").set('Content-Type', 'application/json').end(function (err, res) {
                if (err) return done(err);
                assert.equal(res.status, 200);
                done(err);

            });
        });
        after(function(done){
            done();
        });
    });

    describe('when no resource id provided', function () {
        var device = {
            "identifier": "bla",
            "password": "pass",
            "provider_name": "APPLE"
        };
        var response = createResponse(200, device);
        before(function (done) {
            Device.create(device).then(function (obj) {
                done();
            }).error(function (err) {
                assert.fail(err);
                done();
            });
        });
        it('should return all the devices', function (done) {
            passportStub.login(fakeUsers['admin']);
            agent.get("http://localhost:" + (process.env.TEST_PORT || 1337) + "/api/push_notifications/device").set('Content-Type', 'application/json').end(function (err, res) {
                if (err) return done(err);
                assert.equal(res.status, 200);
                done(err);

            });
        });
        it('should return 403 when not admin', function (done) {
            passportStub.login(fakeUsers['non_admin']);
            agent.get("http://localhost:" + (process.env.TEST_PORT || 1337) + "/api/push_notifications/device").set('Content-Type', 'application/json').end(function (err, res) {
                if (err) return done(err);
                assert.equal(res.status, 403);
                done(err);
            });
        });
        after(function(done){
            done();
        });
    });

    describe('when provided id does not match an existing device', function () {

        it('should return 404 and no representation', function (done) {
            var inexistentDeviceId = "48623343";

            passportStub.login(fakeUsers['admin']);

            agent.get("http://localhost:" + (process.env.TEST_PORT || 1337) + "/api/push_notifications/device/" + inexistentDeviceId).set('Content-Type', 'application/json').end(function (err, res) {
                if (err) return done(err);
                assert.equal(res.status, 404);
                done(err);
            });
        });
    });

    describe('when trying to destroy an existing resource', function () {
        var device = {
            "identifier": "bla",
            "password": "pass",
            "provider_name": "APPLE"
        };

        var deviceId;
        before(function (done) {
            var callback = function() {
                Device.create(device).then(function (obj) {
                    deviceId = obj.id;
                    done();
                }).error(function (err) {
                    assert.fail(err);
                    done();
                });
            }
            cleanup(callback);
        });
        it('should return 204 and no body response', function (done) {
            passportStub.login(fakeUsers['admin']);

            agent.del("http://localhost:" + (process.env.TEST_PORT || 1337) + "/api/push_notifications/device/" + deviceId).set('Content-Type', 'application/json').end(function (err, res) {
                if (err) return done(err);
                assert.equal(res.status, 204);
                done(err);
            });
        });
        after(function(done){
            Device.count().then(function(val) {
                assert.equal(val, 0);
                done();
            });

        });
    });

    describe('when trying to unregister an existing resource', function () {
        var device = {
            "identifier": "bla",
            "password": "pass",
            "provider_name": "APPLE"
        };
        var deviceId;
        before(function (done) {
            var callback = function() {
                Device.create(device).then(function (obj) {
                    deviceId = obj.id;
                    done();
                }).error(function (err) {
                    assert.fail(err);
                    done();
                });
            }
            cleanup(callback);
        });
        it('should return 204 and no body response', function (done) {
            passportStub.login(fakeUsers['admin']);

            agent.post("http://localhost:" + (process.env.TEST_PORT || 1337) + "/api/push_notifications/device/unregister").send(device).set('Content-Type', 'application/json').end(function (err, res) {
                if (err) return done(err);
                assert.equal(res.status, 204);
                done(err);
            });
        });
        after(function(done){
            Device.count().then(function(val) {
                assert.equal(val, 0);
                done();
            });
        });
    });

    describe('when trying to update an existing resource', function () {
        var device = {
            "identifier": "bla",
            "password": "pass",
            "provider_name": "APPLE"
        };
        var updatedDevice = {
            "identifier": "updatedIdentifier",
            "password": "updatedPassword",
            "provider_name": "GOOGLE"
        };

        var deviceId;
        before(function (done) {
            Device.create(device).then(function (obj) {
                deviceId = obj.id;
                done();
            }).error(function (err) {
                assert.fail(err);
                done();
            });
        });
        it('should return 204 and no body response', function (done) {
            passportStub.login(fakeUsers['admin']);

            agent.put("http://localhost:" + (process.env.TEST_PORT || 1337) + "/api/push_notifications/device/" + deviceId).send(updatedDevice).set('Content-Type', 'application/json').end(function (err, res) {
                if (err) return done(err);
                assert.equal(res.status, 204);
                done(err);

            });
        });
        after(function(done){
            Device.findOneById(deviceId).then(function(updatedDeviceObject){
                assert.equal(updatedDeviceObject.password, updatedDevice.password, "Updated field must match value provided in updated representation");
                assert.equal(updatedDeviceObject.identifier, updatedDevice.identifier, "Updated field must match value provided in updated representation");
                assert.equal(updatedDeviceObject.provider_name, updatedDevice.provider_name, "Updated field must match value provided in updated representation");
                done();
            });
        });
    });

});
