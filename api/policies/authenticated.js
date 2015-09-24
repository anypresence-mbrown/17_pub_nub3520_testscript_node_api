var authService = require('../services/auth/AuthService');

module.exports = function(req,res,next) {
  // if there is a current user, and the user is an admin, then bypass the authorization logic, as
  // this is an admin user that is hitting the app through the admin console.
  if (req.user && req.user.isAdmin()) return next();

  if (req.options.controller == 'device'  ||
      req.options.controller == 'channel' ||
      req.options.controller == 'message') return next();

  var requiresAuth = authService.requiresAuth(req);
  if (requiresAuth && !authService.isAuthenticated(req)) {
    res.send(401, {"message": "Not Authorized"});
  } else if (!authService.isAuthorized(req)) {
    res.send(403, {"message": "Forbidden"});
  } else {
    return next();
  }
};
