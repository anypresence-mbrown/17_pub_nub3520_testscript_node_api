var requestLogger  = require("../../../api/policies/requestLogger.js"),
    _               = require('lodash'),
    assert          = require('assert');


describe('requestLogger', function() {
  it('should export a function', function() {
    assert(_.isFunction(requestLogger));
  });

  it('should have 3 parameters: req, res, next', function() {
    assert.equal(requestLogger.length , 3);
  });

  it('should call the next function', function(done) {
    requestLogger({}, {}, function() {
      done();
    });
  });

  it('should call sails.log.debug if environment is development', function(done) {
    var tempEnv = sails.config.environment;
    sails.config.environment = 'development';
    var tempFn = sails.log.debug;
    sails.log.debug = function(message) {
      assert(message);
      sails.config.environment = tempEnv;
      sails.log.debug = tempFn;
      done();
    };

    requestLogger({}, {}, function() {});
  });

  it('should not call sails.log.debug if environment is not development', function(done) {
    var tempEnv = sails.config.environment;
    sails.config.environment = 'test';
    var tempFn = sails.log.debug;
    var called = false;
    sails.log.debug = function(message) {
      called = true;
    };

    requestLogger({}, {}, function() {
      sails.config.environment = tempEnv;
      sails.log.debug = tempFn;
      assert(!called);
      done();
    });
  });
});
