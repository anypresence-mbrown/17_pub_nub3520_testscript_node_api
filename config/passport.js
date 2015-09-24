var passport = require('passport');
var util = require('util');

// See hooks.js for additional configuration

module.exports = {

  // Register the passport middleware
	express: {
		customMiddleware: function(app) {
		  app.use(function(req,res,next) {
        var xSessionId = req.headers['x-session-id'];
        if (typeof xSessionId === 'undefined') {
          return next();
        } else {
          sails.log.debug('X-Session-Id Header : ' + xSessionId );
          sails.session.get(xSessionId, function(err, sessionData) {
            if (err) {
              sails.log.debug('Invalid X-Session-Id, moving on...');
              return next();
            } else {
              sails.log.debug('Loaded Session : ' + util.inspect(sessionData) );
              req.sessionID = xSessionId;
              if (sessionData && sessionData.passport) {
                req.session.passport = sessionData.passport;
              }
              return next();
            }
          });
        }
      });
			app.use(passport.initialize());
			app.use(passport.session());
		}
	}

};
