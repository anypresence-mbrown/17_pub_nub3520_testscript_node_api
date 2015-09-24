var googleCloudMessaging = require('node-gcm');
var properties = require('../../../../config/properties');

/**
 * @type {number}m default number of retries
 */
const DEFAULT_RETRIES = 4;

/**
 * @type {string} default collapse key value
 */
const DEFAULT_COLLAPSE_KEY = "Updates Available!";

function GoogleCloudMessageException(message) {
   this.message = message;
   this.name = "GoogleCloudMessageException";
}

/**
 * Creates a message for Google Cloud Messaging Service
 * @param message the message to be delivered
 * @param messageConfiguration the message configuration
 * @returns {exports.Message} the Google Cloud Messaging Message object to be delivered
 */
function createMessage(message, messageConfiguration) {
    delayWhileIdle = messageConfiguration.google_delayWhileIdle || messageConfiguration.delayWhileIdle
    try {
        delayWhileIdle = JSON.parse(delayWhileIdle);
    } catch(ex) {
        delayWhileIdle = false;
    }
    timeToLive = parseInt(messageConfiguration.google_timeToLive || messageConfiguration.timeToLive)

    option = {
        collapseKey: messageConfiguration.google_collapseKey || messageConfiguration.collapseKey || DEFAULT_COLLAPSE_KEY,
        delayWhileIdle: delayWhileIdle,
        data: {
            message: message
        }
    }

    if (!isNaN(timeToLive)) {
        option["timeToLive"] = timeToLive;
    }

    return new googleCloudMessaging.Message(option);
}

/**
 * Given a message configuration object for Google Cloud Messaging, it verifies that contains
 * the mandatory configs to send the message
 * @param messageConfiguration the object to be validated
 * @returns {boolean} TRUE if the messaging configuration object contains all mandatory configs, FALSE otherwise
 */
function isValidConfiguration(messageConfiguration) {
    return messageConfiguration != undefined
        && messageConfiguration != null
        && messageConfiguration.receiver != undefined
        && typeof messageConfiguration.receiver == "object"
        && messageConfiguration.receiver.length > 0
}

/**
 * given a valid Google Server API Key, returns a Sender command-like object that interacts with messaging service
 * @param key a Google Service API Key
 * @returns {*} a valid sender object, or null if no key provided
 */
function createSender(key) {
    if (!key) {
        return null;
    }
    return new googleCloudMessaging.Sender(key);
}


/**
 * function that takes a message and a configuration object, then creates a Google Cloud specific message, and
 * sends it to the given target device
 * @param msg the message payload to be delivered
 * @param configuration a configuration object containing configs both for message and target device
 */
function sendMessage(msg, configuration) {
    if (isValidConfiguration(configuration) && properties.getProperty('GCM_API_KEY')) {
        var message = createMessage(msg, configuration);
        var sender = createSender(properties.getProperty('GCM_API_KEY'));

        var registrationIds = [];
        for (var i = 0; i < configuration.receiver.length; i++) {
            registrationIds.push(configuration.receiver[i].identifier);
        }

        if(sender){
            sender.send(message, registrationIds, configuration.retries || DEFAULT_RETRIES, function (error, sendMessagingResult) {
                if (error) {
                    console.log(error);
                } else {
                    console.log(sendMessagingResult);
                }
            })
        } else {
            return null;
        }

    } else {
        return null;
    }
}


/**
 * Public interface
 * @type {{sendMessage: sendMessage}} sendMessage function
 */
module.exports = {
    sendMessage: sendMessage,
    isValidConfiguration: isValidConfiguration
};
