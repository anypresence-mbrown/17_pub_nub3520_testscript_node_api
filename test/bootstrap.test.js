var Sails = require('sails');
var passportStub = require("passport-stub");

before(function(done) {
  Sails.lift({
    // configuration for testing purposes
	port: process.env.TEST_PORT || 1337,
    // turn down the log level so we can view the test results
    log: {
      level: 'error'
    },
    adapters: {
      'local': { module: 'sails-memory' }
    }
  }, function(err, sails) {
    if (err) return done(err);
    // here you can load fixtures, etc.
    passportStub.install(sails.hooks.http.app);
    app = sails;
    deviceController = app.controllers.device;
    channelController = app.controllers.channel;
    messageController = app.controllers.message;

    done(err, sails);
  });
});

after(function(done) {
  // here you can clear fixtures, etc.
  sails.lower(done);
});
