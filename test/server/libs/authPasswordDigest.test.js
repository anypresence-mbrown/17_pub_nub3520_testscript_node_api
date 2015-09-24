var authPasswordDigest  = require("../../../api/libs/authPasswordDigest.js"),
    _                   = require('lodash'),
    assert              = require('assert');

describe('authPasswordDigest lib', function() {
  var stub;

  beforeEach(function() {
    stub = {
      password: 'test',
      passwordConfirmation: 'test',
      username: 'testUser'
    };
  });

  it('should export a function', function() {
    assert(_.isFunction(authPasswordDigest));
  });

  it('should throw a validation error if password and passwordConfirmation do not match', function() {
    stub.passwordConfirmation = 'notTest';
    assert.throws(function() {
      return authPasswordDigest(stub);
    }, function(err) {
      return err.ValidationError !== undefined;
    });
  });

  it('should correctly hash the password and assign it to passwordDigest', function() {
    authPasswordDigest(stub);
    assert(stub.passwordDigest);
    assert(stub.passwordDigest.length > 0);
  });

});
