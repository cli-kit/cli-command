var runcontrol = require('cli-rc');

/**
 *  Loads rc files for a program.
 *
 *  Should be declared after the env middleware and before the merge
 *  middleware.
 *
 *  @param conf A configuration object for the rc module.
 */
module.exports = function(conf) {
  //conf = conf || this.configure().rc;
  return function rc(req, next) {
    if(!arguments.length) return;
    var scope = this, errors = this.errors;
    runcontrol(conf, function(err, rc) {
      if(err) {
        if(err instanceof SyntaxError) {
          return next(errors.ERC_SYNTAX, [err.file], err);
        }
        return next(errors.ERC_LOAD, [err.file]);
      }
      // TODO: merge rc object contents
      next();
    })
  }
}
