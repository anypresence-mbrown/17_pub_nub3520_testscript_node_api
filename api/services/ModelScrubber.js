var util = require('util');

module.exports = {
	scrub: function (obj, modelDef) {
    _.keys(obj).forEach(function(key) {
      if(util.isArray(modelDef)) {
        if(! _.contains(modelDef, key)) {
					delete obj[key];
				}				
			}
      else if(typeof modelDef == 'object') {
				if(! _.contains(_.keys(modelDef), key)) {
					delete obj[key];
				}
			}
      else {
				throw { name: 'InvalidArgumentException', message: "Expected " + modelDef + " to be either an array or an object" };
			}
		});
	}
};