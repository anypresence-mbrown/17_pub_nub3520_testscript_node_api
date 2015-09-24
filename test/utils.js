/**
 * test utility functions
 */
var assert = require('assert');

/**
 * available commands on command factory
 */
var COMMANDS = (function () {
    var values = {
        'PREFLIGHT_REQUEST': 'PREFLIGHT_REQUEST'
    };

    return {
        get: function (name) {
            return values[name];
        }
    };
})();

/**
 * available filters on command factory
 */
var FILTERS = (function () {
    var values = {
        'ACCESS-CONTROL-ALLOW-METHODS': 'Access-Control-Allow-Methods',
        'ACCESS-CONTROL-ALLOW-CREDENTIALS': 'Access-Control-Allow-Credentials',
        'ACCESS-CONTROL-ALLOW-HEADERS': 'Access-Control-Allow-Headers'
    };

    return {
        get: function (name) {
            return values[name];
        }
    };
})();

/**
 * given a command name, returns a configurable function that can be executed in an exec
 * @param command the command name
 * @returns {Function} a function containing the command that has to be executed
 */
var commandFactory = function (command) {

    var _empty = "";

    var _filterReponseHeaderCommand = function (header) {
        if (header) {
            return " | tr -d '\r' | sed -En 's/^" + header + ": (.*)/\\1/p'";
        } else {
            return _empty;
        }
    };

    var _curlOptionsRequestCommand = function () {
        var _nonLocalDomain = "nonLocalDomain";
        return "curl -X OPTIONS -I -H \"origin\":'" + _nonLocalDomain + "' ";
    };

    if (command) {
        switch (command) {
            case 'PREFLIGHT_REQUEST':
            {
                return function (request, options) {
                    return _curlOptionsRequestCommand() + request + _filterReponseHeaderCommand(options.requiredHeader);
                };
            }
        }
    }
};


/**
 * @param value the value to be evaluated
 * @returns {*|boolean} TRUE if the evaluated value is an HTTP verb allowed by CORS configuration
 */
var isNotCorsAllowedHttpVerb = function (value) {
    var _expectedHttpVerbsWhenReceivingPreflightRequestResponse = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'];
    return value && _expectedHttpVerbsWhenReceivingPreflightRequestResponse.indexOf(value) <= -1;
};

/**
 * @param value the value to be evaluated
 * @returns {*|boolean} TRUE if the evaluated value is an HTTP header allowed by CORS configuration
 */
var isNotCorsAllowedHttpHeader = function (value) {
    var _expectedHttpHeadersWhenReceivingPreflightRequestResponse = ['Content-Type', 'Authorization', 'X-Session-Id'];
    return value && _expectedHttpHeadersWhenReceivingPreflightRequestResponse.indexOf(value) <= -1;
};

/**
 * @param stringArray array as a string with elements delimited by a given delimiter character
 * @param delimiter the given delimiter character
 * @returns {*} an Array containing the elements in the string array,
 */
var toArray = function (stringArray, delimiter) {


    if (!stringArray) {
        return [];
    } else {
        return function () {
            return new TransformString(stringArray)
                .removeBlankSpaces()
                .removeLineBreaks()
                .getValue()
                .split(delimiter);
        }
    }
};

/**
 * function that transforms a string
 * @param value a value to be transformed
 */
function TransformString(value) {

    var transformedString = value;

    var _empty = "";
    var _matchLineBreaksRegex = /(\r\n|\n|\r)/gm;
    var _matchBlankSpacesRegex = / /g;


    this.removeLineBreaks = function () {
        transformedString = transformedString.replace(_matchLineBreaksRegex, _empty);
        return this;
    };

    this.removeBlankSpaces = function () {
        transformedString = transformedString.replace(_matchBlankSpacesRegex, _empty);
        return this;
    };

    this.getValue = function () {
        return transformedString;
    }

}

/**
 * Create HTTP Request
 * @param paramValues list of param values
 * @param queryParams list of query parameters
 * @param optionsValues list of option values
 * @param bodyValue request body
 * @returns {{param: Function, query: *}} a mocked HTTP Request
 */
function createRequest(paramValues, queryParams, optionsValues, bodyValue) {
    return {
        param: function (paramKey) {
            if (!paramValues) {
                return null;
            }
            if (!paramKey) {
                return paramValues;
            } else {
                return paramValues[paramKey];
            }
        },
        query: function (queryKey) {
            if (!queryParams) {
                return null;
            }
            if (!queryKey) {
                return queryParams;
            } else {
                return queryParams[queryKey];
            }
        },
        options: optionsValues,
        body: bodyValue
    }
}

/**
 * Creates an HTTP Response object. Send function actually tests that the provided and expected values are a match.
 * This functin is particularly useful when testing controllers where return value is a response object. In that cases,
 * you expect to execute send() function. Using this object, send actually asserts returned values against expected ones
 * @param expectedCode the expected HTTP Code
 * @param expectedResponse the expected Http Response Body
 * @returns {{expectedHttpCode: *, expectedHttpResponse: *, send: Function}} HTTP Response
 */
function createResponse(expectedCode, expectedResponse) {
    return {
        expectedHttpCode: expectedCode,
        expectedHttpResponse: expectedResponse,
        done: null,
        assertions: {
            is_expected_http_code: {
                status: true,
                value: null,
                message: "Actual HTTP Code must match expected one"
            },
            is_expected_http_response: {
                status: true,
                value: null,
                message: "Actual HTTP Response must match expected properties"
            }
        },
        send: function (providedHttpCode, providedHttpResponse) {
            this.assertions.is_expected_http_code.value = providedHttpCode;
            this.assertions.is_expected_http_response.value = providedHttpResponse;
            if (providedHttpCode && this.expectedHttpCode) {
                if (providedHttpCode != this.expectedHttpCode) {
                    this.assertions.is_expected_http_code.status = false;
                }
            }
            if (providedHttpResponse && this.expectedHttpResponse && !providedHttpResponse instanceof Array) {
                for (var expectedProperty in this.expectedHttpResponse) {
                    if (this.expectedHttpResponse.hasOwnProperty(expectedProperty)) {
                        if (!this.expectedHttpResponse[expectedProperty] == providedHttpResponse[expectedProperty]) {
                            this.assertions.is_expected_http_response.status = false;
                        }
                    }
                }
            }
            this.done();
        },
        setDone: function (providedDone) {
            this.done = providedDone;
        }
    }
}

/**
 * Public Interface
 * @type {{command: Function, isNotCorsAllowedHttpVerb: Function, isNotCorsAllowedHttpHeader: Function, toArray: Function, TransformString: TransformString, COMMANDS, FILTERS, createRequest: createRequest, expectToBe: createResponse}}
 */
module.exports = {
    command: commandFactory,
    isNotCorsAllowedHttpVerb: isNotCorsAllowedHttpVerb,
    isNotCorsAllowedHttpHeader: isNotCorsAllowedHttpHeader,
    toArray: toArray,
    TransformString: TransformString,
    COMMANDS: COMMANDS,
    FILTERS: FILTERS,
    createRequest: createRequest,
    createResponse: createResponse
};
