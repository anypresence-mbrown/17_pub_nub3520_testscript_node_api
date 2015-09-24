var sails = require('sails'),
    util = require('util');


module.exports = function(grunt) {
  'use strict';

  grunt.registerMultiTask('seed', function() {
      var done = this.async();

      var admin = {
        email: this.data.email,
        password: this.data.password,
        passwordConfirmation: this.data.password
      };

      sails.lift({log: 'error'}, function() {
        Admin.findOne({ 'email': admin.email}, function(err, obj) {
          if(err) return done(err);

          //If no admin object with that email exists in the database
          //then create a new one.
          if (!obj) {
            Admin.create(admin).then(function(err, res) {
              if (err) return done(err);

              grunt.log.writeline('Database admin user seeded.');
              done();
            });
          } else {
            done();
          }
        });
    });
  });
};
