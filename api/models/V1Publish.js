var extensions  = require('./custom/v1/publishCustom'),
    callbacks   = require('./custom/v1/publishCallbacks'),
    Promise     = require('bluebird'),
    Criteria    = require('../services/query/Criteria'),
    util        = require('util'),
    _           = require('lodash');

var adapter = 'storage_adapter_5829';

V1Publish = module.exports = {
  migrate: 'safe',
  connection : adapter,
  transientAttributes: [
    
  ],
  attributes: {
    
      
        id: {
          type: 'integer'
        },
      
    
      
        channel: {
          type: 'text'
        },
      
    
      
        message: {
          type: 'text'
        },
      
    
      
        pubkey: {
          type: 'text'
        },
      
    
      
        sig: {
          type: 'text'
        },
      
    
      
        subkey: {
          type: 'text'
        },
      
    
      
        timestamp: {
          type: 'text'
        },
      
    
  },
  http: {
      read : {
    verb: 'GET',
    path: '',
    format: 'json',
    objectNameMapping: '',
    pathSelector: '$',
    bodyPayloadTemplate: "",
    limit: '',
    offset: '',
    headers: {
      
    },
    urlParameters: {
      
    },
    
    mapping: {
      request: {
        
          'id': 'id',
        
          'timestamp': 'timestamp',
        
          'pubkey': 'pubkey',
        
          'subkey': 'subkey',
        
          'sig': 'sig',
        
          'channel': 'channel',
        
          'message': 'message',
        
      },
      response: {
        
          'id': 'id',
        
          'timestamp': 'timestamp',
        
          'pubkey': 'pubkey',
        
          'subkey': 'subkey',
        
          'sig': 'sig',
        
          'channel': 'channel',
        
          'message': 'message',
        
      }
    }
  },

      update : {
    verb: 'PUT',
    path: '',
    format: 'json',
    objectNameMapping: '',
    pathSelector: '$',
    bodyPayloadTemplate: "",
    limit: '',
    offset: '',
    headers: {
      
    },
    urlParameters: {
      
    },
    
    mapping: {
      request: {
        
          'id': 'id',
        
          'timestamp': 'timestamp',
        
          'pubkey': 'pubkey',
        
          'subkey': 'subkey',
        
          'sig': 'sig',
        
          'channel': 'channel',
        
          'message': 'message',
        
      },
      response: {
        
          'id': 'id',
        
          'timestamp': 'timestamp',
        
          'pubkey': 'pubkey',
        
          'subkey': 'subkey',
        
          'sig': 'sig',
        
          'channel': 'channel',
        
          'message': 'message',
        
      }
    }
  },

      delete : {
    verb: 'DELETE',
    path: '',
    format: 'json',
    objectNameMapping: '',
    pathSelector: '',
    bodyPayloadTemplate: "",
    limit: '',
    offset: '',
    headers: {
      
    },
    urlParameters: {
      
    },
    
    mapping: {
      request: {
        
          'id': 'id',
        
          'timestamp': 'timestamp',
        
          'pubkey': 'pubkey',
        
          'subkey': 'subkey',
        
          'sig': 'sig',
        
          'channel': 'channel',
        
          'message': 'message',
        
      },
      response: {
        
          'id': 'id',
        
          'timestamp': 'timestamp',
        
          'pubkey': 'pubkey',
        
          'subkey': 'subkey',
        
          'sig': 'sig',
        
          'channel': 'channel',
        
          'message': 'message',
        
      }
    }
  },

      create : {
    verb: 'GET',
    path: '/publish/{{pubkey }}/{{subkey}}/{{sig}}/{{channel}}/callback/{{message}}',
    format: 'json',
    objectNameMapping: '',
    pathSelector: '$',
    bodyPayloadTemplate: "",
    limit: '',
    offset: '',
    headers: {
      
    },
    urlParameters: {
      
    },
    
    mapping: {
      request: {
        
          'id': 'id',
        
          'timestamp': 'timestamp',
        
          'pubkey': 'pubkey',
        
          'subkey': 'subkey',
        
          'sig': 'sig',
        
          'channel': 'channel',
        
          'message': 'message',
        
      },
      response: {
        
          'id': 'id',
        
          'timestamp': 'timestamp',
        
          'pubkey': 'pubkey',
        
          'subkey': 'subkey',
        
          'sig': 'sig',
        
          'channel': 'channel',
        
          'message': 'message',
        
      }
    }
  },

    
        allScope : {
    verb: 'GET',
    path: '',
    format: 'json',
    objectNameMapping: '',
    pathSelector: '$.*',
    bodyPayloadTemplate: "",
    limit: 'limit',
    offset: 'offset',
    headers: {
      
    },
    urlParameters: {
      
    },
    
    defaultParams: {
      
    },
    
    mapping: {
      request: {
        
          'id': 'id',
        
          'timestamp': 'timestamp',
        
          'pubkey': 'pubkey',
        
          'subkey': 'subkey',
        
          'sig': 'sig',
        
          'channel': 'channel',
        
          'message': 'message',
        
      },
      response: {
        
          'id': 'id',
        
          'timestamp': 'timestamp',
        
          'pubkey': 'pubkey',
        
          'subkey': 'subkey',
        
          'sig': 'sig',
        
          'channel': 'channel',
        
          'message': 'message',
        
      }
    }
  },

    
        exactMatchScope : {
    verb: 'GET',
    path: '',
    format: 'json',
    objectNameMapping: '',
    pathSelector: '$.*',
    bodyPayloadTemplate: "",
    limit: 'limit',
    offset: 'offset',
    headers: {
      
    },
    urlParameters: {
      
    },
    
    defaultParams: {
      
    },
    
    mapping: {
      request: {
        
          'id': 'id',
        
          'timestamp': 'timestamp',
        
          'pubkey': 'pubkey',
        
          'subkey': 'subkey',
        
          'sig': 'sig',
        
          'channel': 'channel',
        
          'message': 'message',
        
      },
      response: {
        
          'sig': 'sig',
        
          'id': 'id',
        
          'timestamp': 'timestamp',
        
          'pubkey': 'pubkey',
        
          'subkey': 'subkey',
        
          'channel': 'channel',
        
          'message': 'message',
        
      }
    }
  },

    
        countScope : {
    verb: 'GET',
    path: '',
    format: 'json',
    objectNameMapping: '',
    pathSelector: '$',
    bodyPayloadTemplate: "",
    limit: 'limit',
    offset: 'offset',
    headers: {
      
    },
    urlParameters: {
      
    },
    
    defaultParams: {
      
    },
    
    mapping: {
      request: {
        
          'id': 'id',
        
          'timestamp': 'timestamp',
        
          'pubkey': 'pubkey',
        
          'subkey': 'subkey',
        
          'sig': 'sig',
        
          'channel': 'channel',
        
          'message': 'message',
        
      },
      response: {
        
          'id': 'id',
        
          'timestamp': 'timestamp',
        
          'pubkey': 'pubkey',
        
          'subkey': 'subkey',
        
          'sig': 'sig',
        
          'channel': 'channel',
        
          'message': 'message',
        
      }
    }
  },

    
        countExactMatchScope : {
    verb: 'GET',
    path: '',
    format: 'json',
    objectNameMapping: '',
    pathSelector: '$',
    bodyPayloadTemplate: "",
    limit: 'limit',
    offset: 'offset',
    headers: {
      
    },
    urlParameters: {
      
    },
    
    defaultParams: {
      
    },
    
    mapping: {
      request: {
        
          'id': 'id',
        
          'timestamp': 'timestamp',
        
          'pubkey': 'pubkey',
        
          'subkey': 'subkey',
        
          'sig': 'sig',
        
          'channel': 'channel',
        
          'message': 'message',
        
      },
      response: {
        
          'id': 'id',
        
          'timestamp': 'timestamp',
        
          'pubkey': 'pubkey',
        
          'subkey': 'subkey',
        
          'sig': 'sig',
        
          'channel': 'channel',
        
          'message': 'message',
        
      }
    }
  },

    
  },
  autoCreatedAt: false,
  autoUpdatedAt: false,
  executeCallback: function(action, values) {
  // If function exists, promisify and return it. Otherwise return an empty promise that will immediately resolve.
  var fn = this.callbacks[action];
  if (fn && _.isFunction(fn)) return fn(values);
  return new Promise(function(resolve) { resolve(); });
},
};

function extend(baseObject, baseName, extensionObject, subObject) {
  // If no subObject is supplied, extend the baseObject.
  var sub = baseObject;
  if (subObject) sub = baseObject[subObject] = {};

  _.keys(extensionObject).forEach(function(key) {

    if (_.isFunction(extensionObject[key])) {
      var _this = {
        models: function(name, version) {
          if (version) {
            var modelName = 'v' + version + _.camelCase(name);
            return sails.models[modelName];
          }

          var recentVersionByName = {
            
            'Publish': 'v1publish',
            
          };
          return sails.models[recentVersionByName[_.capitalize(name)]];
        },
        matchingVersionOf: function(name) {
          var apiVersion = 1;
          return this.models(name, apiVersion);
        }
      };

      var wrapper = new WrapperService(extensionObject[key], _this, sails.log.error);

      // Generic customCode does not return a promise. Model/Controller callbacks do.
      if (subObject === 'customCode') {
        sub[key] = wrapper.invoke.bind(wrapper);
      } else {
        sub[key] = wrapper.invokeAsPromise.bind(wrapper);
      }
    } else {
      sub[key] = extensionObject[key];
    }
  });
}

// Augment/override definition of V1Publish using customizations provided via custom code
if(extensions) {
  extend(V1Publish, 'V1Publish', extensions, 'customCode');
}

if (callbacks) {
  extend(V1Publish, 'V1Publish', callbacks, 'callbacks');
}
