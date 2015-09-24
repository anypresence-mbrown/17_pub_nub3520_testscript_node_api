var assert = require("assert");
var docs = require("../../../../api/docs/swagger_docs");


describe('Swagger Documentation', function(){

  describe('#successMessage(version)', function() {
    it('should return NOT_DEFINED_VERSION if no version provided', function () {
      assert.equal(docs.successMessage(null), "Swagger 2.0 specification for api NOT_DEFINED_VERSION successfully created");
    });
  });


  describe('#successMessage(version)', function() {
    it('should return customized message if version correctly provided', function () {
      var version = "v2";
      assert.equal(docs.successMessage(version), "Swagger 2.0 specification for api " + version + " successfully created");
    });
  });

});

