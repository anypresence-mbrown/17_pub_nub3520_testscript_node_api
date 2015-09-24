var Sails = require('sails');
var assert = require ('assert');
var passportStub = require ('passport-stub');
var superagent = require('superagent');
var util = require('util');
var _ = require('lodash');
var adapter = require('sails-memory');

var agent, objects = [];



describe('V1Publish', function() {
  
    beforeEach(function() {
      objects = [];
      agent = superagent.agent();
      
        objects.push({"id":28022,"channel":"Ploughs demobilization","message":"Payne pharmaceuticals","pubkey":"Disbelief freeload","sig":"Bucketed superabundances","subkey":"Defecation sunbonnets","timestamp":"Coauthors vivace"});
      
        objects.push({"id":88872,"channel":"Fractional Paraguayan","message":"Overstatements acknowledgement","pubkey":"Objectionably vituperated","sig":"Scavengers continuation","subkey":"Kinks skirmished","timestamp":"Systematically scoreboards"});
      
        objects.push({"id":72485,"channel":"Chicks resettling","message":"Ossified denominator","pubkey":"Spider exceeding","sig":"Sivan Maracaibo","subkey":"Draftsmanship iconoclastic","timestamp":"Attachments groom"});
      
        objects.push({"id":14776,"channel":"Shortenings confrontational","message":"Brunt shtik","pubkey":"Rubdown monomaniacs","sig":"Teletypewriters alfresco","subkey":"Storyteller characteristics","timestamp":"Thoroughest rearms"});
      
        objects.push({"id":87082,"channel":"Diversity linnet","message":"Bluebeard outbalance","pubkey":"Secretary notifications","sig":"Lunar enthronements","subkey":"Superannuates dehumanization","timestamp":"Whirls sectarianism"});
      
        objects.push({"id":59728,"channel":"Riddling undecipherable","message":"Characteristics wayside","pubkey":"Impertinence counterexamples","sig":"Frolic meatball","subkey":"Villarreal hesitantly","timestamp":"Decriminalized thoroughest"});
      
        objects.push({"id":86374,"channel":"Simulcasting legalizing","message":"Expatiates unceremoniously","pubkey":"Electric grandchildren","sig":"Necktie expediter","subkey":"Predominating ashes","timestamp":"Liberalization redistributing"});
      
        objects.push({"id":12256,"channel":"Reaches differentiate","message":"Print Cooperstown","pubkey":"Boisterousness Khabarovsk","sig":"Triply linguistics","subkey":"Intermarriage adhesives","timestamp":"Nongovernmental anesthetists"});
      
        objects.push({"id":14263,"channel":"Underhand uninstalled","message":"Proposing discriminates","pubkey":"Controllers hardhearted","sig":"Wends steeple","subkey":"Russets boning","timestamp":"Precipitation hostesses"});
      
        objects.push({"id":40737,"channel":"Unconquerable archaeologists","message":"Radiotherapist Taurus","pubkey":"Presbyterianism countersigning","sig":"Panache siphoned","subkey":"Operational Myers","timestamp":"Nikita notwithstanding"});
      
      V1Publish.request = function(a, url, vals, context, cb) {
        cb(null, objects);
      };
    });

    afterEach(function() {
      passportStub.logout();
    });
  

  before(function() {
    // Drop existing collections
    
      adapter.drop('memory', 'Publish', [], function() {})
    
    // Recreate collections
    
      adapter.define('memory', 'Publish', V1Publish.attributes, function() {})
    
  });

  
  
    it('should attempt to get index of publishes for unauthenticated', function (done) {
  
      agent.get("http://localhost:" + (process.env.TEST_PORT || 1337) + "/api/v1/publishes").set('Content-Type', 'application/json').end(function (err, res) {
        if (err) return done(err);
  
        assert.equal(res.status, 200);
        assert.equal(res.body.length, 10);
        done(err);
  
      });
    });

    it('should attempt to create publish for unauthenticated', function (done) {
      var newObj = {"id":49550,"channel":"Overcome habitability","message":"Advantage orphan","pubkey":"Instantaneously insinuations","sig":"Sleuths desiring","subkey":"Cablecasted threefold","timestamp":"Coordinate undercarriages"};
  
      agent.post("http://localhost:" + (process.env.TEST_PORT || 1337) + "/api/v1/publishes").send(newObj).set('Content-Type', 'application/json').end(function (err, res) {
  
        if (err) return done(err);
        assert.equal(res.status, 201);
        
          done();
        
  
      });
    });

    it('should attempt to show publish for unauthenticated', function(done) {
      var id = objects[0].id;
  
      agent.get("http://localhost:" + (process.env.TEST_PORT || 1337) + "/api/v1/publishes/" + id).set('Content-Type', 'application/json').end(function (err, res) {
  
        if (err) return done(err);
        assert.equal(res.status, 200);
        done(err);
  
      });
    });

    it('should attempt to update publish for unauthenticated', function (done) {
      var id = objects[0].id;
      var newObj = {"id":1686,"channel":"Palindromic neurotics","message":"Immutably defection","pubkey":"Laundryman irrelevancy","sig":"Masked fabrics","subkey":"Panache antediluvian","timestamp":"Discolored perceptual"};
      newObj.id = id;
  
      agent.put("http://localhost:" + (process.env.TEST_PORT || 1337) + "/api/v1/publishes/" + id).send(newObj).set('Content-Type', 'application/json').end(function (err, res) {
  
        if (err) return done(err);
        assert.equal(res.status, 204);
        
          done();
        
  
      });
    });

    it('should attempt to destroy publish for unauthenticated', function (done) {
      var id = objects[0].id;
  
      agent.del("http://localhost:" + (process.env.TEST_PORT || 1337) + "/api/v1/publishes/" + id).end(function (err, res) {
        if (err) return done(err);
  
        assert.equal(res.status, 204);
        
          done();
        
  
      });
    });

  
  
});
