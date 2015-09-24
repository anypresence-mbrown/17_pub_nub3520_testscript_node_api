var assert = require("assert");
var messaging = require("../../../../api/messaging/messaging");

describe('Messsaging', function(){
    describe('#getMessagingApi(providerName, providerConfiguration)', function(){

        it('should return null if the providerName value is null', function(){
            assert.equal(messaging.getMessagingApi(null), null);
        });

        it('should return null if the providerName value is an empty string', function(){
            assert.equal(messaging.getMessagingApi(""), null);
        });

        it('should return null if the providerName value is an invalid messaging provider name', function(){
            assert.equal(messaging.getMessagingApi("INVALID_PROVIDER_NAME"), null);
        });

        it('should return an object if the providerName value is Google', function(){
            assert(messaging.getMessagingApi("Google") != null);
            assert(typeof messaging.getMessagingApi("Google") === "object");
        });

        it('should return an object if the providerName value is Apple', function(){
            assert(messaging.getMessagingApi("Apple") != null);
            assert(typeof messaging.getMessagingApi("Apple") === "object");
        });

        it('should return an object if the providerName value is GOOGLE', function(){
            assert(messaging.getMessagingApi("GOOGLE") != null);
            assert(typeof messaging.getMessagingApi("GOOGLE") === "object");
        });

        it('should return an object if the providerName value is APPLE', function(){
            assert(messaging.getMessagingApi("APPLE") != null);
            assert(typeof messaging.getMessagingApi("APPLE") === "object");
        });

        it('should return an object if the providerName value is google', function(){
            assert(messaging.getMessagingApi("google") != null);
            assert(typeof messaging.getMessagingApi("google") === "object");
        });

        it('should return an object if the providerName value is apple', function(){
            assert(messaging.getMessagingApi("apple") != null);
            assert(typeof messaging.getMessagingApi("apple") === "object");
        });

        it('should return a sendMessage function if the providerName value is a google', function(){
            assert(messaging.getMessagingApi("google") != null);
            assert(typeof messaging.getMessagingApi("google") === "object");
            assert(typeof messaging.getMessagingApi("google").sendMessage === "function");
        });

        it('should return a sendMessage function if the providerName value is a apple', function(){
            assert(messaging.getMessagingApi("apple") != null);
            assert(typeof messaging.getMessagingApi("apple") === "object");
            assert(typeof messaging.getMessagingApi("apple").sendMessage === "function");
        });

    });


    describe('#isValidProviderName(providerName)', function(){

        it('should return false if the providerName value is null', function(){
            assert.equal(messaging.isValidProviderName(null), false);
        });

        it('should return false if the providerName value is an empty string', function(){
            assert.equal(messaging.isValidProviderName(""), false);
        });

        it('should return an object if the providerName value is google', function(){
            assert(messaging.isValidProviderName("google") != null);
        });

        it('should return an object if the providerName value is apple', function(){
            assert(messaging.isValidProviderName("apple") != null);
        });

        it('should return an object if the providerName value is a not valid messaging provider', function(){
            assert(messaging.isValidProviderName("not_valid_provider") == false);
        });

    });

});
