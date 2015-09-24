var assert      = require('assert'),
    rewire      = require('rewire'),
    stubs       = require('../../stubs'),
    controller  = rewire('../../../../api/controllers/V1PublishController'),
    Promise     = require('bluebird'),
    _           = require('lodash');

// Stub out controller object.
controller.__set__('DataProxy', stubs.DataProxy);
controller.__set__('sails', stubs.sails);
controller.__set__('analytics', stubs.analytics);

describe('V1Publish Controller', function() {
  var req, res, model, values, keyField, defaultAuthDigest;

  beforeEach(function() {
    req = {
      params: {},
      body: {}
    };
    res = {
      send: function(status, body) {
        return;
      }
    };

    keyField = 'id';

    // Refresh model
    model = stubs.sails.models['v1publish'] = _.cloneDeep(stubs.genericModel);
    values = {"id":71382,"channel":"International substantially","message":"Stamps scuttling","pubkey":"Anniversaries Cyrus","sig":"Tactlessly anneal","subkey":"Recognizing contractually","timestamp":"Czechoslovakian concurrently"};
    
  });

  describe('create', function() {
    beforeEach(function() {
      req.body = values;
    });

    it('should exist', function() {
      assert(controller.create, 'Create function should exist on controller!');
    });

    it('should execute model before and after callbacks', function(done) {
      var callbacks = ['beforeCreate', 'afterCreate'];

      model.executeCallback = function(name, values) {
        var expected = callbacks.shift();
        assert.equal(name, expected);
        if (callbacks.length === 0) return done();
        return new Promise(function(resolve, reject) { resolve(); });
      };

      controller.create(req, res);
    });

    it('should supply model before callback with the request body and after callback with model', function(done) {
      model.executeCallback = function(name, values) {
        if (name === 'beforeCreate') {
          assert.equal(values, req.body);
        }
        if (name === 'afterCreate') {
          assert(values.indexOf(req.body) !== -1);
          done();
        }
        return new Promise(function(resolve, reject){ resolve(); });
      };

      controller.create(req, res);
    });

    

    it('should execute DataProxy.create with the supplied body', function(done) {
      var tempFn = stubs.DataProxy.prototype.create;
      stubs.DataProxy.prototype.create = function(values) {
        assert.equal(req.body, values);
        stubs.DataProxy.prototype.create = tempFn;
        done();
        return new Promise(function(resolve, reject){ resolve([values]); });
      };

      controller.create(req, res);
    });

    it('should send a 201 response and the model', function(done) {
      res.send = function(status, body) {
        assert.equal(status, 201);
        assert.equal(body, req.body);
        done();
      };

      controller.create(req, res);
    });

    it('should execute the DataProxy handleError function if an error is thrown', function(done) {
      res.send = function(status, body) {
        throw new Error('Boom!');
      };

      var tempFn = stubs.DataProxy.prototype.handleError;

      stubs.DataProxy.prototype.handleError = function(err, req, res) {
        stubs.DataProxy.prototype.handleError = tempFn;
        assert(err);
        done();
      };

      controller.create(req, res);
    });

    it('should always execute analyse', function(done) {
      var tempFn = stubs.analytics.analyse;
      stubs.analytics.analyse = function(req, res) {
        stubs.analytics.analyse = tempFn;
        done();
      };

      controller.create(req, res);
    });
  });

  describe('find', function() {
    it('should exist', function() {
      assert(controller.find, 'Find function should exist on controller!');
    });

    describe('with a scope', function() {
      var scope;

      beforeEach(function() {
        scope = {
          scopeParams: {
            scopeName: 'all',
            limit: 25,
            offset: 0,
            query: req.query || {}
          },
          beforeCallback: 'beforeAllScope',
          afterCallback: 'afterAllScope',
          fn: function() {
            return new Promise(function(resolve, reject) { resolve(values); })
          }
        };

        stubs.DataProxy.prototype.scope = function(req) {
          return scope;
        };
      });

      it('should execute DataProxy.scope', function(done) {
        var tempFn = stubs.DataProxy.prototype.scope;

        stubs.DataProxy.prototype.scope = function(req) {
          stubs.DataProxy.prototype.scope = tempFn;
          done();
          return scope;
        };

        controller.find(req, res);
      });

      it('should execute scope before and after callbacks', function(done) {
        var callbacks = ['beforeAllScope', 'afterAllScope'];

        model.executeCallback = function(name, values) {
          var expected = callbacks.shift();
          assert.equal(name, expected);
          if (callbacks.length === 0) return done();
          return new Promise(function(resolve, reject) { resolve(); });
        };

        controller.find(req, res);
      });

      it("should execute the scope's fn function", function(done) {
        scope.fn = function() {
          done();
        };

        controller.find(req, res);
      });

      it('should send the results', function(done) {
        scope.fn = function() {
          return new Promise(function(resolve, reject) { resolve(values); });
        };

        res.send = function(body) {
          assert.equal(body, values);
          done();
        };

        controller.find(req, res);
      });

      it('should execute the DataProxy handleError function if an error is thrown', function(done) {
        scope.fn = function(status, body) {
          throw new Error('Boom!');
        };

        var tempFn = stubs.DataProxy.prototype.handleError;

        stubs.DataProxy.prototype.handleError = function(err, req, res) {
          stubs.DataProxy.prototype.handleError = tempFn;
          assert(err);
          done();
        };

        controller.find(req, res);
      });

      it('should call analyse with the size of the results if any are returned from the the scope', function(done){
        scope.fn = function() {
          return new Promise(function(resolve, reject) { resolve(values); });
        };

        res.send = function(body) {};

        var tempFn = stubs.analytics.analyse;
        stubs.analytics.analyse = function(req, res, size) {
          assert(size);
          stubs.analytics.analyse = tempFn;
          done();
        };

        controller.find(req, res);
      });

      it('should call analyse with just the req and res if no results are returned from the scope', function(done) {
        scope.fn = function() {
          return new Promise(function(resolve, reject) { resolve(); });
        };

        res.send = function(body) {};

        var tempFn = stubs.analytics.analyse;
        stubs.analytics.analyse = function(req, res, size) {
          assert(!size);
          stubs.analytics.analyse = tempFn;
          done();
        };

        controller.find(req, res);
      });
    });

    describe('without a scope', function() {
      beforeEach(function() {
        stubs.DataProxy.prototype.scope = function(req) {
          return;
        };
      });

      it('should execute model before and after callbacks', function(done) {
        var callbacks = ['beforeFind', 'afterFind'];

        model.executeCallback = function(name, values) {
          var expected = callbacks.shift();
          assert.equal(name, expected);
          if (callbacks.length === 0) return done();
          return new Promise(function(resolve, reject) { resolve(); });
        };

        controller.find(req, res);
      });

      it('should execute findOne with params', function(done) {
        var tempFn = stubs.DataProxy.prototype.findOne;

        stubs.DataProxy.prototype.findOne = function(params) {
          assert(params);
          stubs.DataProxy.prototype.findOne = tempFn;
          done();
          return new Promise(function(resolve, reject) { resolve([values]); });
        };

        controller.find(req, res);
      });

      it('should throw a "Not Found" error if findOne returns nothing', function(done) {
        var tempFn = stubs.DataProxy.prototype.handleError;
        var tempFnFindOne = stubs.DataProxy.prototype.findOne;

        stubs.DataProxy.prototype.handleError = function(err) {
          assert.equal(err.message, "Not Found");
          stubs.DataProxy.prototype.handleError = tempFn;
          done();
        };

        stubs.DataProxy.prototype.findOne = function(params) {
          stubs.DataProxy.prototype.findOne = tempFnFindOne;
          return new Promise(function(resolve, reject) { resolve(); });
        };

        controller.find(req, res);
      });

      it('should send the results', function(done) {
        var tempFn = stubs.DataProxy.prototype.findOne;

        stubs.DataProxy.prototype.findOne = function(params) {
          stubs.DataProxy.prototype.findOne = tempFn;
          return new Promise(function(resolve, reject) { resolve([values]); });
        };

        res.send = function(body) {
          assert(body);
          assert.equal(body, [values][0]);
          done();
        };

        controller.find(req, res);
      });

      it('should execute analyse with the size of the results if any are returned from the the scope', function(done){
        res.send = function(body) {};

        var tempFnFindOne = stubs.DataProxy.prototype.findOne;

        stubs.DataProxy.prototype.findOne = function(params) {
          stubs.DataProxy.prototype.findOne = tempFnFindOne;
          return new Promise(function(resolve, reject) { resolve([values]); });
        };

        var tempFn = stubs.analytics.analyse;
        stubs.analytics.analyse = function(req, res, size) {
          assert(size);
          stubs.analytics.analyse = tempFn;
          done();
        };

        controller.find(req, res);
      });

      it('should execute analyse with just the req and res if no results are returned from the scope', function(done) {
        res.send = function(body) {};

        var tempFnFindOne = stubs.DataProxy.prototype.findOne;

        stubs.DataProxy.prototype.findOne = function(params) {
          stubs.DataProxy.prototype.findOne = tempFnFindOne;
          return new Promise(function(resolve, reject) { resolve(); });
        };

        var tempFn = stubs.analytics.analyse;
        stubs.analytics.analyse = function(req, res, size) {
          assert(!size);
          stubs.analytics.analyse = tempFn;
          done();
        };

        var tempFnHandleError = stubs.DataProxy.prototype.handleError;
        stubs.DataProxy.prototype.handleError = function(err) {
          stubs.DataProxy.prototype.handleError = tempFnHandleError;
          return;
        };

        controller.find(req, res);
      });

      it('should execute handleError if an error is thrown', function(done) {
        res.send = function(status, body) {
          throw new Error('Boom!');
        };

        var tempFnFindOne = stubs.DataProxy.prototype.findOne;

        stubs.DataProxy.prototype.findOne = function(params) {
          stubs.DataProxy.prototype.findOne = tempFnFindOne;
          // Empty findOne throws Not Found error.
          return new Promise(function(resolve, reject) { resolve(); });
        };

        var tempFn = stubs.DataProxy.prototype.handleError;

        stubs.DataProxy.prototype.handleError = function(err, req, res) {
          stubs.DataProxy.prototype.handleError = tempFn;
          assert(err);
          done();
        };

        controller.find(req, res);
      });
    });
  });

  describe('update', function() {
    beforeEach(function() {
      req.params[keyField] = 1;
      req.body = values;
    });

    it('should exist', function() {
      assert(controller.update, 'Update function should exist on controller!');
    });

    it('should execute model before and after callbacks', function(done) {
      var callbacks = ['beforeUpdate', 'afterUpdate'];

      model.executeCallback = function(name, values) {
        var expected = callbacks.shift();
        assert.equal(name, expected);
        if (callbacks.length === 0) return done();
        return new Promise(function(resolve, reject) { resolve(); });
      };

      controller.update(req, res);
    });

    

    it('should execute DataProxy.update with the supplied body', function(done) {
      var tempFn = stubs.DataProxy.prototype.update;
      stubs.DataProxy.prototype.update = function(params, values) {
        assert.equal(req.body, values);
        stubs.DataProxy.prototype.update = tempFn;
        done();
        return new Promise(function(resolve, reject){ resolve([values]); });
      };

      controller.update(req, res);
    });

    it('should delete the req.body.id', function(done) {
      req.body[keyField] = 2;

      var tempFn = stubs.DataProxy.prototype.update;

      stubs.DataProxy.prototype.update = function(params, values) {
        assert(!values[keyField]);
        stubs.DataProxy.prototype.update = tempFn;
        done();
      };

      controller.update(req, res);
    });

    it('should send a 204 response', function(done) {
      res.send = function(status, body) {
        assert.equal(204, status);
        done();
      };

      controller.update(req, res);
    });

    it('should execute the DataProxy handleError function if an error is thrown', function(done) {
      res.send = function(status, body) {
        throw new Error('Boom!');
      };

      var tempFn = stubs.DataProxy.prototype.handleError;

      stubs.DataProxy.prototype.handleError = function(err, req, res) {
        stubs.DataProxy.prototype.handleError = tempFn;
        assert(err);
        done();
      };

      controller.update(req, res);
    });

    it('should always execute analyse', function(done) {
      var tempFn = stubs.analytics.analyse;
      stubs.analytics.analyse = function(req, res) {
        stubs.analytics.analyse = tempFn;
        done();
      };

      controller.update(req, res);
    });
  });

  describe('destroy', function() {
    beforeEach(function() {
      req.params = {};
      req.params[keyField] = 1;
    });

    it('should exist', function() {
      assert(controller.destroy, 'Destroy function should exist on controller!');
    });

    it('should execute model before and after callbacks', function(done) {
      var callbacks = ['beforeDestroy', 'afterDestroy'];

      model.executeCallback = function(name, values) {
        var expected = callbacks.shift();
        assert.equal(name, expected);
        if (callbacks.length === 0) return done();
        return new Promise(function(resolve, reject) { resolve(); });
      };

      controller.destroy(req, res);
    });

    it('should execute findOne to get the model being destroyed', function(done) {
      var tempFn = stubs.DataProxy.prototype.findOne;

      stubs.DataProxy.prototype.findOne = function(options) {
        stubs.DataProxy.prototype.findOne = tempFn;
        done();
        return new Promise(function(resolve, reject) { resolve(values); });
      };

      controller.destroy(req, res);
    });

    it('should execute destroy with the id', function(done) {
      var tempFn = stubs.DataProxy.prototype.destroy;

      stubs.DataProxy.prototype.destroy = function(id) {
        stubs.DataProxy.prototype.destroy = tempFn;
        assert.equal(id, req.params[keyField]);
        done();
        return new Promise(function(resolve, reject) { resolve(); });
      };

      controller.destroy(req, res);
    });

    it('should send a 204 response', function(done) {
      res.send = function(status, body) {
        assert.equal(204, status);
        done();
      };

      controller.destroy(req, res);
    });

    it('should execute the DataProxy handleError function if an error is thrown', function(done) {
      res.send = function(status, body) {
        throw new Error('Boom!');
      };

      var tempFn = stubs.DataProxy.prototype.handleError;

      stubs.DataProxy.prototype.handleError = function(err, req, res) {
        stubs.DataProxy.prototype.handleError = tempFn;
        assert(err);
        done();
      };

      controller.destroy(req, res);
    });

    it('should always execute analyse', function(done) {
      var tempFn = stubs.analytics.analyse;
      stubs.analytics.analyse = function(req, res) {
        stubs.analytics.analyse = tempFn;
        done();
      };

      controller.destroy(req, res);
    });
  });
});
