module.exports = function(req, res, next) {
  req.context = {
    current_user: req.user,
    currentUser: req.user,
    session: req.session,
    params: req.params,
    query: req.query,
    body: req._origBody,
    env: sails.config.env
  };
  next();
}
