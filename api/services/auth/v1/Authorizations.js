module.exports = {
//uses_authentication && has_object_role_authorizations	
  'v1publish': {
    'requiresAuthentication': false,
		
    'Unauthenticated Default': {
      'permittedScopes': [ 'all', 'exactMatch', 'count', 'countExactMatch' ],
      'objectLevelPermissions': [ 'create', 'read', 'update', 'delete' ],
      'fieldLevelPermissions': {
        'creatable': [ 'channel', 'message', 'pubkey', 'sig', 'subkey', 'timestamp' ],
        'updatable': [ 'channel', 'message', 'pubkey', 'sig', 'subkey', 'timestamp' ],
        'readable' : [ 'id', 'channel', 'message', 'pubkey', 'sig', 'subkey', 'timestamp' ]
			}
		},
		
	},
	
};