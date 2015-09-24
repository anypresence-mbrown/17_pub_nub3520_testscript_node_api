var inflection = require('inflection'),
        util = require('util'),
        _ = require('lodash'),
        utilities = require('../../../config/utilities');

var getTransformations = function (req) {
    var tokenizedUrl = req.options.detectedVerb.path.split('/');

    //If it's an unversioned URL, then we use the latest API version
    var version;
    if(utilities.isUnversionedUrl(tokenizedUrl)){
        version = "v" + utilities.getCurrentApiVersion();
    } else {
      if (tokenizedUrl[1].match(/v\d+/)) {
        version = tokenizedUrl[1];
      } else if (tokenizedUrl[2].match(/v\d+/)) {
        version = tokenizedUrl[2];
      }
    }

    var object = req.options.model;
    var transformService = require("./" + version + "/Transformations");
    return transformService[object];
};

var transformObject = function (transformer, target) {
    _.keys(target).forEach(function (key) {
        var transformedKey = transformer[key];
        var value = target[key];

        delete target[key];
        if (transformedKey) target[transformedKey] = value;
    });
};

var transform = function (transformer, target) {
    if (!util.isArray(target)) return transformObject(transformer, target);

    target.forEach(function (obj) {
        transformObject(transformer, obj);
    });
};

/**
 * Checks if the given controller name and action requires a transformation
 * @param controllerName the name of the controller
 * @param controllerAction the action
 * @param strategy strategy
 * @returns {boolean|*} TRUE if it does not require a transformation, FALSE otherwise
 */
var isBypassedOperation = function (controllerName, controllerAction, strategy) {
    return isMessagingOperation(controllerName) || isAnalyticsOperation(controllerName) ||
           isLoginOperation(controllerName, controllerAction) || isAdminStrategy(strategy) ||
           isHealthCheckOperation(controllerName);
};

/**
 * Checks whether or not it's a messaging operation
 * @param controllerName the controller name
 * @returns {*} TRUE if it's a messaging operation, otherwise FALSE
 */
var isMessagingOperation = function(controllerName){
    return (_.contains(['device', 'message', 'channel'], controllerName));
};

/**
 * Checks whether or not it's a health check operation
 * @param controllerName the controller name
 * @returns {*} TRUE if it's a health check operation, otherwise FALSE
 */
var isHealthCheckOperation = function(controllerName){
    return controllerName === 'aphealthcheck'
};

/**
 * Checks whether or not it's an activity operation
 * @param controllerName the controller name
 * @returns {*} TRUE if it's an activity operation, otherwise FALSE
 */
var isAnalyticsOperation = function(controllerName){
    return (_.contains(['activity', 'info'], controllerName));
};

/**
 * Checks if the given controller name and operation corresponds to a login operation
 * @param controllerName the controller name
 * @param controllerAction the controller action
 * @returns {boolean} TRUE if it's a logging operation, otherwise FALSE
 */
var isLoginOperation = function (controllerName, controllerAction) {
    return controllerName === 'apauthenticatedsessions' && controllerAction === 'login';
};

/**
 * Checks whether or not the given controller name, action and strategy corresponds to an admin login operation
 * @param controllerStrategy the strategy of the controller
 * @returns {boolean} TRUE if it's an admin login operation, otherwise FALSE
 */
var isAdminStrategy = function (controllerStrategy) {
    return controllerStrategy && controllerStrategy === 'admin';
};

module.exports = {
    transformIn: function (req, res, targetObj) {
        if (req.query['scope']) req.query['scope'] = inflection.camelize(req.query['scope'], true);

        req._origBody = _.cloneDeep(req.body);

        var name = req.options.controller;
        var action = req.options.action;
        var strategy = req.param('strategy');
        var transformer;

        

        if (!isBypassedOperation(name, action, strategy)){
          transformer = getTransformations(req)['in'];
          return transform(transformer, targetObj);
        }
    },

    transformOut: function (req, res, targetObj) {
        if (res.statusCode !== 200 && res.statusCode !== 201) return;

        var name = req.options.controller;
        var action = req.options.action;
        var strategy = req.param('strategy');
        var transformer;

        if(isBypassedOperation(name, action, strategy)) return;

        

        transformer = getTransformations(req)['out'];
        return transform(transformer, targetObj);
    },

    transformErrors: function (req, res, targetObj) {
        var transformer = getTransformations(req)['out'];
        if (targetObj && targetObj.ValidationError) {
            targetObj.errors = _.clone(targetObj.ValidationError);
            delete targetObj.ValidationError;
            transform(transformer, targetObj.errors);
        }
    }
};
