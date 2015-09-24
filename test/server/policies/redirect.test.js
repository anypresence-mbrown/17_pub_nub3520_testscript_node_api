var redirect  = require('../../../api/policies/redirect'),
    _         = require('lodash'),
    assert    = require('assert');

describe('redirect middleware', function() {
  var req, res;

  beforeEach(function() {

    req = {
      route: {
        path: '/test'
      }
    };

    res = {
      redirect: function() {}
    };

  });

  it('should export a function', function() {
    assert(_.isFunction(redirect));
  });

  it('should have 3 paramters: req, res and next', function() {
    assert.equal(redirect.length, 3);
  });

  it('should call next function', function(done) {
    redirect(req, res, function() {
      done();
    });
  });

  it('should execute res.redirect for a redirected route', function(done) {
    req.route.path = '/';

    res.redirect = function(route) {
      assert.equal(route, '/admin');
      done();
    };

    redirect(req, res, function() {});
  });
});
