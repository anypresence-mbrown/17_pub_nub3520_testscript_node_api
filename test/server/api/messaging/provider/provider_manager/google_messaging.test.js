var assert = require("assert");
var messaging = require("../../../../../../api/messaging/provider/provider_manager/google_messaging");

describe('Google Provider Messaging', function () {
    describe('#isValidConfiguration(messagingConfiguration)', function () {

        it('should return false if the messagingConfiguration object is null', function () {
            assert.equal(messaging.isValidConfiguration(null), false);
        });

        it('should return false if the messagingConfiguration object is an empty object', function () {
            assert.equal(messaging.isValidConfiguration({}), false);
        });

        it('should return false if the messagingConfiguration object is an object that misses google_collapseKey configuration', function () {
            var invalidMessagingConfigurationObjectMissesCollapseKeyConfiguration = {
                google_retries: 4,
                google_collapseKey: null,
                google_delayWhileIdle: true,
                google_timeToLive: 3,
                google_apiKey: 'fake_key'
            };

            assert.equal(messaging.isValidConfiguration(invalidMessagingConfigurationObjectMissesCollapseKeyConfiguration), false);
        });

        it('should return false if the messagingConfiguration object is an object that misses google_delayWhileIdle configuration', function () {
            var invalidMessagingConfigurationObjectMissesDelayWhileIdleConfiguration = {
                google_retries: 4,
                google_collapseKey: 'demo',
                google_delayWhileIdle: null,
                google_timeToLive: 3,
                google_apiKey: 'fake_key'
            };

            assert.equal(messaging.isValidConfiguration(invalidMessagingConfigurationObjectMissesDelayWhileIdleConfiguration), false);
        });

        it('should return false if the messagingConfiguration object is an object that misses google_timeToLive configuration', function () {
            var invalidMessagingConfigurationObjectMissesTimeToLiveConfiguration = {
                google_retries: 4,
                google_collapseKey: 'demo',
                google_delayWhileIdle: true,
                google_timeToLive: null,
                google_apiKey: 'fake_key'
            };

            assert.equal(messaging.isValidConfiguration(invalidMessagingConfigurationObjectMissesTimeToLiveConfiguration), false);
        });

        it('should return false if the messagingConfiguration object is an object that contains google_timeToLive configuration with a type different that number', function () {
            var invalidMessagingConfigurationObjectWrongTypeTimeToLiveConfiguration = {
                google_retries: 4,
                google_collapseKey: 'demo',
                google_delayWhileIdle: true,
                google_timeToLive: 'textValue',
                google_apiKey: 'fake_key'
            };

            assert.equal(messaging.isValidConfiguration(invalidMessagingConfigurationObjectWrongTypeTimeToLiveConfiguration), false);
        });

        it('should return false if the messagingConfiguration object is an object that contains google_collapseKey configuration with a type different that string', function () {
            var invalidMessagingConfigurationObjectWrongTypeCollapseKeyConfiguration = {
                google_retries: 4,
                google_collapseKey: false,
                google_delayWhileIdle: true,
                google_timeToLive: 3,
                google_apiKey: 'fake_key'
            };

            assert.equal(messaging.isValidConfiguration(invalidMessagingConfigurationObjectWrongTypeCollapseKeyConfiguration), false);
        });

        it('should return false if the messagingConfiguration object is an object that contains google_delayWhileIdle configuration with a type different that string', function () {
            var invalidMessagingConfigurationObjectWrongTypeDelayWhileIdleConfiguration = {
                google_retries: 4,
                google_collapseKey: 'demo',
                google_delayWhileIdle: 56,
                google_timeToLive: 3,
                google_apiKey: 'fake_key'
            };

            assert.equal(messaging.isValidConfiguration(invalidMessagingConfigurationObjectWrongTypeDelayWhileIdleConfiguration), false);
        });

        it('should return true if the messagingConfiguration object has all mandatory google messaging configurations', function () {
            var validConfiguration = {
                google_retries: 4,
                google_collapseKey: 'demo',
                google_delayWhileIdle: "true",
                google_timeToLive: 3,
                receiver: ["some_receiver"],
                google_apiKey: 'fake_key'
            };

            assert.equal(messaging.isValidConfiguration(validConfiguration), true);
        });

        it('should return false if the messagingConfiguration object is an object that misses google_apiKey configuration', function () {
            var invalidConfigurationMissesGoogleApiKey = {
                google_retries: 4,
                google_collapseKey: 'demo',
                google_delayWhileIdle: true,
                google_timeToLive: 3,
                google_apiKey: null
            };

            assert.equal(messaging.isValidConfiguration(invalidConfigurationMissesGoogleApiKey), false);
        });

        it('should return false if the messagingConfiguration object is an object that contains google_apiKey configuration with a type different that string', function () {
            var invalidMessagingConfigurationObjectWrongTypeDelayWhileIdleConfiguration = {
                google_retries: 4,
                google_collapseKey: 'demo',
                google_delayWhileIdle: 56,
                google_timeToLive: 3,
                google_apiKey: 45
            };

            assert.equal(messaging.isValidConfiguration(invalidMessagingConfigurationObjectWrongTypeDelayWhileIdleConfiguration), false);
        });

        it('should return true if the messagingConfiguration object is an object that misses google_registrationIds configuration since its not mandatory', function () {
            var invalidConfigurationMissesRegistrationIds = {
                google_retries: 4,
                google_collapseKey: 'demo',
                google_delayWhileIdle: true,
                google_timeToLive: 3,
                google_apiKey: 'fake_key',
                receiver: ["some_receiver"],
                google_registrationIds: null
            };

            assert.equal(messaging.isValidConfiguration(invalidConfigurationMissesRegistrationIds), true);
        });

    });

});
