var util = require('util');

var methods = {
  'GET': 'read',
  'POST': 'create',
  'PUT': 'update',
  'PATCH': 'update',
  'DELETE': 'delete'
};

var getPermissions = function(req){
    sails.log.debug("getPermissions called with " + req.options.controller);
    var matchData = req.options.controller.match(/v(\d+)(.+)/);
    if(matchData){
        // assume first token is version number and second is object ...
        var version = matchData[1];
        var object = matchData[0];
        sails.log.debug("version is " + version + " and object is " + object);
        var authService = require("./v" + version + "/Authorizations");
        if (authService[object]) {
          return authService[object]
        }
    }
    // If no valid permissions are found for an action, the result is expected
    // to be falsey, so just return undefined.
    return;
};

module.exports = {
  currentUserIsSystemAdmin: function(req) {
    if(req.user) {
			return req.user.isAdmin();
		}
		else {
			return false;
		}
	},
  currentUser: function(req){
    return req.user;
	},
  currentUserRole: function(req) {
    if(req.user && req.user.isAdmin()) return "System Admin";
    if(req.user) return this.getUserRole(req.user);
		return "Unauthenticated Default";
	},

  getUserRole: function(user) {
    
    return "Unauthenticated Default";
    
  },

  isAuthenticated: function(req) {
    if(this.requiresAuth(req)){
			return this.currentUserRole(req) != "Unauthenticated Default";
		}
		else {
			return true;
		}
  },

  isAuthorized: function(req) {
    if (req.user && req.user.isAdmin()) {
      // The internal admin user will always be authorized.
      return true;
    }

    var perms = getPermissions(req);

    if(!perms) {
      return false;
		}
    else {
      // Permissions are defined.  if role is not explicitly defined, forbid access
      var currentRole = this.currentUserRole(req);
      var permsForRole = perms[currentRole];

      if(!permsForRole) return false;

			var allowed = false,
          action = methods[req.method],
          id = req.params['id'];

      if (action === 'read' && !id) {
        var scope = req.query['scope'] || 'all';
        allowed = _.contains(permsForRole.permittedScopes, scope);
      } else {
        allowed = _.contains(permsForRole.objectLevelPermissions, action);
      }

      if (allowed) {
        var fieldPermissions = {
          'create': permsForRole.fieldLevelPermissions.creatable,
          'update': permsForRole.fieldLevelPermissions.updatable
        };

        var actionPermissions = fieldPermissions[action];

        if (!actionPermissions && (action === 'create' || action === 'update')) return;

        ModelScrubber.scrub(req.body, fieldPermissions[action]);
      }

      return allowed;
		}
  },

  requiresAuth: function(req) {
    var perms = getPermissions(req);
    if(perms) {
			return perms.requiresAuthentication;
		}
		else {
			return false;
		}
  },

  readableFields: function(req) {
    var perms = getPermissions(req);
    if (!perms) return;

    var currentRole = this.currentUserRole(req);
    var permsForRole = perms[currentRole];
    if(!permsForRole) return;

    var fieldPerms = permsForRole.fieldLevelPermissions;
    if(!fieldPerms) return;

    return fieldPerms.readable;
  }
};
