// When an auth strat (OAuth, etc) attempts to redirect a JSON client,
// send them a payload with the redirect info instead so that the client
// can handle the redirect gracefully.
module.exports = function(req, res, next) {
  var redirect = res.redirect;
  res.redirect = function() {
    var accept = req.headers['Accept'];
    if (accept && accept.indexOf('application/json') !== -1) {
      return res.send(302, {message: 'You are being redirected', redirectUrl: arguments[0]});
    }
    return redirect.apply(res, arguments);
  };
  next();
};
