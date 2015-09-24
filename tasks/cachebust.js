'use strict';

var async = require('async');
var util = require('util');
var hashFile = require('hash_file');
var path = require('path');

module.exports = function(grunt) {

  grunt.registerMultiTask('cachebust', 'Cache busting for JS, CSS, etc.', function() {
    
    var done = this.async();
    
    var config = this.data.files;
    
    var allFiles = [];
    var allFilenames = [];
    
    var buildTarget = this.target;
    
    this.data.src.forEach(function(filepath) { 
      grunt.log.writeln("Filepath : " + filepath);
      grunt.log.writeln("Expanded : " + util.inspect(grunt.file.expand({}, filepath)));
      grunt.file.expand({}, filepath).forEach(function(file) {
        grunt.log.writeln("Checking file .... " + file);
        if (allFilenames.indexOf(file) == -1) {
          grunt.log.writeln("Adding file .... " + file);          
          var dir = path.dirname(file);
          var basename = path.basename(file);
          var extname = path.extname(file);
          var elts = basename.split('.');
          elts.pop();
          allFiles.push({ dir: dir, ext: extname, base: elts.join("."), origFile: file });
          allFilenames.push(file);
        } 
      });
      
    });

    var newFilenames = [];
    
    async.eachSeries(allFiles, 
      function(item, next) {
        var dir = item.dir;
        var ext = item.ext;
        var base = item.base;
        var origFile = item.origFile;
        
        hashFile(origFile, 'md5', function(err, hash) {
          if (typeof err !== 'undefined' && err !== null) { 
            grunt.log.writeln("Error hashing file " + origFile + ":" + err);
            next(err);
          } else {
            var fullNewPath = path.join(dir, base + '-' + hash + ext);
            grunt.file.copy(origFile, fullNewPath);
            grunt.file.delete(origFile);
            newFilenames.push(fullNewPath);
            grunt.log.writeln("Successfully hashed file " + fullNewPath);
            next();
          }
        });
      }, 
      function(err) {
        if (typeof err !== 'undefined' && err !== null) { 
          grunt.fail.warn("Cachebuster operation failed with error " + err);
        } else {
          grunt.event.emit('assets_hashed', newFilenames, buildTarget);
          done();
        }
      }
    );
    
  });

};