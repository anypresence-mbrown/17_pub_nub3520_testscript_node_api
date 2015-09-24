var fs = require('fs');
var path = require('path');
var specification = require('./swagger/swagger_spec').spec;
var property  = require('../../config/properties').getProperty;
var supportedVersions = require('../../config/utilities').getSupportedVersions;
var applicationModels = require('./../../config/utilities').getApplicationModelNames;
var applicationModelsAttributes = require('./../../config/utilities').getSailsApplicationModels;

const SPEC_DIRECTORY = "../../assets/swagger/specs/";
const SPEC_FILE_NAME = "/spec.json";

/**
 * Creates API documentation based on Swagger 2.0
 * @param done callback function
 * https://github.com/swagger-api/swagger-spec/blob/master/versions/2.0.md)
 */
var createApiDocs = function (done) {
    supportedVersions().forEach(function (version) {
        var dir = path.join(__dirname, SPEC_DIRECTORY + version);
        var file = path.join(dir, SPEC_FILE_NAME);

        createSpecDirectoryOn(dir).andThereSpec(file, version, applicationModels(version), applicationModelsAttributes(), done);
    });
};


/**
 * Creates sucessful message to be logged in case spec for api version was successfully created
 * @param version the version of the API
 * @returns {string} A success version
 */
var successMessage = function (version) {
    if (!version) {
        version = "NOT_DEFINED_VERSION";
    }
    return "Swagger 2.0 specification for api " + version + " successfully created";
};


/**
 * Creates directory where spec for a particular version will be placed (in example, assets/swagger/specs/v1) in case
 * directory does not exist, and returns an object with a convenient function to create specification file.
 * @param dir
 * @returns {{andThereSpec: Function}}
 */
function createSpecDirectoryOn(dir) {

    try {
        fs.mkdirSync(dir);
    } catch (e) {
        if (e.code != 'EEXIST') throw e;
    }

    return {
        andThereSpec: function (specFile, version, models, modelsAttributes, done) {
            var cb = done;
            fs.writeFile(specFile, specification(version, models, modelsAttributes), function (err) {
                if (err) {
                    sails.log.debug(err);
                    cb();
                } else {
                    sails.log.debug(successMessage(version));
                    cb();
                }
            });
        }
    }
}


/**
 * Public Interface
 * @type {{createApiDocs: Function}}
 */
module.exports = {
    createApiDocs: createApiDocs,
    successMessage : successMessage
};
