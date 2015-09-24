var props = require('./properties'),
    path = require('path');
/**
 * Connections
 * (sails.config.connections)
 *
 * `Connections` are like "saved settings" for your adapters.  What's the difference between
 * a connection and an adapter, you might ask?  An adapter (e.g. `sails-mysql`) is generic--
 * it needs some additional information to work (e.g. your database host, password, user, etc.)
 * A `connection` is that additional information.
 *
 * Each model must have a `connection` property (a string) which is references the name of one
 * of these connections.  If it doesn't, the default `connection` configured in `config/models.js`
 * will be applied.  Of course, a connection can (and usually is) shared by multiple models.
 * .
 * Note: If you're using version control, you should put your passwords/api keys
 * in `config/local.js`, environment variables, or use another strategy.
 * (this is to prevent you inadvertently sensitive credentials up to your repository.)
 *
 * For more information on configuration, check out:
 * http://sailsjs.org/#/documentation/reference/sails.config/sails.config.connections.html
 */

function parseObject(prop) {
  if (!prop || prop === 0) return {};
  return JSON.parse(prop);
}

var config = {

  'default': 'local',

  local: {
    adapter: 'sails-mongo',
    url: props.getProperty("MONGOHQ_URL") || process.env.MONGOHQ_URL || 'mongodb://127.0.0.1:27017/pubnub-Testscript'
  },

  storage_adapter_5829: {
    adapter: 'waterline-http',
    baseUri: props.getProperty("PUB_NUB_BASE_URI"),
    loggingLevel: props.getProperty("PUB_NUB_LOGGING_LEVEL"),
    username: props.getProperty("PUB_NUB_USERNAME"),
    passwordPlainText: props.getProperty("PUB_NUB_PASSWORD_PLAIN_TEXT"),
    format: props.getProperty("PUB_NUB_FORMAT"),
    headers: parseObject(props.getProperty("PUB_NUB_HEADERS")),
    urlParameters: parseObject(props.getProperty("PUB_NUB_URL_PARAMETERS"))
  },


  // used for automated tests only
  memory: {
    adapter: 'sails-memory'
  }

};

module.exports.connections = config;
