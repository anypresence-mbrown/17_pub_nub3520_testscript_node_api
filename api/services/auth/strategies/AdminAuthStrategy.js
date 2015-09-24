var LocalStrategy = require('passport-local').Strategy,
    bcrypt        = require('bcrypt');

module.exports = function(sails, passport, deserializers) {
  sails.log.debug('Registering auth strategy "admin"');

  deserializers['admin'] = function(obj, cb) {
    Admin.findOne({id: obj.id}, cb);
  };

  passport.use('admin', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  }, function(req, username, password, done) {
    Admin.findOne({'email': username}, function(err, admin) {
      if (err) return done(err);
      if (!admin) return done(null, false, {message: 'Unknown user ' + username});
      bcrypt.compare(password, admin.passwordDigest, function(err, res) {
        if (err) return done(err);
        if (!res) return done(null, false, {message: 'Invalid password'});
        admin._principleType = 'admin';
        return done(null, admin);
      });
    });
  }));
};
