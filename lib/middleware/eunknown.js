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
    //console.log('unparsed %j', unparsed);
    if(conf.strict && unparsed.length) {
      return next(this.errors.EUNKNOWN,[unparsed.shift()]);
    }
    //var k, v, arg;
    //for(k in req.result.all) {
      //arg = this._options[k];
      //if(arg) {
        //v = req.result.all[k];
        //if(!arg.multiple() && Array.isArray(v)) {
          //return next(this.errors.EMULTIPLE,
            //[arg.toString(null), v.join(', ')]);
        //}
      //}
    //}
    next();
  }
}
