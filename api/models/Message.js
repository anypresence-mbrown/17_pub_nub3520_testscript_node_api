var sails = require('sails');
var _ = require('lodash');
var util = require('util');


var transformAttributesForExactMatch = function (attributes) {
    var newAttributes = {};

    if (undefined != attributes['id']) {
        newAttributes['id'] = attributes['id'];
    }

    if (undefined != attributes['time']) {
        newAttributes['time'] = attributes['time'];
    }

    if (undefined != attributes['receiver']) {
        newAttributes['receiver'] = attributes['receiver'];
    }

    if (undefined != attributes['is_channel']) {
        newAttributes['is_channel'] = attributes['is_channel'];
    }

    if (undefined != attributes['apple_badge']) {
        newAttributes['apple_badge'] = attributes['apple_badge'];
    }

    if (undefined != attributes['apple_alert']) {
        newAttributes['apple_alert'] = attributes['apple_alert'];
    }

    if (undefined != attributes['apple_sound']) {
        newAttributes['apple_sound'] = attributes['apple_sound'];
    }

    if (undefined != attributes['apple_expiry']) {
        newAttributes['apple_expiry'] = attributes['apple_expiry'];
    }

    if (undefined != attributes['apple_content_available']) {
        newAttributes['apple_content_available'] = attributes['apple_content_available'];
    }

    if (undefined != attributes['google_collapseKey']) {
        newAttributes['google_collapseKey'] = attributes['google_collapseKey'];
    }

    if (undefined != attributes['google_delayWhileIdle']) {
        newAttributes['google_delayWhileIdle'] = attributes['google_delayWhileIdle'];
    }

    if (undefined != attributes['google_timeToLive']) {
        newAttributes['google_timeToLive'] = attributes['google_timeToLive'];
    }

    if (undefined != attributes['payload']) {
        newAttributes['payload'] = attributes['payload'];
    }

    return newAttributes;
};

var adapter = (sails.config && sails.config.environment === 'test') ? 'memory' : 'local';

module.exports = {
    tableName: 'Message',
    connection: [adapter],
    attributes: {
        time: {
            columnName: 'time',
            type: 'text'
        },
        receiver: {
            columnName: 'receiver',
            type: 'string'
        },
        is_channel: {
            columnName: 'is_channel',
            type: 'text'
        },
        apple_badge: {
            columnName: 'apple_badge',
            type: 'text'
        },
        apple_alert: {
            columnName: 'apple_alert',
            type: 'text'
        },
        apple_sound: {
            columnName: 'apple_sound',
            type: 'text'
        },
        apple_expiry: {
            columnName: 'apple_expiry',
            type: 'text'
        },
        apple_content_available: {
            columnName: 'apple_content_available',
            type: 'text'
        },
        google_collapseKey: {
            columnName: 'google_collapseKey',
            type: 'text'
        },
        google_delayWhileIdle: {
            columnName: 'google_delayWhileIdle',
            type: 'text'
        },
        google_timeToLive: {
            columnName: 'google_timeToLive',
            type: 'text'
        },
        payload: {
            columnName: 'payload',
            type: 'text'
        }
    },

    autoPK: true,

    autoCreatedAt: false,

    autoUpdatedAt: false,

    // Scopes for data access
    allScope: function (attributes, userAttributes, offset, limit) {
        if (attributes === undefined) {
            attributes = {};
        }
        if (userAttributes === undefined) {
            userAttributes = {};
        }
        if (offset === undefined) {
            offset = null;
        }
        if (limit === undefined) {
            limit = null;
        }

        var scope = Message.find().where();
        if (limit) {
            scope = scope.limit(limit);
        }
        if (offset) {
            scope = scope.skip(offset);
        }
        return scope;

    },

    exactMatchScope: function (attributes, userAttributes, offset, limit) {
        if (attributes === undefined) {
            attributes = {};
        }
        if (userAttributes === undefined) {
            userAttributes = {};
        }
        if (offset === undefined) {
            offset = null;
        }
        if (limit === undefined) {
            limit = null;
        }

        var scope = Device.find().where(transformAttributesForExactMatch(attributes));
        if (limit) {
            scope = scope.limit(limit);
        }
        if (offset) {
            scope = scope.skip(offset);
        }
        return scope;

    }
    ,
    countScope: function (attributes, userAttributes, offset, limit) {
        if (attributes === undefined) {
            attributes = {};
        }
        if (userAttributes === undefined) {
            userAttributes = {};
        }
        if (offset === undefined) {
            offset = null;
        }
        if (limit === undefined) {
            limit = null;
        }

        return Message.count();

    }
    ,
    countExactMatchScope: function (attributes, userAttributes, offset, limit) {
        if (attributes === undefined) {
            attributes = {};
        }
        if (userAttributes === undefined) {
            userAttributes = {};
        }
        if (offset === undefined) {
            offset = null;
        }
        if (limit === undefined) {
            limit = null;
        }

        return Message.count(transformAttributesForExactMatch(attributes));
    }
};
