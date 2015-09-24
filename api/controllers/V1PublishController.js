var extensions          = require('./custom/v1/publishCustom'),
    callbacks           = require('./custom/v1/publishCallbacks'),
    utilities           = require('../../config/utilities'),
    _                   = require('lodash'),
    util                = require('util'),
    analytics           = require('../../api/analytics/analytics'),
    DataProxy           = require('../libs/data-proxies/httpDataProxy'),
    WrapperService      = require('../services/WrapperService'),
    sails               = require('sails');

var V1PublishController = module.exports = {
  find: function(req, res) {
    sails.log.debug("V1PublishController.find");
    var results, model, dataProxy, scope;

    model = sails.models['v1publish'];
    dataProxy = new DataProxy({model: model, req: req});

    scope = dataProxy.scope(req);

    if (scope) {
      model.executeCallback(scope.beforeCallback, scope.params)
        .then(function() {
          return scope.fn();
        })
        .then(function(obj) {
          results = obj;
          return model.executeCallback(scope.afterCallback, results);
        })
        .then(function() {
          sails.log.debug('responding with: \n' + util.inspect(results) + '\n');
          res.send(results);
        })
        .catch(function(err) {
          sails.log.error('error: \n' + util.inspect(err) + '\n');
          dataProxy.handleError(err, req, res);
        })
        .finally(function() {
          if (results) return analytics.analyse(req, res, utilities.sizeOf(results));
          return analytics.analyse(req, res);
        });
    } else {
      var id = req.params['id'];
      model.executeCallback('beforeFind', id)
        .then(function() {
          return dataProxy.findOne({'id': id});
        })
        .then(function(obj) {
          if (!obj) throw new Error('Not Found');
          results = obj;
          return model.executeCallback('afterFind', results);
        })
        .then(function() {
          sails.log.debug('responding with object \n'  + util.inspect(results) + '\n');
          res.send(results[0]);
        })
        .catch(function(err) {
          sails.log.error('error: \n' + util.inspect(err) + '\n');
          dataProxy.handleError(err, req, res);
        })
        .finally(function() {
          if (results) return analytics.analyse(req, res, utilities.sizeOf(results[0]));
          return analytics.analyse(req, res);
        });
    }
  },
  destroy: function(req, res) {
    sails.log.debug("V1PublishController.destroy");

    var results, model, dataProxy, id;

    id = req.params['id'];
    model = sails.models['v1publish'];
    dataProxy = new DataProxy({model: model, req: req});

    model.executeCallback('beforeDestroy', id)
      .then(function() {
        return dataProxy.findOne({'id': id});
      })
      .then(function(obj) {
        results = obj;
        if (!results) throw new Error('Not found');
        sails.log.debug('Destroying object: ' + util.inspect(obj));
        return dataProxy.destroy(id);
      })
      .then(function() {
        model.executeCallback('afterDestroy', results);
      })
      .then(function() {
        res.send(204);
      })
      .catch(function(err) {
        sails.log.error('error: \n' + util.inspect(err) + '\n');
        dataProxy.handleError(err, req, res);
      })
      .finally(function() {
        if (results) return analytics.analyse(req, res, utilities.sizeOf(results));
        return analytics.analyse(req, res);
      });
  },
  update: function(req, res) {
    sails.log.debug("V1PublishController.update");

    var model, dataProxy;

    model = sails.models['v1publish'];
    dataProxy = new DataProxy({model: model, req: req});

    model.executeCallback('beforeUpdate', req.body)
      .then(function() {
        delete req.body['id'];
        
        return dataProxy.update({id: req.params['id']}, req.body);
      })
      .then(function(obj) {
        return model.executeCallback('afterUpdate', obj);
      })
      .then(function() {
        res.send(204);
      })
      .catch(function(err) {
        sails.log.error('error: \n' + util.inspect(err) + '\n');
        dataProxy.handleError(err, req, res);
      })
      .finally(function() {
        analytics.analyse(req, res);
      });
  },
  create: function(req, res) {
    sails.log.debug("V1PublishController.create");
    var results, model, dataProxy;

    model = sails.models['v1publish'];
    dataProxy = new DataProxy({model: model, req: req});

    model.executeCallback('beforeCreate', req.body)
      .then(function() {
        
        return dataProxy.create(req.body);
      })
      .then(function(obj) {
        results = obj;
        return model.executeCallback('afterCreate', obj);
      })
      .then(function() {
        sails.log.debug('responding with: \n' + util.inspect(results) + '\n');
        res.send(201, results[0]);
      })
      .catch(function(err) {
        sails.log.error('error: ' + util.inspect(err));
        dataProxy.handleError(err, req, res);
      })
      .finally(function() {
        analytics.analyse(req, res);
      });
  }
};

// TODO (JP): Break this partial out into its own lib and require it in the controllers/models
function extend(baseObject, baseName, extensionObject, subObject) {
  // If no subObject is supplied, extend the baseObject.
  var sub = baseObject;
  if (subObject) sub = baseObject[subObject] = {};

  _.keys(extensionObject).forEach(function(key) {

    if (_.isFunction(extensionObject[key])) {
      var _this = {
        models: function(name, version) {
          if (version) {
            var modelName = 'v' + version + _.camelCase(name);
            return sails.models[modelName];
          }

          var recentVersionByName = {
            
            'Publish': 'v1publish',
            
          };
          return sails.models[recentVersionByName[_.capitalize(name)]];
        },
        matchingVersionOf: function(name) {
          var apiVersion = 1;
          return this.models(name, apiVersion);
        }
      };

      var wrapper = new WrapperService(extensionObject[key], _this, sails.log.error);

      // Generic customCode does not return a promise. Model/Controller callbacks do.
      if (subObject === 'customCode') {
        sub[key] = wrapper.invoke.bind(wrapper);
      } else {
        sub[key] = wrapper.invokeAsPromise.bind(wrapper);
      }
    } else {
      sub[key] = extensionObject[key];
    }
  });
}

if(extensions) {
  extend(V1PublishController, 'V1PublishController', extensions, 'customCode');
}

if (callbacks) {
  extend(V1PublishController, 'V1PublishController', callbacks, 'callbacks');
}
