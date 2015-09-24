var util = require('util'),
    transformService = require('../services/transform/TransformService'),
    authService = require('../services/auth/AuthService'),
    _ = require('lodash');

module.exports = function(req,res,next) {
  transformService.transformIn(req, res, req.body);

  // Always set content-type to json
  res.setHeader('Content-Type', 'application/json');

  var send = res.send;
  res.send = function() {
    var _arguments = arguments;
    if (_.isFunction(res.postControllerAction)) {
      res.postControllerAction(req, res, function() {
        delete res.postControllerAction;
        return send.apply(res, _arguments);
      });
    } else {
      return send.apply(res, _arguments);
    }
  };

  var json = res.json;
  res.json = function() {
    var args, status;
    if (_.keys(arguments).length === 2) {
      status = arguments['0'];
      args = arguments['1'];
    } else if (_.keys(arguments).length === 1) {
      args = arguments['0'];
      status = 200;
    }
    if (args && (status >= 200 && status < 300)) {
      var readableFields = authService.readableFields(req);
      if (readableFields) {
        if (_.isArray(args)) {
          args.forEach(function(arg) {
            ModelScrubber.scrub(arg, readableFields);
          });
        } else {
          ModelScrubber.scrub(args, readableFields);
        }
      }
      transformService.transformOut(req, res, args);
    } else if (args && status == 422) {
      transformService.transformErrors(req, res, args);
    }

    return json.apply(res, arguments);
  };
  return next();
};
