var util = require('util');

module.exports = function(req,res,next) {
  if (sails.config.environment == 'development') {
    sails.log.debug('Received ' + req.method + ' ' + req.url + ' ' + util.inspect(req.body));
    sails.log.debug('Session : ' + util.inspect(req.session));
  }
  return next();
};
