// config/policies.js

/**
* Policy defines middleware that is run before each controller/controller.
* Any policy dropped into the /middleware directory is made globally available through sails.middleware
* Below, use the string name of the middleware
*/
module.exports.policies = {
  // default require authentication
  // see api/policies/authenticated.js
	'*': [ 'requestLogger', 'jsonRedirect', 'redirect', 'transform', 'authenticated', 'context', 'customControllerCallbacks' ],

  // whitelist the auth controller
	'APAuthenticatedSessionsController': {
		'login': [ 'requestLogger', 'transform', 'context' ],
		'logout' : [ 'requestLogger' ],
    
	},

  // whitelist the admin controller
  'AdminController': {
    'index': [ 'redirect' ],
    'countAll': [ ]
  },

	// whitelist the health check controller
	'APHealthCheckController': {
		'healthcheck' : [ 'requestLogger' ]
	}
};
