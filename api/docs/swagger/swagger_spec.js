var property  = require('../../../config/properties').getProperty;
var transformer = require('../swagger/swagger_transformer');
var modelsForVersion = require('../../../config/utilities').getApplicationModelNames;
var isMessagingModel = require('../../../config/utilities').isMessaging;
var isAnalyticsModel = require('../../../config/utilities').isAnalytics;
var swaggerDefinitions = transformer.createSwaggerDefinitions;
var httpPost = transformer.createPost;
var httpPut = transformer.createPut;
var httpGetById = transformer.createGetById;
var httpGetAll = transformer.createGetAll;
var httpDeleteById = transformer.createDeleteById;


/**
 * Given a target API version (in example, v1) creates a Swagger 2.0 compliant specification
 * @param version target API version
 * @param applicationModels application defined models
 * @param applicationModelsAttributes the application models attributes
 * @returns {*} A Swagger 2.0 specification
 */
function spec(version, applicationModels, applicationModelsAttributes) {
    if(!version || !applicationModels) return null;
    var models = modelsForVersion(version, applicationModels);
    var spec = {
        "swagger": "2.0",
        "info": {
            "description": "This is Swagger 2.0 compliant client for AnyPresence Node generated API",
            "version": version,
            "title": getApplicationTitle(),
            "termsOfService": "http://www.anypresence.com/terms/",
            "contact": { "name": "info@anypresence.com" }
        },
        "basePath": "/api",
        "schemes": ["http"],
        "paths": getApiPaths(models, version),
        "definitions": swaggerDefinitions(models, applicationModelsAttributes, version)
    };

    return JSON.stringify(spec);
}

/**
 * Creates API paths as required for Swagger 2.0 spec
 * @param models application defined models
 * @param version target version
 * @returns {{}} An object containing routes
 */
var getApiPaths = function(models, version) {
    var apiPaths = {};
    for(var key in models){
        var prefix = isMessagingModel(models[key]) ? "/push_notifications" : isAnalyticsModel(models[key]) ? "" : "/" + version;
        apiPaths[prefix + "/" + models[key]] = {};
        apiPaths[prefix + "/" + models[key]+"/{id}"] = {};
        apiPaths[prefix + "/" + models[key]+"/{id}"]["get"] = httpGetById(models[key]);
        apiPaths[prefix + "/" + models[key]]["get"] = httpGetAll(models[key], version);
        apiPaths[prefix + "/" + models[key]]["post"] = httpPost(models[key]);
        apiPaths[prefix + "/" + models[key]+"/{id}"]["put"] = httpPut(models[key]);
        apiPaths[prefix + "/" + models[key]+"/{id}"]["delete"] = httpDeleteById(models[key]);
    }

    return apiPaths;
};

/**
 * @returns {string} Application Title
 */
function getApplicationTitle() {
    return "HTTP REST API";
}


/**
 * Public Interface
 * @type {{spec: spec}} Swagger 2.0 spec
 */
module.exports = {
    spec: spec
};

