var assign = require('../util/assign');

/**
 *  Loads rc files for a program.
 *
 *  Should be declared after the env middleware and before the merge
 *  middleware.
 *
 *  @param conf A configuration object for the rc module.
 */
module.exports = function(conf) {
  conf = conf || this.configure().rc;
  return function rc(req, next) {
    if(!arguments.length) return;
    if(!conf) return next();
    var scope = this, errors = this.errors;
    var runcontrol;
    try {
      runcontrol = require('cli-rc');
    }catch(e) {
      return next(errors.ERC_MODULE);
    }
    runcontrol(conf, function(err, rc) {
      if(err) {
        if(err instanceof SyntaxError) {
          return next(errors.ERC_SYNTAX, [err.file], err);
        }
        return next(errors.ERC_LOAD, [err.file]);
      }
      req.rc = rc;
      if(conf.merge !== false) {
        for(var k in rc) {
          assign.call(scope, null, k, rc[k]);
        }
      }
      next();
    })
  }
}
