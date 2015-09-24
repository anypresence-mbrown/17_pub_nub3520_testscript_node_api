var assert = require("assert");
var spec = require("../../../../../api/docs/swagger/swagger_spec");

/**
 * @returns {{v1person: string, v1thing: string, v1space: string}} an object containing app models
 */
function validApplicationModels(){
    return {
        v1person : "v1person",
        v1thing  : "v1thing",
        v1space  : "v1space"
    }
}

/**
 * @returns {{v1person: string, v1thing: string, v1space: string}} an object containing app models
 */
function validApplicationModelsDefinitions(){
    return {
        v1person : "v1person",
        v1thing  : "v1thing",
        v1space  : "v1space"
    }
}

describe('Swagger Specification', function(){

    describe('#spec(version)', function(){
        it('should return null if the models or the version parameters are null', function(){
            assert.equal(spec.spec(null, null), null);
            assert.equal(spec.spec("v1", null), null);
            assert.equal(spec.spec(null, validApplicationModels(), validApplicationModelsDefinitions()), null);
        });

        it('should return Swagger 2.0 value in swagger field', function(){
            var sp = JSON.parse(spec.spec("v1", validApplicationModels(), validApplicationModelsDefinitions()));
            assert.equal(sp.swagger, "2.0");
        });

        it('should return expected description in info.description field', function(){
            var sp = JSON.parse(spec.spec("v1", validApplicationModels(), validApplicationModelsDefinitions()));
            assert.equal(sp.info.description, "This is Swagger 2.0 compliant client for AnyPresence Node generated API");
        });

        it('should return /api in basePath field', function(){
            var sp = JSON.parse(spec.spec("v1", validApplicationModels(), validApplicationModelsDefinitions()));
            assert.equal(sp.basePath, "/api");
        });

        it('should return http as the only item in schemes array', function(){
            var sp = JSON.parse(spec.spec("v1", validApplicationModels(), validApplicationModelsDefinitions()));
            assert.equal(sp.schemes.length, 1);
            assert.equal(sp.schemes, "http");
        });

    });
});
