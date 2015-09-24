var sails = require('sails');
var bcrypt = require('bcrypt');

function hashPassword(values, next) {
  if (values.password) {
    bcrypt.hash(values.password, 10, function(err, res) {
      if (err) return next(err);

      values.passwordDigest = res;
      delete values.password;
      delete values.passwordConfirmation;
      next();
    });
  }
}

var adapter = (sails.config && sails.config.environment === 'test') ? 'memory' : 'local';

Admin = module.exports = {
	tableName: 'x_admin',
    connection: [ adapter ],
  attributes: {
		email: {
			type: 'string',
			required: true
    },
    password: {
			type: 'text'
		},
		passwordConfirmation: {
			type: 'text'
		},
		passwordDigest: {
			type: 'text'
		},

		isAdmin: function() {
			return true;
		}
  },
  autoPK: true,
  beforeCreate: function(values, next) {
	  if (values.password && values.passwordConfirmation) return hashPassword(values, next);
	  next();
	},
	beforeUpdate: function(values, next) {
	  if (values.password && values.passwordConfirmation) return hashPassword(values, next);
	  next();
	},
};
