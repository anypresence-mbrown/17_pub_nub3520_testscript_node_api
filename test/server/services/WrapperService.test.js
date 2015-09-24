var WrapperService  = require("../../../api/services/WrapperService.js"),
    assert          = require('assert');

describe('WrapperService service', function() {
  var fnWithCallback, fnWithCallbackAndError, fnWithError, fnWithReturnValue;

  beforeEach(function() {
    fnWithCallback = function(val, done) {
      setTimeout(function() {
          done(null, val * 2);
      }, 500);
    };

    fnWithCallbackAndError = function(done) {
      if (true) throw new Error('Some vague error has occurred');
      done();
    };

    fnWithReturnValue = function(val) {
      return val * 2;
    };

    fnWithError = function() {
      throw new Error('Some vague error has occurred');
    };
  });

  it('should export a function', function() {
    assert(_.isFunction(WrapperService), 'WrapperService should export a function');
  });

  it('should have 3 parameters: fn, _this, errorLogFn', function() {
    assert.equal(WrapperService.length, 3);
  });

  describe('wrapping', function() {
    var wrapper;

    beforeEach(function() {
      wrapper = new WrapperService(fnWithReturnValue);
    });

    it('should return a wrapper object', function() {
      assert(_.isObject(wrapper), 'Expected constructor function to return instance object');
    });

    it('should have the invoke method', function() {
      assert(_.isFunction(wrapper.invoke), 'Expected invoke function');
    });

    it('should have the invokeAsPromise method', function() {
      assert(_.isFunction(wrapper.invokeAsPromise), 'Expected invokeAsPromise function');
    });

    it('should have a property containing the original function', function() {
      assert.equal(wrapper.fn, fnWithReturnValue, 'Expected reference to original function');
    });
  });

  describe('errLogFn', function() {
    it('should log any errors using the supplied function', function(done) {
      var testLogFn = function(err) {
        assert.equal(err.message, 'Some vague error has occurred');
        done();
      };

      var wrapper = new WrapperService(fnWithError, null, testLogFn);
      wrapper.invoke();
    });

    it('should not blow up if no errLogFn is supplied and an error occurs', function() {
      var wrapper = new WrapperService(fnWithError);
      wrapper.invoke();
    });
  });

  describe('_this object', function() {
    var wrapper, _this;

    beforeEach(function() {
      _this = {
        multiplier: 2
      };

      wrapper = new WrapperService(fnWithReturnValue, _this);
    });

    it('should have the supplied _this context', function() {
      assert.equal(wrapper._this, _this, 'Expected correct _this supplied to wrapper');
    });

    it("should properly use _this to bind the supplied function's this", function(done) {
      var testFn = function() {
        // Test inside the function that 'this' is equal to the _this parameter supplied to the
        // wrapper service.
        assert.equal(this, _this, 'Expected function to be bound to _this');
        done();
        return;
      };

      var testWrapper = new WrapperService(testFn, _this);
      testWrapper.invoke();
    });
  });

  describe('invoke', function() {
    it('should properly invoke a simple function and return a value', function() {
      var wrapper = new WrapperService(fnWithReturnValue);
      var val = wrapper.invoke(100);
      assert.equal(val, 200, 'Expected result to be 200 (100 * 2)');
    });

    it('should properly invoke an async function with a callback', function(done) {
      var wrapper = new WrapperService(fnWithCallback);
      wrapper.invoke(100, function(err, val) {
        assert.equal(200, val, 'Expected result to be 200 (100 * 2)');
        done();
      });
    });

    it('should properly handle a simple function throwing an error', function() {
      var wrapper = new WrapperService(fnWithError);
      assert.throws(
        wrapper.invoke,
        Error
      );
    });

    it('should properly handle an async function with a  callback when an error occurs', function(done) {
      var wrapper = new WrapperService(fnWithCallbackAndError);
      wrapper.invoke(function(err, val) {
        assert(err);
        done();
      });
    });
  });

  describe('invokeAsPromise', function() {
    it('should properly return a promise from an async function', function(done) {
      var wrapper = new WrapperService(fnWithCallback);
      wrapper.invokeAsPromise(100).then(function(val) {
        assert.equal(val, 200, 'Expected result to be 200 (100 * 2)');
        done();
      });
    });

    it('should properly handle an error', function(done) {
      var wrapper = new WrapperService(fnWithCallbackAndError);
      wrapper.invokeAsPromise()
        .then(function() {
          assert(false, '.then should not be executed, an error should be handled in the following catch function');
        })
        .catch(function(err) {
          assert(err);
          done();
        });
    });
  });
});
