var defaults = {
  help: require('./help').action,
  version: require('./version').action
}

/**
 *  Emits the run event and stops middleware execution
 *  if there are no commands for the program.
 */
module.exports = function() {
  return function empty(req, next) {
    var cmds = Object.keys(this._commands);
    if(!cmds.length) {
      return this.emit('run', req);
    }
    next();
  }
}
