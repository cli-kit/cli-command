/**
 *  The ecommand middleware verifies that a known top-level command
 *  has been specified, should be added before the ready middleware.
 *
 *  In order for this middleware to be enabled the required property of the
 *  command configuration should be set to indicate that the program requires
 *  a command.
 *
 *  The command middleware also performs this check however if you have
 *  ready middleware configured and perform argument validation there then
 *  any errors in ready will fire before the command middleware.
 *
 *  This allows EUNKNOWN_COMMAND to be triggered before any ready middleware
 *  validation which makes more sense.
 *
 *  Note that if there are listeners for the empty event and argv length is
 *  zero no validation is performed, it is deferred to the empty listener.
 */
module.exports = function() {
  var conf = this.configure();
  if(!conf.command) return this;
  return function ecommand(req, next) {
    if(!conf.command.required) return next();

    // defer to empty listener
    var empty = this.listeners('empty').length > 0
      , alias = this.finder.getCommandByName;
    if(empty && req.argv.length === 0) {
      return next();
    }

    var unparsed = req.result.unparsed;
    if(!unparsed.length) {
      if(typeof conf.command.required === 'function') {
        return conf.command.required.call(this, req, next);
      }
      return next(this.errors.ECOMMAND_REQUIRED);
    }else{
      var arg = alias(unparsed[0], this.commands());
      if(!arg) {
        return next(this.errors.EUNKNOWN_COMMAND, [unparsed[0]]);
      }
    }
    next();
  }
}
