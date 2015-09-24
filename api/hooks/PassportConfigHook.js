var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    bcrypt = require('bcrypt');

module.exports = function(sails) {
  return {

    initialize: function(cb) {

      sails.on('hook:orm:loaded', function() {
        var deserializers = {};

        passport.deserializeUser(function(obj, done) {
          deserializers[obj._principleType](obj, function(err, principle) {
            if (err) return done(err);
            return done(null, principle);
          });
        });

        passport.serializeUser(function(obj, done) {
          done(null, obj);
        });


        

        require('../services/auth/strategies/AdminAuthStrategy')(sails, passport, deserializers);

        cb();
      });

    }
  };
};
