var BaseDataProxy   = require('./baseDataProxy'),
    Promise         = require('bluebird'),
    _               = require('lodash');

function getOffsetAndLimit(req, actionConfiguration) {
  var limitName = actionConfiguration.limit || 'limit';
  var offsetName = actionConfiguration.offset || 'offset';

  var lo = {}

  lo[limitName] = parseInt(req.query['limit']) || null;
  lo[offsetName] = parseInt(req.query['offset']) || null;

  return lo;
}

function getScopeParams(req, actionConfiguration) {
  var scope = {
    scopeName: req.query['scope'] || 'all',
    query: req.query
  };

  _.merge(scope, getOffsetAndLimit(req, actionConfiguration));

  return scope;
}

/*
 *  Constructor
 */
function HttpDataProxy(options) {
  BaseDataProxy.call(this, options);
}
BaseDataProxy._extend(HttpDataProxy);

HttpDataProxy.prototype.create = function(values) {
  return Promise.promisify(this.model.request)('create', {}, values, this.req.context);
};

HttpDataProxy.prototype.findOne = function(options) {
  return Promise.promisify(this.model.request)('read', {}, {}, this.req.context);
};

HttpDataProxy.prototype.update = function(params, values) {
  return Promise.promisify(this.model.request)('update', {}, values, this.req.context);
};

HttpDataProxy.prototype.destroy = function() {
  return Promise.promisify(this.model.request)('delete', {}, {}, this.req.context);
};

HttpDataProxy.prototype.scope = function(req) {
  var self = this;
  if (!req.params['id']) {
    var scopeName = req.query['scope'] || 'all';
    var actionConfiguration = self.model.http[scopeName + 'Scope'];

    var scopeParams = getScopeParams(req, actionConfiguration);
    var beforeCallback = 'before' + _.capitalize(scopeParams.scopeName) + 'Scope';
    var afterCallback = 'after' + _.capitalize(scopeParams.scopeName) + 'Scope';
    var fn = self.handleTransientFieldsReturnArray(Promise.promisify(self.model.request)(scopeName + 'Scope', getOffsetAndLimit(req, actionConfiguration), {}, self.req.context));

    return {
      params: scopeParams,
      beforeCallback: beforeCallback,
      afterCallback: afterCallback,
      fn: function() {
        return fn;
      }
    };
  }
};

HttpDataProxy.prototype.handleError = function(err, req, res) {
  if (err.error) {
    err = err.error;
    if (err.statusCode) {
      if ((typeof err.responseBody !== 'undefined' && err.responseBody !== null && err.responseBody.trim() === '') ||
            (typeof err.parsedResponseBody !== 'undefined' && err.parsedResponseBody !== null)) {
        return res.send(err.statusCode, err.responseBody);
      }
    }
  }
  res.send(500, "Unknown server error, please contact your administrator");
};

module.exports = HttpDataProxy;
