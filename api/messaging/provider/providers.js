/**
 * @type {string[]} List of available messaging providers
 */
var availableProviders = ['APPLE', 'GOOGLE'];

/**
 * @type {{api: {sendMessage: exports.sendMessage}, configuration: {}}} Apple Messaging Provider
 */
var appleMessageProvider = {
    "api": {
        sendMessage: require('./provider_manager/apple_messaging').sendMessage
    },
    "configuration": {}
};

/**
 * @type {{api: {sendMessage: exports.sendMessage}, configuration: {}}} Google Messaging Provider
 */
var googleMessagingProvider = {
    "api": {
        sendMessage: require('./provider_manager/google_messaging').sendMessage
    },
    "configuration": {}
};

/**
 * Gets messaging provider by name
 * @param providerName the name of the provider
 * @returns {*}
 */
function getProvider(providerName) {
    if (!providerName) {
        return null;
    }
    switch (providerName.toLowerCase().trim()) {
        case "apple":
            return appleMessageProvider;
        case "google":
            return googleMessagingProvider;
    }
    return null;
}

/**
 * Public Interface
 * @type {{getProvider: getProvider}} Gets messaging provider
 */
module.exports = {
    getProvider: getProvider,
    availableProviders: availableProviders
};

