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
      
        objects.push({"id":31761,"channel":"Rosier spender","message":"Reliance demonstration","pubkey":"Epidermal Turkestan","sig":"Implementations anaesthetist","subkey":"Conversations harmed","timestamp":"Backtracks lyres"});
      
        objects.push({"id":47991,"channel":"Snaking ravage","message":"Attitudinized inexperience","pubkey":"Anarchistic talkativeness","sig":"Creosoted calcifying","subkey":"Photosensitive scantier","timestamp":"Rainstorms fluoroscopes"});
      
        objects.push({"id":15229,"channel":"Disconnection roadsters","message":"Buttermilk gunrunners","pubkey":"Collaborating grammarian","sig":"Lorna faithlessness","subkey":"Caricaturists barrenness","timestamp":"Gentoo soapier"});
      
        objects.push({"id":66124,"channel":"Butterflying phenobarbital","message":"Mildred weightiest","pubkey":"Assad quilter","sig":"Spenglerian stratospheres","subkey":"Tasted aforethought","timestamp":"Squirmiest inconsolable"});
      
        objects.push({"id":50346,"channel":"Brownsville disassembling","message":"Covenant vindicators","pubkey":"Fertilization responsiveness","sig":"Bodywork constitutional","subkey":"Reincarnate Antarctic","timestamp":"Flowers convenience"});
      
        objects.push({"id":68189,"channel":"Moore ellipse","message":"Nebuchadnezzar leafier","pubkey":"Marquis alias","sig":"Condescendingly naturalization","subkey":"Revolutionized methodologies","timestamp":"Trousseaux shark"});
      
        objects.push({"id":13288,"channel":"Sentimentalized sportsmanship","message":"Carson smuggle","pubkey":"Telegrapher straightening","sig":"Crayon impertinent","subkey":"Sinkiang summerhouse","timestamp":"Elected semipermeable"});
      
        objects.push({"id":99636,"channel":"Psychoanalyzing immured","message":"Conceptualized Tropicana","pubkey":"Tranquilizers nontransferable","sig":"Anticipation taxonomic","subkey":"Communications northwest","timestamp":"Disciplining registries"});
      
        objects.push({"id":55115,"channel":"Proven yuppie","message":"Excruciatingly certifications","pubkey":"Chandra rejoiced","sig":"Incarcerations obligations","subkey":"Impersonators commandeering","timestamp":"Monaural toadies"});
      
        objects.push({"id":48092,"channel":"Tingling retrospects","message":"Reminiscences listed","pubkey":"Vedas negotiate","sig":"Mapping Mamore","subkey":"Trope inconvenienced","timestamp":"Truism augmentations"});
      
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
      var newObj = {"id":39766,"channel":"Whistling eightieth","message":"Microcomputers paroles","pubkey":"Andromache continuous","sig":"Quadriplegia corneas","subkey":"Jigging housemaids","timestamp":"Demagnetization sleepwalker"};
  
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
      var newObj = {"id":35470,"channel":"Frontispieces kinder","message":"Breathy predecease","pubkey":"Misalliances hypothesizes","sig":"Kaleidoscopic cornball","subkey":"Executors disgust","timestamp":"Honeysuckle witches"};
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
