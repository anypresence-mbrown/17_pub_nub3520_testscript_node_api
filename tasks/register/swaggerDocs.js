var sails = require('sails'),
    util = require('util'),
    createApiDocs = require('../../api/docs/swagger_docs').createApiDocs;


module.exports = function(grunt) {
  'use strict';

  grunt.registerTask('swaggerDocs', function() {
    process.env.NODE_ENV = 'test';
    var done = this.async();
    sails.lift({log: 'error'}, function() {
      createApiDocs(done);
    });
  });
};
