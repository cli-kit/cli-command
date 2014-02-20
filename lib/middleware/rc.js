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
    runcontrol(conf, function(err, rc) {
      //console.dir('rc complete...');
      next();
    })
  }
}
