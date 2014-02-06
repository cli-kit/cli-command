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
    // NOTE: this little dance allows custom help and version
    // NOTE: callbacks to invoke the original implementations
    // NOTE: from empty event listeners
    //var help, version, _help, _version, scope = this;
    //help = _help = handler.call(this, 'help');
    //version = _version = handler.call(this, 'version');
    //if(help != actions.help) {
      //help = function() {
        //_help.call(scope, actions.help);
      //}
    //}
    //if(version != actions.version) {
      //version = function() {
        //_version.call(scope, actions.version);
      //}
    //}
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
