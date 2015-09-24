var getProvider = require('./provider/providers').getProvider;

/**
 * Gets a connection object to messaging provider. Returned object defines a provider agnostic interface to operate
 * with its messaging services
 * @param providerName the provider name
 */
function getMessagingApi(providerName) {
    if (isValidProviderName(providerName)) {
        return getProvider(providerName).api;
    } else {
        return null;
    }
}

/**
 * Given a provider configuration object, validates it
 * @param providerName the name of the messaging provider
 * @returns {boolean} TRUE if its a valid provider name, FALSE otherwise
 */
function isValidProviderName(providerName) {
    if (!providerName || getProvider(providerName) == null) {
        return false;
    } else {
        return true;
    }
}

/**
 * Public Interface
 * @type {{getConnection: getMessagingApi}} Messaging API
 * @type {{getMessagingApi: getMessagingApi, isValidProviderConfiguration: isValidProviderName}}
 */
module.exports = {
    getMessagingApi: getMessagingApi,
    isValidProviderName : isValidProviderName
};
