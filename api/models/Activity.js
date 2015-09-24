var sails = require('sails');
var _ = require('lodash');
var util = require('util');


var transformAttributesForExactMatch = function (attr) {
    var newAttrs = {};

    if (attr['id']) newAttrs['id'] = attr['id'];
    if (attr['entry_date']) newAttrs['entry_date'] = attr['entry_date'];
    if (attr['api_version']) newAttrs['api_version'] = attr['api_version'];
    if (attr['action_name']) newAttrs['action_name'] = attr['action_name'];
    if (attr['model_name']) newAttrs['model_name'] = attr['model_name'];
    if (attr['api_consumer_ip']) newAttrs['api_consumer_ip'] = attr['api_consumer_ip'];
    if (attr['api_consumer_user_agent']) newAttrs['api_consumer_user_agent'] = attr['api_consumer_user_agent'];
    if (attr['api_communication_payload_size']) newAttrs['api_communication_payload_size'] = attr['api_communication_payload_size'];
    if (attr['response_time']) newAttrs['response_time'] = attr['response_time'];

    return newAttrs;
};

var adapter = (sails.config && sails.config.environment === 'test') ? 'memory' : 'local';

module.exports = {
    tableName: 'Activity',
    connection: [adapter],
    attributes: {
        entry_date: {
            columnName: 'entry_date',
            type: 'date'
        },
        api_version: {
            columnName: 'api_version',
            type: 'text'
        },
        model_name: {
            columnName: 'model_name',
            type: 'text'
        },
        action_name: {
            columnName: 'action_name',
            type: 'text'
        },
        api_consumer_ip: {
            columnName: 'api_consumer_ip',
            type: 'text'
        },
        api_consumer_user_agent: {
            columnName: 'api_consumer_user_agent',
            type: 'text'
        },
        response_time: {
            columnName: 'response_time',
            type: 'integer'
        },
        api_communication_payload_size: {
            columnName: 'api_communication_payload_size',
            type: 'integer'
        }
    },

    autoPK: true,
    autoCreatedAt: false,
    autoUpdatedAt: false
};
