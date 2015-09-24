var sails = require('sails');
var util = require('util');
var _ = require('lodash');
var authService = require('../services/auth/AuthService');

var ActivityController = {
    find: function (req, res) {
        sails.log.debug('ActivityController.find::');
        if (!req.param('id')) {
            Activity.find().then(function (activities) {
                if (!activities) return res.send(404);
                res.send(200, activities);
            }).error(function (err) {
                sails.log.error("ActivityController.find::error :" + util.inspect(err));
                return res.send(500);
            });
        }
        else {
            Activity.findOneById(id).then(function (activity) {
                if (activity == undefined) return res.send(404);
                return res.send(200, activity);
            }).error(function (err) {
                sails.log.error("ActivityController.find::error :" + util.inspect(err));
                return res.send(500);
            });
        }
    },
    destroy: function (req, res) {
        sails.log.debug("ActivityController.destroy::");
        var id = req.param('id');
        sails.log.debug("req.param('id') is " + id);
        if (id == undefined) {
            res.send(422);
        }
        else {
            Activity.findOneById(id).then(function (activity) {
                sails.log.debug("ActivityController.destroy::Find one by id pulled object " + util.inspect(activity));
                if (activity === undefined) {
                    res.send(422);
                }
                else {
                    activity.destroy(function (err) {
                        if (err) {
                            sails.log.error("ActivityController.destroy::error :" + util.inspect(err));
                            res.send(500);
                        }
                        else {
                            res.send(204);
                        }
                    });
                }
            }).error(function (err) {
                sails.log.error("ActivityController.destroy::error :" + util.inspect(err));
                return res.send(500);
            });
        }
    },
    create: function (req, res) {
        sails.log.error("ActivityController.create::");
        var activity = req.body;
        if (!activity) return res.send(404);
        ModelScrubber.scrub(activity, Activity.attributes);
        Activity.create(activity)
                .then(function (val) {
                    if (authService.requiresAuth(req) && !authService.currentUserIsSystemAdmin(req)) {
                        ModelScrubber.scrub(val, authService.readableFields(req));
                    }
                    else {
                        ModelScrubber.scrub(val, _.keys(Channel.attributes));
                    }
                    res.send(201, val);
                })
                .error(function (err) {
                    return res.send(500, err);
                })
    },
    findById: function (req, res) {
    },
    save: function (activity) {
        sails.log.debug("ActivityController.save::Silently save an Activity Instance: " + util.inspect(activity));
        Activity.create(activity)
                .then(function (result) {
                    sails.log.debug("ActivityController.save::" + util.inspect(result));
                })
                .error(function (err) {
                    sails.log.error("ActivityController.save::error :" + util.inspect(err));
                })
    },
    aggregate: function(req,res) {
        Activity.native(function(err,collection) {
            collection.aggregate(
                    require('../analytics/analytics').aggregatePredicateComposer(req),
                    function(err,result) {
                        if (err) return res.send(500, err);
                        return res.send(201, result);
                    })
        });
    }
};

module.exports = ActivityController;
