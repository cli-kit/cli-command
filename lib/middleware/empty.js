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
    if(!req.argv.length || req.result.empty) {
      var harg = this._options.helpopt;
      var varg = this._options.versionopt;
      var help = harg && harg.action() ? harg.action() : defaults.help;
      var version = varg && varg.action() ? varg.action() : defaults.version;
      this.emit('empty', help, version, req, next);
    }

    // TODO: put this in an else clause so the empty
    // TODO: handler should call next
    next();
  }
}
