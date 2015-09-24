/**
 * unit tests for Properties Files loading
 */

var assert = require("assert");
var props = require('../../../config/properties.js');

describe('Properties file', function () {

    describe('When accessing to user defined variables', function () {

        it('should return false when variable is false', function () {
            props.setPropertiesFilePath('test/server/mocks/.env.test');
            assert.equal(props.getProperty('BOOLEAN_USER_DEFINED_VALUE'), false);
            assert.equal(typeof(props.getProperty('BOOLEAN_USER_DEFINED_VALUE')), "boolean");
        });

        it('should return number when variable is number', function () {
            props.setPropertiesFilePath('test/server/mocks/.env.test');
            assert.equal(props.getProperty('NUMERIC_USER_DEFINED_VALUE'), 6);
            assert.equal(typeof(props.getProperty('NUMERIC_USER_DEFINED_VALUE')), "number");
        });
    });
});





