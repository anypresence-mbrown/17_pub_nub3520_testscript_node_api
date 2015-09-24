var bcrypt = require('bcrypt');

module.exports = function(values) {
  if (values.password) {
    if(values.password !== values.passwordConfirmation) throw { ValidationError: "password and passwordConfirmation must match!" };
    values.passwordDigest = bcrypt.hashSync(values.password, 10);
  }
};
