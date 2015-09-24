var AnalyticsEntry = require("./AnalyticsEntry").AnalyticsEntry;
var isMonitoringEnabled = require("../../config/properties").getProperty('IS_MONITORING_ENABLED');
var requestOperation = require("../../config/utilities").requestOperation;
var requestApiVersion = require("../../config/utilities").requestApiVersion;
var requestIp = require("../../config/utilities").requestIp;
var requestUserAgent = require("../../config/utilities").requestUserAgent;
var requestModelName = require("../../config/utilities").requestModelName;

var ActivityController = require("../../api/controllers/ActivityController");

/**
 * @type {string} analytics key used to add object in HTTP response
 */
const ANALYTICS_KEY = '_analytics';


/**
 * Given an activity instance, persist it
 * @param activity activity to be persisted
 */
function persist(activity){
    ActivityController.save(activity);
}

/**
 * Note: Currently, there is no easy way to establish an order list of functions to be
 * executed when a particular event occurs after controller's execution. ExpressJS
 * allows adding functions after controller (basically considers controller another
 * function of the middleware stack, so functions can be added after it.
 * SailsJS does not recommend to use its internal ExpressJS middleware, and non of the
 * actual mechanism to handle middleware function (policies and config.http) are
 * prepared to handle this scenario.
 *
 * NOTE! send decorator gets executed when HTTP response got executed on controller.
 * so, 'this' refers to it. IE, this == 'res'.
 *
 * @returns {*} wrapped HTTP Response
 */
function analyse(req, res, payload_size) {
    var operation = requestOperation(req);
    if (isMonitoringEnabled && operation) {
        res[ANALYTICS_KEY].setApiCommunicationEnd(new Date());
        res[ANALYTICS_KEY].setApiCommunicationPayloadSize(parseInt(payload_size) || 0);
        persist(res[ANALYTICS_KEY].getPersistableRepresentation());
    }
}

/**
 * Analytics middleware function used to analyse information about incoming API requests
 * @param req   the HTTP request
 * @param res   the HTTP response
 */
function analytics(req, res) {
    var operation = requestOperation(req);
    if (isMonitoringEnabled && operation) {
        var apiVersion = requestApiVersion(req);
        var ip = requestIp(req);
        var userAgent = requestUserAgent(req);
        var modelName = requestModelName(req);
        res[ANALYTICS_KEY] = new AnalyticsEntry(apiVersion, operation, modelName, ip, userAgent);
        res[ANALYTICS_KEY].setApiCommunicationStart(new Date());
    }
}

/**
 * Creates an atomic predcate for date ranges
 * @param req the HTTP request
 * @returns {{start: Date, end: Date}}
 * @private
 */
function _timePredicateBuilder(req) {
    var currentTime = new Date();

    var start_year = req.body.start_year ? parseInt(req.body.start_year) : parseInt(currentTime.getFullYear());
    var start_month = req.body.start_month ? parseInt(req.body.start_month) - 1 : parseInt(currentTime.getMonth());
    var start_day = req.body.start_day ? parseInt(req.body.start_day) : currentTime.getDate();
    var start_hour = req.body.start_hour ? parseInt(req.body.start_hour) : 0;

    var start_time = new Date(start_year, start_month, start_day, start_hour, 0, 0, 0);

    var end_year = req.body.end_year ? parseInt(req.body.end_year) : parseInt(currentTime.getFullYear());
    var end_month = req.body.end_month ? parseInt(req.body.end_month) - 1 : parseInt(currentTime.getMonth()) + 1;
    var end_day =  req.body.end_day  ? parseInt(req.body.end_day) : currentTime.getDate();
    var end_hour = req.body.end_hour ? parseInt(req.body.end_hour) : 23;

    var end_time = new Date(end_year, end_month, end_day, end_hour, 59, 59, 999);

    return {
        start: start_time,
        end: end_time
    }
}

/**
 * Creates a customizable MongoDB match aggregation predicate.
 * @param req HTTP Request
 * @returns {{$group: {_id: string, count: {$sum: number}}}}
 * @private
 */
function _aggregateMatchPredicate(req){
    var match = {$match: {}};
    if(req.body.action_names) match['$match']['action_name'] = { $in: req.body.action_names };
    if(req.body.api_versions) match['$match']['api_version'] = { $in: req.body.api_versions };
    if(req.body.model_names) match['$match']['model_name'] = { $in: req.body.model_names };
    if(req.body.api_consumer_ips) match['$match']['api_consumer_ip'] = { $in: req.body.api_consumer_ips };
    if(req.body.api_consumer_user_agents) match['$match']['api_consumer_user_agent'] = { $in: req.body.api_consumer_user_agents };
    var t = _timePredicateBuilder(req);
    if(t) match['$match']['entry_date'] = { $gte: t.start, $lte: t.end };

    return match;
}

/**
 * Based on given request parameters, it builds a criteria to group data based on time periods
 * @param req the HTTP request
 * @private
 */
function _groupCriteriaBuilder(req){
    var groupCriteria = { month: { $month: "$entry_date" }, day: { $dayOfMonth: "$entry_date" }, year: { $year: "$entry_date" }, action:"$action_name", api_version:"$api_version"};
    if(req.body.start_hour != undefined && req.body.end_hour != undefined) {
        groupCriteria['hour'] = { $hour: "$entry_date"};
    }
    return groupCriteria;
}

/**
 * Creates a customizable MongoDB group aggregation predicate.
 * @param req HTTP Request
 * @returns {{$group: {_id: string, count: {$sum: number}}}}
 */
function _aggregateGroupPredicate(req){
    var criteria = _groupCriteriaBuilder(req);
    return {
        $group:{
            _id : criteria,
            count:{ $sum:1 },
            avg_rsp_time: { $avg: "$response_time" },
            avg_rsp_size: { $avg: "$api_communication_payload_size"}
        }
    };
}

/**
 * Creates an aggregation predicate composed of multiple atomic predicates.
 * @param req HTTP request
 * @returns {*[]} an aggregation predicate that allows processing of result on MongoDB side, returning a map reduced like result set
 * @private
 */
function aggregatePredicateComposer(req){
    return [_aggregateMatchPredicate(req), _aggregateGroupPredicate(req)];
}


/**
 * Public Interface
 * @type {{analytics: analytics, aggregateBuilder : aggregatePredicateComposer, _timePredicateBuilder : _timePredicateBuilder}}
 */
module.exports = {
    analytics                  : analytics,
    aggregatePredicateComposer : aggregatePredicateComposer,
    analyse                    : analyse,
    _timePredicateBuilder      : _timePredicateBuilder
};
