var inflection = require('inflection');
var fs = require('fs');
var props = require('./properties');

/**
 * @type {string[]} Array containing the names of the models defined for the messaging API
 */
const MESSAGING_MODELS = ['channel', 'message', 'device'];

/**
 * @type {string[]} Array containing the names of the models defined for the messaging API
 */
const ANALYTICS_MODELS = ['activity'];

/**
 * @type {string[]} Array containing the names of the valid actions that can be executed
 */
const ACTION_NAMES = ['SIGN_IN', 'SIGN_OUT', 'CREATE', 'READ', 'UPDATE', 'DELETE', 'QUERY_SCOPE'];


/**
 * @type {string} String with the relative path to the directory where API controllers are placed
 */
const CONTROLLERS_DIRECTORY = './api/controllers';

/**
 * @type {RegExp} Regular Expression that defines if a given expression matches the controller file name pattern
 */
const CONTROLLER_PATTERN = /(?:\.\/api\/controllers)\/V(\d+)(.*)Controller\.[coffee|js]/

/**
 * @type {RegExp} Regular Expression to validate a given input is a valid IPv4 or IPv6 IP
 */
const IPV4_OR_IPV6_PATTERN = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$|^(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])$|^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/

/**
 * @type {RegExp} Regular Expression to validate that a given text has version format (v1, v2, etc)
 */
const VERSION_PATTERN = /^v[0-9]+/

/**
 * Default application log level
 */
const DEFAULT_LOG_LEVEL = 'info';

/**
 * @type {string[]} Valid Log Levels
 */
const LOG_LEVELS = ['silent', 'error', 'warn', 'debug', 'info', 'verbose', 'silly'];

/**
 * given an array of strings, transforms them to a normalized form (pluralized + underscores replacing camel case)
 * @param modelNames array containing non normalized strings
 */
function getNormalizedNames(modelNames){
    if (!modelNames) return [];
    var normalizedFileNames = [];

    modelNames.forEach(function(fileName){
        normalizedFileNames.push(inflection.transform(fileName, ['pluralize', 'underscore']));
    });

    return normalizedFileNames;
}

/**
 * Gets application models, including messaging and analytics specific names
 * @param targetVersion the target version for the
 * @param options optional parameters.
 *      options: modelNames -> model names can be provided instead of getting them using file system (check tests for use)
 * @returns {Array} containing the names of the models extracted from the controller's file names
 */
function getApplicationModelNames(targetVersion, options) {

    var names = [];

    if (options && options.modelNames) {
        for (var modelName in options.modelNames) {
            if (options.modelNames[modelName].indexOf(targetVersion) != -1) {
                names.push(options.modelNames[modelName]);
            }
        }
    } else {
        var controllers = [];
        var _getVersionLength = function(controllerName){
          if(!controllerName || controllerName[0].toLowerCase() != "v") return 0;
          for (var i = 1; i < controllerName.length ; i++){
            if(isNaN(controllerName[i])) return i;
          }
        };
        listDirectoryFiles(CONTROLLERS_DIRECTORY, controllers);
        controllers.forEach(function (controllerName) {
            controllerName = controllerName.split("/")[3].split(".")[0];
            var matchVersionNameFormat = controllerName.match(/^V[0-9]\w+Controller\b/);
            var matchesTargetVersion = controllerName.substring(0, _getVersionLength(controllerName)).toLowerCase() == targetVersion.toLowerCase();

            if (matchVersionNameFormat && matchesTargetVersion) {
              var normalizedControllerName = inflection.transform(controllerName.substring(_getVersionLength(controllerName), controllerName.length - 10), ['pluralize', 'underscore']);
                names.push(normalizedControllerName);
            }
        });
    }

    names = names.filter(function (name, pos) {
        return names.indexOf(name) == pos;
    });

    MESSAGING_MODELS.forEach(function (messagingModel) {
        names.push(messagingModel);
    });

    ANALYTICS_MODELS.forEach(function (analyticsModel) {
        names.push(analyticsModel);
    });

    return names;
}

/**
 * Get SailsJS models
 * @returns {*}
 */
function getSailsApplicationModels(){
    return sails.models;
}


/**
 * @returns {*} application supported versions
 */
function getSupportedVersions() {
    var modelNames = [];
    var applicationSupportedVersions = [];
    listDirectoryFiles(CONTROLLERS_DIRECTORY, modelNames);

    modelNames.forEach(function(fileName){
        var matchData = fileName.match(CONTROLLER_PATTERN);
        if (matchData) {
            applicationSupportedVersions.push("v"+matchData[1]);
        }
    });

    return applicationSupportedVersions.filter(function(item, pos, self) {
        return self.indexOf(item) == pos;
    })
}

/**
 * @returns {*} current API Version (latest API version number)
 */
function getCurrentApiVersion(){
    return 1;
}


/**
 * Determines if a given tokenized URL contains the corresponding amount of elements for an unversioned URL.
 * An unversioned URL does not contain the version id in its path. In exampĺe /api/myObject.
 * A versioned URL would be /api/v1/myObject
 * @param tokenizedUrl A tokenized URL
 * @returns {*|boolean} TRUE if the amount of elements of the tokenized URL correponds to one of an unversioned URL
 */
function isUnversionedUrl(tokenizedUrl){
  return tokenizedUrl && tokenizedUrl.length > 2 && !tokenizedUrl[1].match(/v\d+/) && !tokenizedUrl[2].match(/v\d+/);
}


/**
 * Get a recursive list of files under the api/controllers directory
 * @param directory the directory where search will start
 * @param directoryFiles the files in the given directory
 */
function listDirectoryFiles(directory, directoryFiles) {
    var stat = fs.statSync(directory);
    if (stat.isDirectory()) {
        var filesInDir = fs.readdirSync(directory);
        for (var i = 0; i < filesInDir.length; i++) {
            var currentFile = filesInDir[i];
            if (currentFile.slice(0,1) != '.') {
                listDirectoryFiles(directory + "/" + currentFile, directoryFiles);
            }
        }
    } else if (stat.isFile()) {
        directoryFiles.push(directory);
    }
}

/**
 * Given a model names, determines if its a messaging model name or not
 * @param model the model name
 * @returns {boolean} TRUE if its a messaging model name, otherwise false
 */
function isMessaging(model) {
    return MESSAGING_MODELS.some(function (messagingModel) {
        if (messagingModel == model) return true;
    });
}

/**
 * Given a model name, determines if its an analytics model name or not
 * @param model the model name
 * @returns {boolean} TRUE if its a analytics model name, otherwise false
 */
function isAnalytics(model) {
    return ANALYTICS_MODELS.some(function (messagingModel) {
        if (messagingModel == model) return true;
    });
}

/**
 * Given an HTTP Request, extracts the model version from the API. If its a versionless url, returns null
 * @param req the HTTP request from which version will be extracted
 * @returns {*} the version or null if versionless
 */
function requestApiVersion(req){
    var apiVersionToken = req.path.split('/')[2];
    if(apiVersionToken.match(VERSION_PATTERN)){
        return apiVersionToken;
    } else {
        return null;
    }
}

/**
 * Extracts model name from request
 * @param req HTTP request from which model name is extracted
 * @returns {*} model name
 */
function requestModelName(req){
    if(requestApiVersion(req)){
        return req.path.split('/')[3]
    } else {
        return req.path.split('/')[2]
    }
};

/**
 * Given an HTTP request, returns the consumer IP
 * @param req the HTTP request
 * @returns {string} IP or domain of the API consumer
 */
function requestIp(req){
    return req.ip;
}

/**
 * Given an HTTP Request, returns the consumer user agent
 * @param req the HTTP request
 * @returns {*} the User Agent of the request
 */
function requestUserAgent(req){
    return req.headers['user-agent'];
}

/**
 * Given an HTTP request, analyse it and determines the operation
 * @param req the HTTP request to be analysed
 * @returns {string} a valid operation string, or null if request is not mapped to an operation to be monitored
 */
function requestOperation(req){
    var path = req.path;
    var isApiModel = path.indexOf('api');
    if(path.indexOf('callback') != -1) return 'SIGN_IN';
    if(path.indexOf('signout') != -1) return 'SIGN_OUT';

    if(isApiModel != -1){
        if(req.method.toUpperCase() === 'GET') return 'READ';
        if(req.method.toUpperCase() === 'POST') return 'CREATE';
        if(req.method.toUpperCase() === 'PUT') return 'UPDATE';
        if(req.method.toUpperCase() === 'DELETE') return 'DELETE';
    }

    return null;
}


/**
 * Given a URL string, returns it without extra slashes in its path. In example,
 * if provided 'http://myurl.com//mypath', after applying this function it will
 * be returned 'http://myurl.com/mypath'. Other examples:
 * 'http://myurl.com//mypath//path' -> 'http://myurl.com/mypath/path'
 * In case that provided URL is not valid, or is null, it will return an empty string.
 * @param url the url to be transformed
 * @returns {string} the URL string without extra slashes in its path
 */
function removeExtraSlashesFromUrlPath(url) {
    if (!url || typeof url != "string") return "";

    var isTokenWithTrailingSlash = function (token) {
        return token.slice(-1) == "/"
    };

    var isRequiredSlashToConcat = function (token, currentPosition, lastPosition) {
        return !isTokenWithTrailingSlash(token) && currentPosition < lastPosition;
    };

    var isHttpProtocolTokenIncluded = function (tokenizedUrl) {
        return tokenizedUrl[0].toLowerCase().indexOf("http") != -1;
    };

    var tokenizedUrl = url.split("//");
    tokenizedUrl = tokenizedUrl.filter(function (token) {
        return token != "";
    });

    var transformedUrl = "";

    for (var i = 0; i < tokenizedUrl.length; i++) {
        var startsWithSlash = function(){
            return tokenizedUrl[i].charAt(0) == "/";
        };
        var appendTokenWithDoubleSlash = function(){
            transformedUrl += tokenizedUrl[i] + "//";
        };
        var appendTokenWithSingleSlash = function(){
            transformedUrl += tokenizedUrl[i] + "/";
        };
        var appendToken = function(){
            transformedUrl += tokenizedUrl[i];
        };
        var appendSingleSlash = function(){
            transformedUrl += "/";
        };
        var firstToken = function(){
            return i == 0;
        };
        var appendTokenRemovingSlash = function(){
            transformedUrl += tokenizedUrl[i].substring(1, tokenizedUrl[i].length)
        };
        var endWithSlash = function(){
            return transformedUrl.charAt(transformedUrl.length -1) == "/";
        };

        if (isRequiredSlashToConcat(tokenizedUrl[i], i, tokenizedUrl.length - 1)) {
            if (firstToken()) {
                if (isHttpProtocolTokenIncluded(tokenizedUrl)) {
                    appendTokenWithDoubleSlash()
                } else {
                    if(!startsWithSlash()) appendSingleSlash();
                    appendTokenWithSingleSlash();
                }
            } else {
                startsWithSlash() ? appendTokenRemovingSlash() : appendTokenWithSingleSlash();
            }
        } else {
            if(firstToken() || !endWithSlash()) appendSingleSlash();
            startsWithSlash() ? appendTokenRemovingSlash() : appendToken();
        }
    }

    return transformedUrl;
}

/**
 * Given an object, returns its size iin bytes
 * @param object the object to be measured
 * @returns {number} the number of bytes of the object
 */
function sizeOf( object ) {

    var objectList = [];
    var stack = [ object ];
    var bytes = 0;

    while ( stack.length ) {
        var value = stack.pop();
        if ( typeof value === 'boolean' ) {
            bytes += 4;
        }
        else if ( typeof value === 'string' ) {
            bytes += value.length * 2;
        }
        else if ( typeof value === 'number' ) {
            bytes += 8;
        }
        else if
                (
                typeof value === 'object'
                && objectList.indexOf( value ) === -1
                )
        {
            objectList.push( value );
            for( var i in value ) {
                stack.push( value[ i ] );
            }
        }
    }
    return bytes;
}

/**
 * @returns {string} log level of application
 */
function getLogLevel(){
  var level;
  var providedLogLevel = props.getProperty('APP_LOGGING_LEVEL');
  LOG_LEVELS.forEach(function(logLevel){
    if(providedLogLevel === logLevel) level = logLevel;
  });
  return level ? level : DEFAULT_LOG_LEVEL;
}


/**
 * Public Interface
 */
module.exports = {
    getNormalizedNames            : getNormalizedNames,
    listDirectoryFiles            : listDirectoryFiles,
    getApplicationModelNames      : getApplicationModelNames,
    getSupportedVersions          : getSupportedVersions,
    sizeOf                        : sizeOf,
    isMessaging                   : isMessaging,
    isAnalytics                   : isAnalytics,
    getSailsApplicationModels     : getSailsApplicationModels,
    getCurrentApiVersion          : getCurrentApiVersion,
    isUnversionedUrl              : isUnversionedUrl,
    requestOperation              : requestOperation,
    requestUserAgent              : requestUserAgent,
    requestIp                     : requestIp,
    requestApiVersion             : requestApiVersion,
    removeExtraSlashesFromUrlPath : removeExtraSlashesFromUrlPath,
    requestModelName              : requestModelName,
    getLogLevel                   : getLogLevel,
    CONTROLLER_PATTERN            : CONTROLLER_PATTERN,
    MESSAGING_MODELS              : MESSAGING_MODELS,
    CONTROLLERS_DIRECTORY         : CONTROLLERS_DIRECTORY,
    ACTION_NAMES                  : ACTION_NAMES,
    IPV4_OR_IPV6_PATTERN          : IPV4_OR_IPV6_PATTERN,
    ANALYTICS_MODELS              : ANALYTICS_MODELS,
    VERSION_PATTERN               : VERSION_PATTERN
};
