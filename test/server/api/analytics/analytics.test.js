var assert = require("assert");
var analytics = require("../../../../api/analytics/analytics.js");

describe('Analytics', function () {
    describe('#_timePredicateBuilder(req)', function () {
        it('should return an object containing an start and end date with the given start and end values ', function () {
            var req = {
                body :{
                    start_year : 2015,
                    start_month : 3,
                    start_day :10,
                    start_hour :3,
                    end_year : 2015,
                    end_month : 3,
                    end_day :14,
                    end_hour :3
                }
            };
            var createdDate = analytics._timePredicateBuilder(req);
            assert.notEqual(createdDate.start, null);
            assert.equal(createdDate.start.getFullYear(), 2015);
            assert.equal(createdDate.start.getMonth(), 2);
            assert.equal(createdDate.start.getDate(), 10);
            assert.equal(createdDate.start.getHours(), 3);

            assert.notEqual(createdDate.end, null);
            assert.equal(createdDate.end.getFullYear(), 2015);
            assert.equal(createdDate.end.getMonth(), 2);
            assert.equal(createdDate.end.getDate(), 14);
            assert.equal(createdDate.end.getHours(), 3);
        });


        it('should return current year in case start_year is not provided', function () {
            var req = {
                body :{
                    start_month : 3,
                    start_day :10,
                    start_hour :3,
                    end_year : 2015,
                    end_month : 3,
                    end_day :14,
                    end_hour :3
                }
            };
            var createdDate = analytics._timePredicateBuilder(req);
            assert.notEqual(createdDate.start, null);
            assert.equal(createdDate.start.getFullYear(), new Date().getFullYear());
            assert.equal(createdDate.start.getMonth(), 2);
            assert.equal(createdDate.start.getDate(), 10);
            assert.equal(createdDate.start.getHours(), 3);

            assert.notEqual(createdDate.end, null);
            assert.equal(createdDate.end.getFullYear(), 2015);
            assert.equal(createdDate.end.getMonth(), 2);
            assert.equal(createdDate.end.getDate(), 14);
            assert.equal(createdDate.end.getHours(), 3);
        });

        it('should return current year in case end_year is not provided ', function () {
            var req = {
                body :{
                    start_year : 2015,
                    start_month : 3,
                    start_day :10,
                    start_hour :3,
                    end_month : 3,
                    end_day :14,
                    end_hour :3
                }
            };
            var createdDate = analytics._timePredicateBuilder(req);
            assert.notEqual(createdDate.start, null);
            assert.equal(createdDate.start.getFullYear(), 2015);
            assert.equal(createdDate.start.getMonth(), 2);
            assert.equal(createdDate.start.getDate(), 10);
            assert.equal(createdDate.start.getHours(), 3);

            assert.notEqual(createdDate.end, null);
            assert.equal(createdDate.end.getFullYear(), new Date().getFullYear());
            assert.equal(createdDate.end.getMonth(), 2);
            assert.equal(createdDate.end.getDate(), 14);
            assert.equal(createdDate.end.getHours(), 3);
        });


        it('should return current month as start month if not start_month not provided', function () {
            var req = {
                body :{
                    start_year : 2015,
                    start_day :10,
                    start_hour :3,
                    end_year : 2015,
                    end_month : 3,
                    end_day :14,
                    end_hour :3
                }
            };
            var createdDate = analytics._timePredicateBuilder(req);
            assert.notEqual(createdDate.start, null);
            assert.equal(createdDate.start.getFullYear(), 2015);
            assert.equal(createdDate.start.getMonth(), new Date().getMonth());
            assert.equal(createdDate.start.getDate(), 10);
            assert.equal(createdDate.start.getHours(), 3);

            assert.notEqual(createdDate.end, null);
            assert.equal(createdDate.end.getFullYear(), 2015);
            assert.equal(createdDate.end.getMonth(), 2);
            assert.equal(createdDate.end.getDate(), 14);
            assert.equal(createdDate.end.getHours(), 3);
        });


        it('should return end month as next month if end_month not provided, taking care of moving to first month in case of last one', function () {
            var req = {
                body :{
                    start_year : 2015,
                    start_month : 3,
                    start_day :10,
                    start_hour :3,
                    end_year : 2015,
                    end_day :14,
                    end_hour :3
                }
            };
            var createdDate = analytics._timePredicateBuilder(req);
            var currentDate = new Date();
            assert.notEqual(createdDate.start, null);
            assert.equal(createdDate.start.getFullYear(), 2015);
            assert.equal(createdDate.start.getDate(), 10);
            assert.equal(createdDate.start.getHours(), 3);

            if(currentDate.getMonth() == 12){
                assert.equal(createdDate.end.getMonth(), 1);
            } else {
                assert.equal(createdDate.end.getMonth(), currentDate.getMonth() + 1);
            }

            assert.equal(createdDate.end.getFullYear(), 2015);
            assert.equal(createdDate.end.getMonth(), currentDate.getMonth() + 1);
            assert.equal(createdDate.end.getDate(), 14);
            assert.equal(createdDate.end.getHours(), 3);
        });


        it('should return current day if start_day or end_day are not provided ', function () {
            var req = {
                body :{
                    start_year : 2015,
                    start_month : 3,
                    start_hour :3,
                    end_year : 2015,
                    end_month : 3,
                    end_hour :3
                }
            };

            var createdDate = analytics._timePredicateBuilder(req);
            assert.notEqual(createdDate.start, null);
            assert.equal(createdDate.start.getFullYear(), 2015);
            assert.equal(createdDate.start.getMonth(), 2);
            assert.equal(createdDate.start.getDate(), new Date().getDate());
            assert.equal(createdDate.start.getHours(), 3);

            assert.notEqual(createdDate.end, null);
            assert.equal(createdDate.end.getFullYear(), 2015);
            assert.equal(createdDate.end.getMonth(), 2);
            assert.equal(createdDate.end.getDate(), new Date().getDate());
            assert.equal(createdDate.end.getHours(), 3);
        });


        it('should return start hour as 23 (default value) if no start_hours parameter provided ', function () {
            var req = {
                body :{
                    start_year : 2015,
                    start_month : 3,
                    end_year : 2015,
                    end_month : 3
                }
            };

            var createdDate = analytics._timePredicateBuilder(req);
            assert.notEqual(createdDate.start, null);
            assert.equal(createdDate.start.getFullYear(), 2015);
            assert.equal(createdDate.start.getMonth(), 2);
            assert.equal(createdDate.start.getDate(), new Date().getDate());
            assert.equal(createdDate.start.getHours(), 0);

            assert.notEqual(createdDate.end, null);
            assert.equal(createdDate.end.getFullYear(), 2015);
            assert.equal(createdDate.end.getMonth(), 2);
            assert.equal(createdDate.end.getDate(), new Date().getDate());
            assert.equal(createdDate.end.getHours(), 23);
        });

    });
});

