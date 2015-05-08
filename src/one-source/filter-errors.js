const {createStream, createProperty} = require('../patterns/one-source');

const mixin = {

  _init({fn}) {
    this._fn = fn;
  },

  _free() {
    this._fn = null;
  },

  _handleError(x) {
    if (this._fn(x)) {
      this._emitError(x);
    }
  }

};

const S = createStream('filterErrors', mixin);
const P = createProperty('filterErrors', mixin);


const id = x => x;

module.exports = function filterErrors(obs, fn = id) {
  return new (obs.ofSameType(S, P))(obs, {fn});
};