var jsonRedirectFn  = require("../../../api/policies/jsonRedirect.js"),
    _               = require('lodash'),
    assert          = require('assert');

describe('jsonRedirect middleware', function() {
  it('should export a function', function() {
    assert(_.isFunction(jsonRedirectFn), 'Middleware should export a function');
  });

  it('should have 3 parameters: req, res and next', function() {
    assert.equal(jsonRedirectFn.length, 3);
  });

  it('should call next when wiring up the middleware', function(done) {
    jsonRedirectFn({}, {}, function() {
      done();
    });
  });

  it('should eventually call the original redirect function', function(done) {
    var res = {
      redirect: function() {
        done();
      }
    };

    var req = {
      headers: {}
    };

    jsonRedirectFn(req, res, function() {
      res.redirect();
    });
  });

  it('should send a JSON payload if the Accept header is set to application/json', function(done) {
    var res = {
      redirect: function() {
        throw new Error('Original redirect should not be called!');
      },
      send: function(status, payload) {
        assert.equal(status, 302);
        assert.equal(payload.message, 'You are being redirected');
        done();
      }
    };

    var req = {
      headers: {
        'Accept': 'application/json'
      }
    };

    jsonRedirectFn(req, res, function() {
      res.redirect();
    });
  });

  it('should send the original redirect URL in the JSON paylaod', function(done) {
    var url = 'https://www.google.com/';

    var res = {
      redirect: function() {
        throw new Error('Original redirect should not be called!');
      },
      send: function(status, payload) {
        assert.equal(payload.redirectUrl, url);
        done();
      }
    };

    var req = {
      headers: {
        'Accept': 'application/json'
      }
    };

    jsonRedirectFn(req, res, function() {
      res.redirect(url);
    });
  });
});