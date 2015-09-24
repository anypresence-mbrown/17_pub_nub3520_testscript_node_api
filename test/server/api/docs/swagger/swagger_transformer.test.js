var assert = require("assert");
var transformer = require("../../../../../api/docs/swagger/swagger_transformer");

/**
 * Returns a model name that is a non versioned that (that is, no version prefix, in example, v1Person).
 * @returns {string} A non versioned model name
 */
function nonVersionedModel(){
    return "person";
}

/**
 * Returns a model name that is a non versioned that (that is, no version prefix, in example, v1Person).
 * @returns {string} A non versioned model name
 */
function versionedModel(){
    return "v1person";
}

/**
 * @returns {string} A messaging model
 */
function messagingModel(){
    return "device";
}

describe('Swagger Transformer', function(){

    describe('#createPost(model)', function(){
        it('should return null if the model value is null', function(){
            assert.equal(transformer.createPost(null), null);
        });

        it('should create representation if the model its a valid non versioned value', function(){
            var swaggerModel = transformer.createPost(nonVersionedModel());
            assert.equal(swaggerModel.consumes[0], "application/json");
            assert.equal(swaggerModel.produces[0], "application/json");
            assert.equal(swaggerModel.summary, "Adds a new resource using representation provided in body");
            assert.equal(swaggerModel.parameters.length, 1);
            assert.ok(swaggerModel.responses["201"]);
            assert.ok(swaggerModel.responses["422"]);
            assert.ok(swaggerModel.responses["500"]);
        });

        it('should create representation if the model its a valid versioned value', function(){
            var swaggerModel = transformer.createPost(versionedModel());
            assert.equal(swaggerModel.consumes[0], "application/json");
            assert.equal(swaggerModel.produces[0], "application/json");
            assert.equal(swaggerModel.summary, "Adds a new resource using representation provided in body");
            assert.equal(swaggerModel.parameters.length, 1);
            assert.ok(swaggerModel.responses["201"]);
            assert.ok(swaggerModel.responses["422"]);
            assert.ok(swaggerModel.responses["500"]);
        });
    });

    describe('#createPut(model)', function(){
        it('should return null if the model value is null', function(){
            assert.equal(transformer.createPut(null), null);
        });

        it('should update representation if the model its a valid non versioned value', function(){
            var swaggerModel = transformer.createPut(nonVersionedModel());
            assert.equal(swaggerModel.consumes[0], "application/json");
            assert.equal(swaggerModel.produces[0], "application/json");
            assert.equal(swaggerModel.summary, "Update an existing resource using representation provided in request body");
            assert.equal(swaggerModel.parameters.length, 2);
            assert.ok(swaggerModel.responses["204"]);
            assert.ok(swaggerModel.responses["422"]);
            assert.ok(swaggerModel.responses["404"]);
            assert.ok(swaggerModel.responses["500"]);
        });

        it('should update representation if the model its a valid non versioned value', function(){
            var swaggerModel = transformer.createPut(nonVersionedModel());
            assert.equal(swaggerModel.consumes[0], "application/json");
            assert.equal(swaggerModel.produces[0], "application/json");
            assert.equal(swaggerModel.summary, "Update an existing resource using representation provided in request body");
            assert.equal(swaggerModel.parameters.length, 2);
            assert.ok(swaggerModel.responses["204"]);
            assert.ok(swaggerModel.responses["422"]);
            assert.ok(swaggerModel.responses["404"]);
            assert.ok(swaggerModel.responses["500"]);
        });

    });

    describe('#createGetById(model)', function(){
        it('should return null if the model value is null', function(){
            assert.equal(transformer.createGetById(null), null);
        });

        it('should return a valid representation if the model its a valid non versioned value', function(){
            var swaggerModel = transformer.createGetById(nonVersionedModel());
            assert.equal(swaggerModel.consumes[0], "application/json");
            assert.equal(swaggerModel.produces[0], "application/json");
            assert.equal(swaggerModel.summary, "Get an existing representation of the given resource");
            assert.equal(swaggerModel.parameters.length, 1);
            assert.ok(swaggerModel.responses["200"]);
            assert.ok(swaggerModel.responses["404"]);
            assert.ok(swaggerModel.responses["500"]);
        });

        it('should return a valid representation if the model its a valid non versioned value', function(){
            var swaggerModel = transformer.createGetById(nonVersionedModel());
            assert.equal(swaggerModel.consumes[0], "application/json");
            assert.equal(swaggerModel.produces[0], "application/json");
            assert.equal(swaggerModel.summary, "Get an existing representation of the given resource");
            assert.equal(swaggerModel.parameters.length, 1);
            assert.ok(swaggerModel.responses["200"]);
            assert.ok(swaggerModel.responses["404"]);
            assert.ok(swaggerModel.responses["500"]);
        });

    });


  describe('#createGetAll(model, version)', function(){
    it('should return null if the model value is null', function(){
      assert.equal(transformer.createGetAll(null, null), null);
    });

    it('should return a valid collection of resources if the model its a valid non versioned value', function(){
      var swaggerModel = transformer.createGetAll(nonVersionedModel());
      assert.equal(swaggerModel.consumes[0], "application/json");
      assert.equal(swaggerModel.produces[0], "application/json");
      assert.equal(swaggerModel.summary, "Get collection of all resources");
      assert.equal(swaggerModel.parameters.length, 0);
      assert.ok(swaggerModel.responses["200"]);
      assert.ok(swaggerModel.responses["404"]);
      assert.ok(swaggerModel.responses["500"]);
    });

    it('should return a valid collection of resources if the model its a valid non versioned value', function(){
      var swaggerModel = transformer.createGetAll(nonVersionedModel());
      assert.equal(swaggerModel.consumes[0], "application/json");
      assert.equal(swaggerModel.produces[0], "application/json");
      assert.equal(swaggerModel.summary, "Get collection of all resources");
      assert.equal(swaggerModel.parameters.length, 0);
      assert.ok(swaggerModel.responses["200"]);
      assert.ok(swaggerModel.responses["404"]);
      assert.ok(swaggerModel.responses["500"]);
    });

  });

    describe('#createIdParameter(model)', function(){

        it('should return an id parameter object', function(){
            var idParameter = transformer.createIdParameter();
            assert.equal(idParameter.name, "id");
            assert.equal(idParameter.in, "path");
            assert.equal(idParameter.description, "Id of the resource to be operated");
            assert.equal(idParameter.required, true);
            assert.equal(idParameter.type, "string");
        });
    });


    describe('#createBody(model)', function(){
        it('should return null if the model value is null', function(){
            assert.equal(transformer.createBody(null), null);
        });

        it('should return a valid representation in request body if the model its a valid non versioned value', function(){
            var body = transformer.createBody(nonVersionedModel());
            assert.equal(body.in, "body");
            assert.equal(body.name, "body");
            assert.equal(body.description, "Representation of the resource that is going to be updated");
            assert.equal(body.required, false);
            assert.equal(body.schema.$ref, "#/definitions/" + transformer.pluralize(nonVersionedModel()));
        });

        it('should return a valid representation in request body if the model its a valid versioned value', function(){
            var body = transformer.createBody(versionedModel());
            assert.equal(body.in, "body");
            assert.equal(body.name, "body");
            assert.equal(body.description, "Representation of the resource that is going to be updated");
            assert.equal(body.required, false);
            assert.equal(body.schema.$ref, "#/definitions/" + transformer.pluralize(versionedModel()));
        });

        it('should return a valid representation in request body if the model its a messaging model, but href MUST NOT be pluralized', function(){
            var body = transformer.createBody(messagingModel());
            assert.equal(body.in, "body");
            assert.equal(body.name, "body");
            assert.equal(body.description, "Representation of the resource that is going to be updated");
            assert.equal(body.required, false);
            assert.equal(body.schema.$ref, "#/definitions/" + messagingModel());
        });

    });


    describe('#createsHttpResponse(httpProvidedCodes)', function(){
        it('should return an empty array if the provided http codes are null or not an array', function(){
            assert.equal(transformer.createsHttpResponse(null).length, 0);
            assert.equal(transformer.createsHttpResponse([]).length, 0);
            assert.equal(transformer.createsHttpResponse("202").length, 0);
        });

        it('should return 500 as default http code value if the provided value/code does not match a registered one', function(){
            assert.equal(transformer.createsHttpResponse(["999"])["500"].description, "Error trying to process request");
        });


        it('should return all provided HTTP codes in response if they are registered, as well as defined description', function(){
            var response = transformer.createsHttpResponse(["200","201","204","404","422","500"]);
            assert.equal(response["200"].description, "Resource representation successfully returned");
            assert.equal(response["201"].description, "Resource was successfully created");
            assert.equal(response["204"].description, "Resource was successfully updated");
            assert.equal(response["404"].description, "Requested resource does not exist");
            assert.equal(response["422"].description, "Resource could not be created due to business validations were not achieved");
            assert.equal(response["500"].description, "Error trying to process request");
        });

    });

    describe('#toSwaggerType(sailsDataType)', function(){
        it('should return string swagger data type  if the provided sails data type value is null', function(){
            assert.equal(transformer.toSwaggerType(null), "string");
        });

        it('should return string swagger data type if the provided sails data type value is text', function(){
            assert.equal(transformer.toSwaggerType("text"), "string");
        });

    });


    describe('#pluralize(text)', function(){
        it('should return empty string if the provided text is an empty string or null', function(){
            assert.equal(transformer.pluralize(null), "");
            assert.equal(transformer.pluralize(""), "");
        });

        it('should return plural of given text', function(){
            assert.equal(transformer.pluralize("person"), "people");
            assert.equal(transformer.pluralize("car"), "cars");
            assert.equal(transformer.pluralize("non_existent_word"), "non_existent_words");
        });

    });

});
