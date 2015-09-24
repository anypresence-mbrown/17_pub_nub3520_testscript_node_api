var ACTION_NAMES = require('../../config/utilities').ACTION_NAMES;
var IPV4_OR_IPV6_PATTERN = require('../../config/utilities').IPV4_OR_IPV6_PATTERN;

/**
 * Object that contains analytics related data of a received API call. This object is mostly immutable, with the
 * exception of response related (or required information). In particular:
 *
 *   -> Response time can only be calculated once HTTP response returns to resource route, so apiCommunicationEnd is
 *      set accordingly.
 *   -> Same thing with apiCommunicationPayloadSize: We have to wait for response to set it.
 *   -> Since to acknowledge response time we need both start and end time, it can only be calculated once both of them
 *      are set in instance.
 * @param apiVersion the API version of the incoming request.
 * @param actionName the name of the action executed through the HTTP request.
 * @param modelName the name of the model (In example: Person)
 * @param apiConsumerIp the IP address of the API consumer
 * @param apiConsumerUserAgent the UserAgent (if it applies) of the API consumer
 * @returns {
 *  {
 *    getApiVersion: Function,
 *    getEntryDate: Function,
 *    getActionName: Function,
 *    getModelName: Function,
 *    getApiConsumerIp: Function,
 *    getConsumerUserAgent: Function,
 *    getApiCommunicationStart: Function,
 *    setApiCommunicationStart: Function,
 *    getApiCommunicationEnd: Function,
 *    setApiCommunicationEnd: Function,
 *    getApiCommunicationPayloadSize: Function,
 *    setApiCommunicationPayloadSize: Function,
 *    getResponseTime: Function,
 *    getPersistableRepresentation : Function
 *    }
 *  }
 * @constructor
 */
function AnalyticsEntry(apiVersion, actionName, modelName, apiConsumerIp, apiConsumerUserAgent){

    var _entryDate = new Date();

    var _apiVersion = (apiVersion == null || apiVersion == undefined) ? null : apiVersion;

    var _actionName = ACTION_NAMES.indexOf(actionName) == -1 ? null : actionName;

    var _modelName = modelName;

    var _apiConsumerIp = apiConsumerIp && apiConsumerIp.match(IPV4_OR_IPV6_PATTERN) ? apiConsumerIp : null;

    var _apiConsumerUserAgent = apiConsumerUserAgent;

    var _apiCommunicationStart = null;

    var _apiCommunicationEnd = null;

    var _apiCommunicationPayloadSize = null;

    var getEntryDate = function(){
        return _entryDate;
    };

    var getApiVersion = function(){
        return _apiVersion;
    };

    var getModelName = function(){
        return _modelName;
    };

    var getActionName = function(){
        return _actionName;
    };

    var getApiConsumerIp = function(){
        return _apiConsumerIp;
    };

    var getConsumerUserAgent = function(){
        return _apiConsumerUserAgent;
    };

    var getApiCommunicationStart = function(){
        return _apiCommunicationStart;
    };

    var setApiCommunicationStart = function(newStart){
        _apiCommunicationStart = newStart;
    };

    var getApiCommunicationEnd = function(){
        return _apiCommunicationEnd;
    };

    var setApiCommunicationEnd = function(newEnd){
        _apiCommunicationEnd = newEnd;
    };

    var getApiCommunicationPayloadSize = function(){
        return _apiCommunicationPayloadSize;
    };

    var setApiCommunicationPayloadSize = function(newApiCommunicationPayloadSize){
        _apiCommunicationPayloadSize = newApiCommunicationPayloadSize;
    };

    var getResponseTime = function(){
        if(getApiCommunicationEnd() && getApiCommunicationStart()){
            return parseInt(getApiCommunicationEnd().getTime() - getApiCommunicationStart().getTime());
        } else {
            return null;
        }
    };

    var getPersistableRepresentation = function(){
        return {
            "entry_date"                     : getEntryDate(),
            "api_version"                    : getApiVersion(),
            "action_name"                    : getActionName(),
            "model_name"                     : getModelName(),
            "api_consumer_ip"                : getApiConsumerIp(),
            "api_consumer_user_agent"        : _apiConsumerUserAgent,
            "response_time"                  : parseInt(getResponseTime() || 0),
            "api_communication_payload_size" : parseInt(_apiCommunicationPayloadSize || 0)
        }
    };

    /**
     * Public Interface
     */
    return {
        getApiVersion                  : getApiVersion,
        getEntryDate                   : getEntryDate,
        getActionName                  : getActionName,
        getModelName                   : getModelName,
        getApiConsumerIp               : getApiConsumerIp,
        getConsumerUserAgent           : getConsumerUserAgent,
        getApiCommunicationStart       : getApiCommunicationStart,
        setApiCommunicationStart       : setApiCommunicationStart,
        getApiCommunicationEnd         : getApiCommunicationEnd,
        setApiCommunicationEnd         : setApiCommunicationEnd,
        getApiCommunicationPayloadSize : getApiCommunicationPayloadSize,
        setApiCommunicationPayloadSize : setApiCommunicationPayloadSize,
        getResponseTime                : getResponseTime,
        getPersistableRepresentation   : getPersistableRepresentation
    }
}


/**
 * Public Interface
 * @type {{AnalyticsEntry: AnalyticsEntry}} Analytics Object
 */
module.exports = {
    AnalyticsEntry : AnalyticsEntry
};
