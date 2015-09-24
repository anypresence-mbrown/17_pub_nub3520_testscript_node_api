var assert = require("assert");
var providers = require("../../../../../api/messaging/provider/providers");

describe('Provider', function(){
    describe('#getProvider(providerName)', function(){

        it('should return null if the providerName value is null', function(){
            assert.equal(providers.getProvider(null), null);
        });

        it('should return null if the providerName value is an empty string', function(){
            assert.equal(providers.getProvider(""), null);
        });

        it('should return null if the providerName value is a not registered provider', function(){
            assert.equal(providers.getProvider("non_registered_provider"), null);
        });

        it('should return an object if the providerName value is a google', function(){
            assert(providers.getProvider("google") != null);
            assert(typeof providers.getProvider("google") === "object");
        });

        it('should return an object if the providerName value is a apple', function(){
            assert(providers.getProvider("apple") != null);
            assert(typeof providers.getProvider("apple") === "object");
        });

    });

});
