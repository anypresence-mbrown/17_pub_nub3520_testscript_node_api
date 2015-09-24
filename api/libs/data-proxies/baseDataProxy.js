var util      = require('util'),
    Promise   = require('bluebird'),
    _         = require('lodash');

/*
 *  Constructor
 */
function BaseDataProxy(options) {
  this.model = options.model;
  this.req = options.req;
  this.originalFns = {};

  // Wrap functions to handle transient fields
  var self = this;
  var wrapFns = [ 'create', 'update', 'destroy', 'findOne' ];

  wrapFns.forEach(function(fnName) {
    self.originalFns[fnName] = self[fnName];
    self[fnName] = function() {
      self.storeTransientFields();
      return self.handleTransientFieldsReturnArray(self.originalFns[fnName].apply(self, arguments));
    };
  });
}

// All CRUD operation implementations must return a promise.
BaseDataProxy.prototype.findOne = function() {
  throw new Error('DataProxy does not implement findOne!');
};

BaseDataProxy.prototype.destroy = function() {
  throw new Error('DataProxy does not implement destroy!');
};

BaseDataProxy.prototype.update = function() {
  throw new Error('DataProxy does not implement udpate!');
};

BaseDataProxy.prototype.create = function() {
  throw new Error('DataProxy does not implement create!');
};

BaseDataProxy.prototype.handleError = function(err, req, res) {
  throw new Error('DataProxy does not implement handleError!');
};

BaseDataProxy.prototype.scope = function(req) {
  throw new Error('DataProxy does not implement scope!');
};

BaseDataProxy.prototype.handleTransientFieldsReturnArray = function(promise) {
  var self = this;
  return new Promise(function(resolve, reject) {
    promise.then(function(obj) {
      self.applyTransientFields(obj);
      if (!_.isArray(obj)) obj = [obj];
      resolve(obj);
    })
    .catch(function(err) {
      reject(err);
    });
  });
};

BaseDataProxy.prototype.storeTransientFields = function() {
  var self = this;
  if (self.req.body && self.model.transientAttributes.length > 0) {
    self._transientAttributes = {};
    self.model.transientAttributes.forEach(function(transientAttribute) {
      self._transientAttributes[transientAttribute] = self.req.body[transientAttribute];
      delete self.req.body[transientAttribute];
    });
  }
};

BaseDataProxy.prototype.applyTransientFields = function(model) {
  if (!model) return;
  var self = this;
  var _model = model;
  if (_.isArray(model)) _model = model[0];
  if (self._transientAttributes) {
    _.keys(self._transientAttributes).forEach(function(key) {
      _model[key] = self._transientAttributes[key];
    });
  }
};

BaseDataProxy._extend = function(obj) {
  util.inherits(obj, BaseDataProxy);
};

module.exports = BaseDataProxy;
