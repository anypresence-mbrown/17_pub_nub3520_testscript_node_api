var redirectTable = {
  '/': '/admin'
};

module.exports = function(req, res, next) {
  var route = redirectTable[req.route.path];
  if (route) {
    sails.log.debug('Redirecting "' + req.route.path + '" to "' + route + '"');
    return res.redirect(route);
  }
  next();
};