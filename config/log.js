var getLogLevel = require('./utilities').getLogLevel;

/**
 * Log level configuration.
 * When configured at a given log level, Sails will output log messages that
 * are output at a level at or above the currently configured level. This log
 * level is normalized and also applied to the generated output from
 * socket.io, Waterline, and other dependencies. The hierarchy of log levels
 * and their relative priorities is summarized by the chart below:
 *
 * Priority 	level 	  Log fns visible
 * 0 	        silent 	  N/A
 * 1 	        error 	  .error()
 * 2 	        warn 	    .warn(), .error()
 * 3 	        debug 	  .debug(), .warn(), .error()
 * 4 	        info 	    .info(), .debug(), .warn(), .error()
 * 5 	        verbose 	.verbose(), .info(), .debug(), .warn(), .error()
 *
 * @type {{level: string}} Possible values: silent, error, warn, debug, info,
 *                         verbose
 */
module.exports.log = {
  level: getLogLevel()
};
