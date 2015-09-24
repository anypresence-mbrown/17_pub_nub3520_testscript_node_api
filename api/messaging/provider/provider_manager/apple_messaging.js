var applePushNotification = require('apn');
var fs = require('fs');
var path = require('path');

const ENVELOP_ICON = "\uD83D\uDCE7";
const DEFAULT_EXPIRATION_ONE_HOUR = Math.floor(Date.now() / 1000) + 3600;
const DEFAULT_BADGE = 1;
const DEFAULT_SOUND = "default";
const DEFAULT_ALERT = ENVELOP_ICON + " " + " Hello iPhone! ";
const DEFAULT_CERT_PATH = path.resolve(__dirname) + "/../../../../cert.pem";
const DEFAULT_KEY_PATH = path.resolve(__dirname) + "/../../../../key.pem";

var notificationService = null;

function AppleCloudMessageException(message) {
   this.message = message;
   this.name = "AppleCloudMessageException";
}

/**
 * function that takes a configuration object, and returns a connection object to the Apple Push Notification service
 * @param apnConfiguration Apple Push Notification specification configuration. Check this: https://github.com/argon/node-apn/blob/master/doc/connection.markdown
 * @param message the Apple Push Notification specific message
 * @param devices the target device to which message will be delivered
 * @returns {*} a Connection object to the Apple Push Notification Service
 */
function push(message, devices, apnConfiguration) {
    if (!apnConfiguration || !isValidApplePushNotificationConfiguration(apnConfiguration)) {
        apnConfiguration = {};
    }
    if (!notificationService) {
        notificationService = new applePushNotification.Connection(apnConfiguration);
    }
    for (var j = 0; j < devices.length; j++) {
        notificationService.pushNotification(message, devices[j]);
    }
}

/**
 * checks if the apple push notification service configuration object is correct or not. Right now, it only checks that
 * the object is not an empty object, and the production property (required to established if its sandbox or prod) is
 * a boolean.
 * @param apnConfiguration the configuration object under verification
 * @returns {boolean} TRUE if its a valid configuration object, FALSE otherwise
 */
function isValidApplePushNotificationConfiguration(apnConfiguration) {
    return !(!apnConfiguration || !(typeof apnConfiguration.production == 'boolean'));

}

/**
 * Creates a message for Apple Push Notification Service
 * @param message the message to be delivered
 * @param messageConfiguration the message configuration
 * @returns {applePushNotification.Notification} the Apple Push Notification Message object to be delivered
 */
function createMessage(message, messageConfiguration) {

    var appleMessage = new applePushNotification.Notification();
    appleMessage.expiry = messageConfiguration.apple_expiry || messageConfiguration.expiry || DEFAULT_EXPIRATION_ONE_HOUR;
    appleMessage.badge = messageConfiguration.apple_badge || messageConfiguration.badge || DEFAULT_BADGE;
    appleMessage.sound = messageConfiguration.apple_sound || messageConfiguration.sound || DEFAULT_SOUND;
    appleMessage.alert = messageConfiguration.apple_alert || messageConfiguration.alert || DEFAULT_ALERT;
    if (messageConfiguration.apple_content_available) {
        try {
            appleMessage.contentAvailable = parseInt(messageConfiguration.apple_content_available)
        } catch(e) {
            // Unable to set content availbe so just ignore it.
        }
    }
    appleMessage.payload = {'extra_payload_here': message};

    return appleMessage;
}

/**
 * Gets message target device
 * @param appleToken the apple device token
 * @returns {applePushNotification.Device} the target device to which message will be delivered
 */
function Device(appleToken) {
    return applePushNotification.Device(appleToken);
}

/**
 * Creates a list of Devices
 * @param configuration the configuration object that contains the receiver from which the device object will be created
 * @returns {Array} an array of Devices
 */
function createDevices(configuration) {
    var devices = [];
    for (var i = 0; i < configuration.receiver.length; i++) {
        try {
            devices.push(new Device(configuration.receiver[i].identifier));
        } catch(err) {
            console.log("This device's identifier is invalid and so it will be skipped: " + configuration.receiver[i].identifier);
        }
    }
    return devices;
}

/**
 * function that takes a message and a configuration object, then creates a Apple Notification specific message, and
 * sends it to the given target device
 * @param msg the message payload to be delivered
 * @param configuration a configuration object containing configs both for message and target device
 */
function sendMessage(msg, configuration) {
    if (isValidConfiguration(configuration)) {
        var onDevices = createDevices(configuration);
        var message = createMessage(msg, configuration);

        if (isApnSandboxEnv()) {
            configuration["production"] = false;
        } else {
            configuration["production"] = true;
        }

        push(message, onDevices, configuration);
    } else {
        throw new AppleCloudMessageException("The configuration is invalid.");
    }
}

/**
 * Checks if the required Apple Push Notification CERT file is present
 * @returns {*} TRUE if its present, otherwise FALSE
 */
function isCertificateFile(){
    return fs.existsSync(DEFAULT_CERT_PATH);
}

/**
 * Checks if the required Apple Push Notification KEY file is present
 * @returns {*} TRUE if its present, otherwise FALSE
 */
function isKeyFile(){
    return fs.existsSync(DEFAULT_KEY_PATH);
}

function isApnSandboxEnv() {
    if (!isCertificateFile() || !isKeyFile()) return;

    var certContents = fs.readFileSync(DEFAULT_CERT_PATH);
    var passContents = fs.readFileSync(DEFAULT_KEY_PATH);

    var regex = /Apple Development IOS Push Services/m;
    if (regex.exec(certContents) || regex.exec(passContents)) {
        return true;
    } else {
        return false;
    }
}

/**
 * Checks whether or not the given message configuration object is valid or not
 * @param messageConfiguration the message configuration object being evaluated
 * @returns {boolean} TRUE if the message configuration object is valid, FALSE otherwise
 */
function isValidConfiguration(messageConfiguration) {
    return messageConfiguration != undefined
        && messageConfiguration != null
        && messageConfiguration.receiver != undefined
        && typeof messageConfiguration.receiver == "object"
        && messageConfiguration.receiver.length > 0
        && isKeyFile()
        && isCertificateFile()
}

/**
 * Public interface
 * @type {{sendMessage: sendMessage}} sendMessage function
 */
module.exports = {
    sendMessage: sendMessage,
    isValidConfiguration: isValidConfiguration
};
