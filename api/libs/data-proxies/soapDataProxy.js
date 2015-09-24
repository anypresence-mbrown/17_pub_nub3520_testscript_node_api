var BaseDataProxy   = require('./baseDataProxy'),
    Promise         = require('bluebird'),
    _               = require('lodash');

/*
 *  Constructor
 */
function SoapDataProxy(options) {
  BaseDataProxy.call(this, options);
}
BaseDataProxy._extend(SoapDataProxy);

SoapDataProxy.prototype.create = function(values) {
  return Promise.promisify(this.model.request)('create', values, this.req.context);
};

SoapDataProxy.prototype.findOne = function(options) {
  return Promise.promisify(this.model.request)('read', {id: this.req.params['id']}, this.req.context);
};

SoapDataProxy.prototype.update = function(params, values) {
  return Promise.promisify(this.model.request)('update', values, this.req.context);
};

SoapDataProxy.prototype.destroy = function() {
  return Promise.promisify(this.model.request)('delete', this.req.params, this.req.context);
};

SoapDataProxy.prototype.scope = function(req) {
  var self = this;
  if (!req.params['id']) {
    var scopeName = req.query['scope'] || 'all';
    var actionConfiguration = self.model.soap[scopeName + 'Scope'];
    var beforeCallback = 'before' + _.capitalize(scopeName) + 'Scope';
    var afterCallback = 'after' + _.capitalize(scopeName) + 'Scope';
    var scopeParams = req.query.query;
    var fn = self.handleTransientFieldsReturnArray(Promise.promisify(self.model.request)(scopeName + 'Scope', scopeParams, self.req.context));

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

module.exports = SoapDataProxy;
