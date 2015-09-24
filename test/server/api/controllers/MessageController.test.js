var assert = require('assert');
var createRequest = require('../../../utils').createRequest;
var createResponse = require('../../../utils').createResponse;
var passportStub = require ('passport-stub');
var superagent = require('superagent');
var util = require('util');
var _ = require('lodash')

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

describe('Unit Tests for Message Controller', function () {
    beforeEach(function (done){
      agent = superagent.agent();
      objects = [];
      done();
    });

    afterEach(function(done) {
      passportStub.logout();
      done();
    });

    describe('when search for an existing message', function () {
        var message = {
            "receiver": "123",
            "payload": "Test Message"
        };
        var messageId = null;
        before(function (done) {
            Message.create(message).then(function (obj) {
                messageId = obj.id;
                done();
            }).error(function (err) {
                assert.fail(err);
                done();
            });
        });
        it('should return a representation of it with http status code 200', function (done) {
            passportStub.login(fakeUsers['admin']);
            passportStub.login(fakeUsers['admin']);
            agent.get("http://localhost:" + (process.env.TEST_PORT || 1337) + "/api/push_notifications/message").set('Content-Type', 'application/json').end(function (err, res) {
                if (err) return done(err);
                assert.equal(res.status, 200);
                done(err);
            });
        });
        after(function(done){
            done();
        });
    });

    describe('when search for a message id that does not exist', function () {
        var unexistingMessageId = "30926897";
        it('should return a 404 with no body', function (done) {
            passportStub.login(fakeUsers['admin']);
            agent.get("http://localhost:" + (process.env.TEST_PORT || 1337) + "/api/push_notifications/message").query({id: unexistingMessageId}).set('Content-Type', 'application/json').end(function (err, res) {
                if (err) return done(err);
                assert.equal(res.status, 404);
                done(err);
            });
        });
        after(function(done){
             done();
        });
    });

    describe('when no message id provided', function () {
        var message = {
            "receiver": "123",
            "payload": "Test Message"
        };
        before(function (done) {
            Device.create(message).then(function (obj) {
                done();
            }).error(function (err) {
                assert.fail(err);
                done();
            });
        });
        it('should return 403 and no body', function (done) {
            agent.get("http://localhost:" + (process.env.TEST_PORT || 1337) + "/api/push_notifications/message").set('Content-Type', 'application/json').end(function (err, res) {
                if (err) return done(err);
                assert.equal(res.status, 403);
                done(err);
            });
        });
        after(function(done){
            done();
        });
    });

});
