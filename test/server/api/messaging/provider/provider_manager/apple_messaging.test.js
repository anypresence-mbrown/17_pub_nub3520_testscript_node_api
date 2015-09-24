var assert = require("assert");
var messaging = require("../../../../../../api/messaging/provider/provider_manager/apple_messaging");

describe('Apple Provider Messaging', function () {
    describe('#isValidConfiguration(messagingConfiguration)', function () {

        it('should return false if the messagingConfiguration object is null', function () {
            assert.equal(messaging.isValidConfiguration(null), false);
        });

        it('should return false if the messagingConfiguration object is an empty object', function () {
            assert.equal(messaging.isValidConfiguration({}), false);
        });

        it('should return false if the messagingConfiguration object is an object that misses google_collapseKey configuration', function () {
            var invalidMessagingConfigurationObjectMissesAppleTokensConfiguration = {
                "providerName": "APPLE",
                "message": "This is freaking awesome!",
                "configuration": {
                    "apple_tokens": [
                        "257dcdca daaffd6d c1f41cc6 1d57fef4 c75a59a0 2ab419bb 052b10a9 00f37e23"
                    ]
                }
            };

            assert.equal(messaging.isValidConfiguration(invalidMessagingConfigurationObjectMissesAppleTokensConfiguration), false);
        });

        it('should return false if the messagingConfiguration object is an object that contains apple_badge attribute, but its not a number', function () {
            var invalidMessagingConfigurationObjectBadgeNotNunber = {
                "providerName": "APPLE",
                "message": "This is freaking awesome!",
                "configuration": {
                    "apple_tokens": [
                        "257dcdca daaffd6d c1f41cc6 1d57fef4 c75a59a0 2ab419bb 052b10a9 00f37e23"
                    ],
                    "apple_badge": "4"
                }
            };

            assert.equal(messaging.isValidConfiguration(invalidMessagingConfigurationObjectBadgeNotNunber), false);
        });
    });

    it('should return false if the messagingConfiguration object is an object that contains apple_sound attribute, but its not a string', function () {
        var invalidMessagingConfigurationSoundNotString = {
            "providerName": "APPLE",
            "message": "This is freaking awesome!",
            "configuration": {
                "apple_tokens": [
                    "257dcdca daaffd6d c1f41cc6 1d57fef4 c75a59a0 2ab419bb 052b10a9 00f37e23"
                ],
                "apple_sound": 56
            }
        };

        assert.equal(messaging.isValidConfiguration(invalidMessagingConfigurationSoundNotString), false);
    });

    it('should return false if the messagingConfiguration object is an object that contains apple_alert attribute, but its not a string', function () {
        var invalidMessagingConfigurationAlertNotString = {
            "providerName": "APPLE",
            "message": "This is freaking awesome!",
            "configuration": {
                "apple_tokens": [
                    "257dcdca daaffd6d c1f41cc6 1d57fef4 c75a59a0 2ab419bb 052b10a9 00f37e23"
                ],
                "apple_alert": 56
            }
        };

        assert.equal(messaging.isValidConfiguration(invalidMessagingConfigurationAlertNotString), false);
    });

});
