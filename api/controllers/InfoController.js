var utilities = require('../../config/utilities');
var sails = require('sails');

var InfoController = {
    find: function (req, res) {
        sails.log.debug('InfoController.find::');
        if(!req.query.version){
            sails.log.error('InfoController.find::Missed version parameter');
            return res.send(422);
        } else {
            var info = {
                "supported_api_versions" : utilities.getSupportedVersions(),
                "api_models": utilities.getApplicationModelNames(req.query.version, null)
            };
            return res.send(200, info);
        }
    }
};

/**
 * Public Interface
 * @type {{find: Function}}
 */
module.exports = InfoController;
