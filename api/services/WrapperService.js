var Promise = require('bluebird');

function defaultLogFn(err) {
  if (process.env.NODE_ENV && process.env.NODE_ENV === 'test') return;
  console.log(err);
}

function Wrapper(fn, _this, errLogFn) {
  if (typeof fn !== 'function') throw new Error('Must wrap a function');
  this.fn = fn;
  this._this = _this || {};
  this._boundFn = fn.bind(_this);
  this._errLogFn = errLogFn || defaultLogFn;
}

Wrapper.prototype.invoke = function() {
  try { return this._boundFn.apply(null, arguments); }
  catch(err) {
    this._errLogFn(err);
    var callback = arguments[arguments.length - 1];
    if (typeof callback === 'function') return callback(err);
  }
};

Wrapper.prototype.invokeAsPromise = function() {
  return Promise.promisify(this.invoke).apply(this, arguments);
};

module.exports = Wrapper;
