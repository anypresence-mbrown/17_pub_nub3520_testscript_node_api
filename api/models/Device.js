var sails = require('sails');
var _ = require('lodash');
var util = require('util');


var transformAttributesForExactMatch = function (attributes) {
    var newAttributes = {};

    if (undefined != attributes['id']) {
        newAttributes['id'] = attributes['id'];
    }

    if (undefined != attributes['identifier']) {
        newAttributes['identifier'] = attributes['identifier'];
    }

    if (undefined != attributes['password']) {
        newAttributes['password'] = attributes['password'];
    }

    if (undefined != attributes['provider_name']) {
        newAttributes['provider_name'] = attributes['provider_name'];
    }

    return newAttributes;
};

var adapter = (sails.config && sails.config.environment === 'test') ? 'memory' : 'local';

module.exports = {
    tableName: 'Device',
    connection: [adapter],
    attributes: {
        identifier: {
            columnName: 'identifier',
            type: 'text'
        },
        password: {
            columnName: 'password',
            type: 'text'
        },
        provider_name: {
            columnName: 'provider_name',
            type: 'text'
        },
        channels: {
            collection: 'channel',
            via: 'devices'
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

        var scope = Device.find().where();
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

        return Device.count();

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

        return Device.count(transformAttributesForExactMatch(attributes));
    }
};
