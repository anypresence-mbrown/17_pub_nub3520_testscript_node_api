var Analytics = require('../api/analytics/analytics');
var utilities = require('./utilities');

module.exports.http = {
    middleware: {
        order: [
            'normalizeUrl',
            'analytics',
            'startRequestTimer',
            'cookieParser',
            'session',
            'myRequestLogger',
            'bodyParser',
            'handleBodyParserError',
            'compress',
            'methodOverride',
            'poweredBy',
            '$custom',
            'router',
            'www',
            'favicon',
            '404',
            '500'
        ],
        normalizeUrl : function(req,res,next){
            req.url = require('./utilities').removeExtraSlashesFromUrlPath(req.url);
            return next();
        },
        analytics : function(req,res,next){Analytics.analytics(req, res); return next();}
    }
};
