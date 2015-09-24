var PropertiesFileReader = require('properties-reader');
var defaultPropertiesFilePath = ".env";
var properties = PropertiesFileReader(defaultPropertiesFilePath);

/**
 * given a property key, returns its paired value
 * @param key the property key
 * @returns {*} the property value
 */
function getProperty(key){
    if(!key){
        return null;
    }else{
        return properties.get(key);
    }
}

function getRawProperty(key) {
  if (!key) return null;
  return properties.getRaw(key);
}

/**
 * sets file path of properties file
 * @param propertiesFilePath the path of the properties file
 */
function setPropertiesFilePath(propertiesFilePath){
    if(propertiesFilePath){
        properties = PropertiesFileReader(propertiesFilePath);
    }
}

module.exports = {
    getProperty: getProperty,
    getRawProperty: getRawProperty,
    setPropertiesFilePath: setPropertiesFilePath
};
