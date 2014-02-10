/**
 *  Validates that there are no more unparsed options
 *  and throws an error if there are unparsed arguments.
 *
 *  Should be specified after the unparsed middleware.
 */
module.exports = function() {
  return function eunknown(req, next) {
    if(!arguments.length) return;
    var conf = this.configure();
    if(conf.unknown === false) return next();
    var unparsed = req.unparsed || [];
    if(conf.strict && unparsed.length) {
      return next(this.errors.EUNKNOWN,[unparsed.shift()]);
    }else if(unparsed.length) {
      this.emit('unknown', unparsed, req);
    }
    next();
  }
}
