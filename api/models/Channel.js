var sails = require('sails');
var _ = require('lodash');
var util = require('util');


var transformAttributesForExactMatch = function (attributes) {
    var newAttributes = {};

    if (undefined != attributes['id']) {
        newAttributes['id'] = attributes['id'];
    }

    if (undefined != attributes['name']) {
        newAttributes['name'] = attributes['name'];
    }

    if (undefined != attributes['devices']) {
        newAttributes['devices'] = attributes['devices'];
    }

    if (undefined != attributes['messages']) {
        newAttributes['messages'] = attributes['messages'];
    }

    return newAttributes;
};

var adapter = (sails.config && sails.config.environment === 'test') ? 'memory' : 'local';

module.exports = {
    tableName: 'Channel',
    connection: [adapter],
    attributes: {
        name: {
            columnName: 'name',
            type: 'text'
        },
        devices: {
            columnName: 'devices',
            type: 'array'
        },
        messages: {
            columnName: 'messages',
            type: 'array'
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

        var scope = Channel.find().where();
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

        var scope = Channel.find().where(transformAttributesForExactMatch(attributes));
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

        return Channel.count();

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

        return Channel.count(transformAttributesForExactMatch(attributes));
    }
};
