var inflection  = require('inflection'),
    _           = require('lodash');

module.exports = function (req, res, next) {
  var action = req.options.action;
  if (action === 'find' && !req.params.id) {
    action = (req.query['scope'] || 'all') + 'Scope';
  }

  var controller = sails.controllers[req.options.controller];

  if (!action || (!controller || !controller.callbacks)) return next();

  // Add the post controller action (if it exists) to the response,
  // so that it can be called later.
  var postAction = 'after' + inflection.camelize(action);
  if (_.isFunction(controller.callbacks[postAction])) {
    res.postControllerAction = controller.callbacks[postAction];
  }

  // Invoke pre action, i.e. beforeFind, beforeAllScope, etc if it exists
  var preAction = 'before' + inflection.camelize(action);
  if (_.isFunction(controller.callbacks[preAction])) {
    return controller.callbacks[preAction](req, next);
  } else {
    next();
  }
};
