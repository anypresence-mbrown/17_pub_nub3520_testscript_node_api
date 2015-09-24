var property  = require('../../../config/properties').getProperty;
var inflection = require('inflection');
var isMessagingModel = require('../../../config/utilities').isMessaging;
var isAnalyticsModel = require('../../../config/utilities').isAnalytics;


/**
 * Creates a Swagger 2.0 specific HTTP POST request
 * @param model provided model
 * @returns {{tags: *[], summary: string, consumes: string[], produces: string[], parameters: *[], responses: *, security: *[]}}
 */
function createPost(model) {
    if(!model) return null;
    return {
        "tags": [model],
        "summary": "Adds a new resource using representation provided in body",
        "consumes": ["application/json"],
        "produces": ["application/json"],
        "parameters": [createBody(model)],
        "responses": createsHttpResponse(["201", "422", "500"])
    };
}

/**
 * Creates a Swagger 2.0 specific HTTP PUT request
 * @param model provided model
 * @returns {{tags: *[], summary: string, consumes: string[], produces: string[], parameters: *[], responses: *, security: *[]}}
 */
function createPut(model){
    if(!model) return null;
    return {
        "tags": [ model ],
        "summary": "Update an existing resource using representation provided in request body",
        "consumes": ["application/json"],
        "produces": ["application/json"],
        "parameters": [ createIdParamater(), createBody(model) ],
        "responses": createsHttpResponse(["204", "422", "404", "500"])
    };
}

/**
 * Creates a Swagger 2.0 specific HTTP GET BY ID request
 * @param model provided model
 * @returns {{tags: *[], summary: string, consumes: string[], produces: string[], parameters: *[], responses: *, security: *[]}}
 */
function createGetById(model){
    if(!model) return null;
    return {
        "tags": [ model ],
        "summary": "Get an existing representation of the given resource",
        "consumes": ["application/json"],
        "produces": ["application/json"],
        "parameters": [ createIdParamater()],
        "responses": createsHttpResponse(["200", "404", "500"])
    };
}

/**
 * Creates a Swagger 2.0 specific DELETE BY ID request
 * @param model provided model
 * @returns {{tags: *[], summary: string, consumes: string[], produces: string[], parameters: *[], responses: *, security: *[]}}
 */
function createDeleteById(model){
    if(!model) return null;
    return {
        "tags": [ model ],
        "summary": "Deletes an existing representation of a given resource",
        "consumes": ["application/json"],
        "produces": ["application/json"],
        "parameters": [ createIdParamater()],
        "responses": createsHttpResponse(["204", "404", "500"])
    };
}

/**
 * Creates a Swagger 2.0 specific HTTP GET ALL request
 * @param model provided model
 * @param version model version
 * @returns {{tags: *[], summary: string, consumes: string[], produces: string[], responses: *, security: *[]}}
 */
function createGetAll(model, version){
  if(!model) return;
  var queryParameters = createQueryParameters(model, version);
  return {
    "tags": [ model ],
    "summary": "Get collection of all resources",
    "consumes": ["application/json"],
    "produces": ["application/json"],
    "parameters": queryParameters,
    "responses": createsHttpResponse(["200", "404", "500"])
  };
}

/**
 * Given a model and a version, returns the array of parameters that need to be added to the spec, as well as the
 * query parameters for query scopes
 * @param model the pluralized model name
 * @param version the target model version
 * @returns {Array} the array of query parameters of the model, incluing the query scope specific one
 */
function createQueryParameters(model, version){
  var parameters = [];

  var _modelQueryScopes = function(modelDef){
    var modelQueryScopes = [];

    var _isQueryScope = function(modelKey){
      var scopeSuffix = "Scope";
      return modelKey.indexOf(scopeSuffix, this.length - scopeSuffix.length) !== -1;
    };

    var _getQueryScopeName = function(modelKey){
      var scopeKey = inflection.transform(modelKey, ['underscore']);
      scopeKey = " " + scopeKey.substring(0, scopeKey.length - 6);
      return scopeKey;
    };

    Object.keys(modelDef).forEach(function(modelKey){
      if(_isQueryScope(modelKey)) modelQueryScopes.push(_getQueryScopeName(modelKey));
    });

    if(modelDef.http){
      Object.keys(modelDef.http).forEach(function(modelKey){
        if(_isQueryScope(modelKey)) modelQueryScopes.push(_getQueryScopeName(modelKey));
      });
    }

    if(modelDef.soap){
      Object.keys(modelDef.soap).forEach(function(modelKey){
        if(_isQueryScope(modelKey)) modelQueryScopes.push(_getQueryScopeName(modelKey));
      });
    }

    return modelQueryScopes;
  };

  var modelDef = getModelDefinition(model, version);
  if(modelDef && modelDef._attributes){
    var modelParams = Object.keys(modelDef._attributes);

    /* adds the scope query parameter required to specify the desired query scope function */
    parameters.push({
      "name": "scope",
      "in": "query",
      "required": false,
      "type": "string",
      "description": "Use one of the defined query scopes: " + _modelQueryScopes(modelDef).toString()
    });

    /* adds a parameter entry per model attribute */
    modelParams.forEach(function(param){
      // we don't want to add the primary key as query param since there's a specific, parametrized route for it
      if(!modelDef._attributes[param].primaryKey){
        parameters.push({
          "name": "query["+param+"]",
          "in": "query",
          "required": false,
          "type": toSwaggerType(modelDef._attributes[param].type)
        });
      }
    });
  }

  return parameters;
}

/**
 * Creates Id parameter
 * @returns {{name: string, in: string, description: string, required: boolean, type: string}}
 */
function createIdParamater(){
    return {
        name: "id",
        in: "path",
        description: "Id of the resource to be operated",
        required: true,
        type: "string"
    }
}

/**
 * @param model provided model object
 * @return {Object} PUT request
 */
function createBody(model) {
    if(!model) return null;
    return {
        "in": "body",
        "name": "body",
        "description": "Representation of the resource that is going to be updated",
        "required": false,
        "schema": {
            "$ref": "#/definitions/" + (isMessagingModel(model) || isAnalyticsModel(model) ? model : pluralize(model))
        }
    }
}


/**
 * Given an array containing HTTP codes, creates a Swagger specific HTTP Response object
 * @param httpProvidedCodes provided HTTP codes. Response will be created based on provided values.
 * @returns {*} A Swagger 2.0 specific HTTP response object
 */
function createsHttpResponse(httpProvidedCodes){
    if(!httpProvidedCodes || httpProvidedCodes.length == 0 || httpProvidedCodes.constructor != Array) return [];

    var registeredHttpCodes = function() {
        return {
            "200": {
                "description": "Resource representation successfully returned"
            },
            "201": {
                "description": "Resource was successfully created"
            },
            "204": {
                "description": "Resource was successfully updated"
            },
            "404": {
                "description": "Requested resource does not exist"
            },
            "422": {
                "description": "Resource could not be created due to business validations were not achieved"
            },
            "500": {
                "description": "Error trying to process request"
            }
        }
    };

    var httpResponse = {};

    httpProvidedCodes.forEach(function(httpCode){
        var registeredCodes = registeredHttpCodes();
        var code = registeredCodes[httpCode];
        if(!code){
            code = registeredCodes["500"];
            httpResponse["500"] = code;
        } else {
            httpResponse[httpCode] = code;
        }
    });

    return httpResponse;
}

/**
 * Maps a sailsjs data type to a swagger type. Most of the types are matches, but in
 * some cases such as "text", it needs to be converted to "string"
 * @param sailsDataType the sailsjs data type
 * @returns {string} the mapped data type on Swagger spec
 */
function toSwaggerType(sailsDataType){
    if(!sailsDataType){
        return 'string';
    }
    switch(sailsDataType){
        case 'text': {
            return 'string';
        }

        // TODO Fixme
        case 'array': {
            return 'string';
        }
    }

    return sailsDataType;
}


/**
 * Creates Swagger 2.0 properties
 * @param model provided model
 * @param targetVersion the API target version
 * @returns {{}}
 */
function createSwaggerProperties(modelName, modelAttributes, targetVersion) {
    var swaggerProperties = {};
    modelName = inflection.transform(modelName, ['camelize', 'singularize']).toLowerCase();

    if (!isMessagingModel(modelName) || !isAnalyticsModel(modelName)) {
        modelName = targetVersion + modelName;
    }
    if (modelAttributes[modelName]) {
        var defaultProperties = modelAttributes[modelName]._attributes;
        for (var property in defaultProperties) {
            if (defaultProperties.hasOwnProperty(property)) {
                swaggerProperties[property] = {
                    "type": toSwaggerType(defaultProperties[property].type)
                }
            }
        }

        if (modelAttributes[modelName + "custom"]) {
            var customProperties = modelAttributes[modelName + "custom"]._attributes;
            for (var property in customProperties) {
                if (customProperties.hasOwnProperty(property)) {
                    swaggerProperties[property] = {
                        "type": toSwaggerType(customProperties[property].type)
                    }
                }
            }
        }
    }

    return swaggerProperties;
}

/**
 * Creates Swagger 2.0 specific object definitions
 * @param models application defined object models
 * @param targetVersion target api version
 * @returns {{}} Swagger 2.0 object definition object
 */
function createSwaggerDefinitions(models, modelAttributes, targetVersion) {
    var modelDefinitions = {};

    for (var key in models) {
        modelDefinitions[models[key]] = {
            "properties": createSwaggerProperties(models[key], modelAttributes, targetVersion)
        }
    }
    return modelDefinitions;
}

/**
 * @param text text to be pluralized
 * @returns {*} plural of provided text, empty string if empty string provided.
 */
function pluralize(text){
    if(!text) return "";
    return inflection.transform(text, ['pluralize', 'underscore'])
}

/**
 * returns the model definition based on model name and version (if versioned)
 * @param model pluralized the model name
 * @param version the model version
 * @returns {string} the model definition
 */
function getModelDefinition(model, version){
  if(isMessagingModel(model)) return sails.models[model];
  if(!version) return null;
  var modelName = version.toLowerCase() + inflection.transform(model, ['camelize', 'singularize']).toLowerCase();
  return sails.models[modelName];
}

/**
 * Public Interface
 * @type {{createPost: createPost, createPut: createPut, createGetById: createGetById, createGetAll: createGetAll, getModelsForVersion: getModelsForVersion, createsHttpResponse: createsHttpResponse, createSwaggerDefinitions: createSwaggerDefinitions, isMessaging: isMessaging, createIdParameter: createIdParamater, createBody: createBody, pluralize: pluralize}}
 */
module.exports = {
    createPost               : createPost,
    createPut                : createPut,
    createGetById            : createGetById,
    createGetAll             : createGetAll,
    createDeleteById         : createDeleteById,
    createsHttpResponse      : createsHttpResponse,
    createSwaggerDefinitions : createSwaggerDefinitions,
    createIdParameter        : createIdParamater,
    createBody               : createBody,
    pluralize                : pluralize,
    toSwaggerType            : toSwaggerType
};
