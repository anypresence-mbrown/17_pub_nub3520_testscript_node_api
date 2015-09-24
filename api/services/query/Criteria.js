var util = require('util');
var Criteria;

Criteria = (function() {

  function Criteria(target) {
		this.baseCriteria = {};
    this.target = target;
		return this;
  }

  Criteria.prototype.or = function(queryCriteria) {
    if (this.baseCriteria['or'] == undefined) {
      this.baseCriteria['or'] = [];
    }
    this.baseCriteria['or'].push(queryCriteria);
    return this;
  };

  Criteria.prototype.and = function(queryCriteria) {
    var key;
    var queryKeys = _.keys(queryCriteria);
		var len = queryKeys.length;
    for (var i = 0; i < len; i++) {
      key = queryKeys[i];
      this.baseCriteria[key] = queryCriteria[key];
    }
    return this;
  };

  Criteria.prototype.limit = function(newLimit) {
    this._limit = newLimit;
    return this;
  };

  Criteria.prototype.offset = function(newOffset) {
    this._offset = newOffset;
    return this;
  };

  Criteria.prototype.orderBy = function(orderByField) {
    this.orderBy = orderByField;
    return this;
  };

  Criteria.prototype.count = function(aggregateField) {
    this.aggFunction = 'count';
    this.aggField = aggregateField;
    return this;
  };

  Criteria.prototype.min = function(aggregateField) {
    this.aggFunction = 'min';
    this.aggField = aggregateField;
    return this;
  };

  Criteria.prototype.max = function(aggregateField) {
    this.aggFunction = 'max';
    this.aggField = aggregateField;
    return this;
  };

  Criteria.prototype.sum = function(aggregateField) {
    this.aggFunction = 'sum';
    this.aggField = aggregateField;
    return this;
  };

  Criteria.prototype.avg = function(aggregateField) {
    this.aggFunction = 'average';
    this.aggField = aggregateField;
    return this;
  };

  Criteria.prototype.query = function() {
    var column, self, tmp;
    tmp = null;
    if (this.aggFunction != null) {
      if (this.aggFunction == 'count') {
        tmp = this.target.count().where(this.baseCriteria);
      } else {
				if(this.target.attributes[this.aggField].columnName != null) {
					column = this.target.attributes[this.aggField].columnName;
				}
				else {
					column = this.aggField;
				}
        tmp = this.target.find().where(this.baseCriteria)[this.aggFunction](column);
      }
    } else {
      tmp = this.target.find().where(this.baseCriteria);
      if (this._limit != null) {
        tmp = tmp.limit(this._limit);
      }
      if (this._offset != null) {
        tmp = tmp.skip(this._offset);
      }
      if (this.orderBy != null) {
        tmp = tmp.sort(this.orderBy);
      }
    }
    return tmp;
  };

  return Criteria;

})();

module.exports = Criteria;
