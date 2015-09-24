var Promise   = require('bluebird'),
    _         = require('lodash');

function DataProxy(options) {

}

DataProxy.prototype.create = function(values) {
  return new Promise(function(resolve, reject) {
    resolve([values]);
  });
};

DataProxy.prototype.storeTransientFields = function() {
  return;
};

DataProxy.prototype.handleError = function(err) {
  throw err;
};

DataProxy.prototype.findOne = function(options) {
  return new Promise(function(resolve, reject) { resolve(options); });
};

DataProxy.prototype.destroy = function(id) {
  return new Promise(function(resolve, reject) { resolve(); });
};

DataProxy.prototype.update = function(params, values) {
  return new Promise(function(resolve, reject) { resolve(values); });
};

DataProxy.prototype.scope = function(req) {
  return;
};

var sails = {
  models: [],
  log: {
    debug: function(msg) {},
    error: function(msg) {}
  }
};

var genericModel = {
  executeCallback: function(name) {
    return new Promise(function(resolve, reject){ resolve(); });
  },
  transientAttributes: ['transField'],
  attributes: {
    name: { columnName: 'name' }
  }
};

var genericModelValues = {
  name: 'Foo',
  transField: 'Bar'
};

module.exports = {
  DataProxy: DataProxy,
  sails: sails,
  genericModel: genericModel,
  genericModelValues: genericModelValues,
  analytics: {
    analyse: function(req, res) { return; }
  }
};
