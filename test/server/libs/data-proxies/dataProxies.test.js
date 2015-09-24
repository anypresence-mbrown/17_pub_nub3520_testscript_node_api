var assert        = require('assert'),
    _             = require('lodash'),
    stubs         = require('../../stubs'),
    BaseDataProxy = require('../../../../api/libs/data-proxies/baseDataProxy');


var allProxies = ['standardDataProxy', 'soapDataProxy', 'httpDataProxy'];
var crudOperations = ['create', 'update', 'destroy', 'findOne'];

describe('baseDataProxy', function() {
  it('should exports a function', function() {
    assert(_.isFunction(BaseDataProxy));
  });

  allProxies.forEach(function(proxy) {
    describe(proxy + ' implementation', function() {
      var DataProxy = require('../../../../api/libs/data-proxies/' + proxy);

      var model, req, dataProxy, values, expectedReturnValues;
      
      beforeEach(function() {
        model = _.cloneDeep(stubs.genericModel);
        values = _.cloneDeep(stubs.genericModelValues);
        req = {
          body: values
        };
        dataProxy = new DataProxy({model: model, req: req});
        // Expected mock return values from CRUD operations.
        expectedReturnValues = {
          'create': [values],
          'update': undefined,
          'findOne': [values],
          'destroy': undefined
        };
      });

      it('should export a function', function() {
        assert(_.isFunction(DataProxy));
      });

      it('should inherit handleTransientFieldsReturnArray function', function() {
        assert(dataProxy.handleTransientFieldsReturnArray);
      });

      it('should inherit storeTransientFields function', function() {
        assert(dataProxy.handleTransientFieldsReturnArray);
      });

      it('should inherit applyTransientFields function', function() {
        assert(dataProxy.handleTransientFieldsReturnArray);
      });

      it('should implement create', function() {
        assert(_.isFunction(dataProxy.create));
      });

      it('should implement update', function() {
        assert(_.isFunction(dataProxy.update));
      });

      it('should implement destroy', function() {
        assert(_.isFunction(dataProxy.destroy));
      });

      it('should implement findOne', function() {
        assert(_.isFunction(dataProxy.findOne));
      });

      it('should implement scope', function() {
        assert(_.isFunction(dataProxy.scope));
      });

      it('should implement handleError', function() {
        assert(_.isFunction(dataProxy.handleError));
      });

      crudOperations.forEach(function(operation) {
        it('should call storeTransientFields when executing ' + operation, function(done) {
          var wasCalled = false;

          var tempStoreTransientFields = dataProxy.storeTransientFields;
          dataProxy.storeTransientFields = function() {
            dataProxy.storeTransientFields = tempStoreTransientFields;
            wasCalled = true;
          };

          var tempFn = dataProxy.originalFns[operation];
          dataProxy.originalFns[operation] = function() {
            dataProxy.originalFns[operation] = tempFn;
            assert(wasCalled);
            done();
            var returnValues = expectedReturnValues[operation];
            return new Promise(function(resolve, reject) {resolve(returnValues);});
          };

          dataProxy[operation]();
        });

        it('should call handleTransientFieldsReturnArray when executing ' + operation, function(done) {
          var tempHandleTransientFieldsReturnArray = dataProxy.handleTransientFieldsReturnArray;
          dataProxy.handleTransientFieldsReturnArray = function() {
            dataProxy.handleTransientFieldsReturnArray = tempHandleTransientFieldsReturnArray;
            done();
          };

          var tempFn = dataProxy.originalFns[operation];
          dataProxy.originalFns[operation] = function() {
            dataProxy.originalFns[operation] = tempFn;
            var returnValues = expectedReturnValues[operation];
            return new Promise(function(resolve, reject) {resolve(returnValues);});
          };

          dataProxy[operation]();
        });

        it('should store transient fields when executing ' + operation, function(done) {
          var transFields = model.transientAttributes;

          var tempFn = dataProxy.originalFns[operation];
          dataProxy.originalFns[operation] = function() {
            // Assert that no transient fields reside on the request body or
            // model about to be acted upon.
            transFields.forEach(function(field) {
              assert(!dataProxy.req.body[field], 'Body should not contain ' + field);
              assert(!model[field], 'Model should not contain ' + field);
            });
            dataProxy.originalFns[operation] = tempFn;
            var returnValues = expectedReturnValues[operation];
            return new Promise(function(resolve, reject) {resolve(returnValues);});
          };

          dataProxy[operation]()
            .then(function(result) {
              if (expectedReturnValues[operation] !== undefined) {
                _result = result;
                if (_.isArray(result)) _result = result[0];
                transFields.forEach(function(field) {
                  assert(_result[field], 'Expected to find ' + field + ' on model!');
                });
              }
              done();
            })
            .catch(function(err) {
              done(err);
            });
        });

      });
    });
  });
});
