var defaults = {
  help: require('./help').action,
  version: require('./version').action
}

/**
 *  Emits the empty event if zero arguments were passed
 *  when parse() was invoked.
 */
module.exports = function() {
  return function empty(req, next) {
    if(!req.argv.length) {
      var harg = this._arguments.help;
      var varg = this._arguments.version;
      var help = harg && harg.action() ? harg.action() : defaults.help;
      var version = varg && varg.action() ? varg.action() : defaults.version;
      return this.emit('empty', help, version);
    }
    next();
  }
}
