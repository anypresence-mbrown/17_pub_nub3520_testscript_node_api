var assert = require("assert");
var ACTION_NAMES = require("../../../../config/utilities").ACTION_NAMES;
var AnalyticsEntry = require("../../../../api/analytics/AnalyticsEntry.js").AnalyticsEntry;

describe('AnalyticsEntry', function () {
    describe('#AnalyticsEntry(apiVersion, actionName, modelName, apiConsumerIp, apiConsumerUserAgent)', function () {

        it('should return null if apiVersion is null', function () {
            assert.equal(entryWithNullApiVersion().getApiVersion(), null);
        });

        it('should return null if apiVersion is undefined', function () {
            assert.equal(entryWithUndefinedApiVersion().getApiVersion(), null);
        });

        it('should return null if actionName is undefined', function () {
            assert.equal(entryWithUndefinedActionName().getActionName(), null);
        });

        it('should return null if actionName is null', function () {
            assert.equal(entryWithNullActionName().getActionName(), null);
        });

        it('should return null if actionName is not a valid one', function () {
            assert.equal(entryWithUnregisteredActionName().getActionName(), null);
        });

        it('should return null if apiConsumerIp is null', function () {
            assert.equal(entryWithNullApiConsumerIp().getApiConsumerIp(), null);
        });

        it('should initially return null when object is created for getApiCommunicationStart() method', function () {
            assert.equal(entryValid().getApiCommunicationStart(), null);
        });

        it('should initially return null when object is created for getApiCommunicationEnd() method', function () {
            assert.equal(entryValid().getApiCommunicationEnd(), null);
        });

        it('should initially return null when object is created for getApiCommunicationPayloadSize() method', function () {
            assert.equal(entryValid().getApiCommunicationPayloadSize(), null);
        });

        it('should have a valid entry date', function () {
            assert.equal(typeof entryValid().getEntryDate(), "object");
        });

        it('should contain a valid ipv4 ip address', function(){
            assert.equal(entryWithInvalidApiConsumerIp().getApiConsumerIp(), null);
        });

    });


    /**
     * @returns {AnalyticsEntry} an analytics entry with apiConsumerIp field equals to null
     */
    function entryWithNullApiConsumerIp() {
        return new AnalyticsEntry("v1", ACTION_NAMES[0], "modelName", null, "Mozilla");
    }

    /**
     * @returns {AnalyticsEntry} an analytics entry with apiVersion field equals to null
     */
    function entryWithNullApiVersion() {
        return new AnalyticsEntry(null, ACTION_NAMES[0], "modelName", "127.0.0.1", "Mozilla");
    }

    /**
     * @returns {AnalyticsEntry} an analytics entry with apiVersion field equals to undefined
     */
    function entryWithUndefinedApiVersion() {
        return new AnalyticsEntry(undefined, ACTION_NAMES[0], "modelName", "127.0.0.1", "Mozilla");
    }

    /**
     * @returns {AnalyticsEntry} an analytics entry with actionName field equals to null
     */
    function entryWithNullActionName() {
        return new AnalyticsEntry("v1", "NOT_VALID_ACTION_NAME", "modelName", "127.0.0.1", "Mozilla");
    }

    /**
     * @returns {AnalyticsEntry} an analytics entry with apiConsumerIp field equals to undefined
     */
    function entryWithUndefinedActionName() {
        return new AnalyticsEntry("v1", undefined, "modelName", "127.0.0.1", "Mozilla");
    }

    /**
     * @returns {AnalyticsEntry} an analytics entry with a non registered action name
     */
    function entryWithUnregisteredActionName() {
        return new AnalyticsEntry("v1", "NOT_VALID_ACTION_NAME", "modelName", "127.0.0.1", "Mozilla");
    }

    /**
     * @returns {AnalyticsEntry} a valid analytics entry
     */
    function entryValid() {
        return new AnalyticsEntry("v1", ACTION_NAMES[0], "modelName", "127.0.0.1", "Mozilla");
    }

    /**
     * @returns {AnalyticsEntry} an invalid entry due to an invalid IP
     */
    function entryWithInvalidApiConsumerIp() {
        return new AnalyticsEntry("v1", ACTION_NAMES[0], "modelName", "88.8888.8.123", "Mozilla");
    }

});
