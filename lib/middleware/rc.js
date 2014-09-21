var assign = require('../util/assign');
var loaded;

/**
 *  Loads rc files for a program.
 *
 *  Should be declared after the env middleware and before the merge
 *  middleware.
 *
 *  @param conf A configuration object for the rc module.
 */
module.exports = function(conf) {
  var config = this.configure();
  conf = conf || config.rc;
  if(!conf) return this;
  return function rc(req, next) {
    if(loaded && conf.cache) {
      req.rc = loaded.rc;
      req.runcontrol = loaded.runcontrol;
      return next();
    }
    var scope = this
      , errors = this.errors
      , onload = conf.onload
      , runcontrol;

    try {
      runcontrol = require('cli-rc');
    }catch(e) {
      return next(errors.ERC_MODULE);
    }
    if(conf.keys && conf.keys.append) {
      var files = req.result.options[conf.keys.append];
      if(files) {
        files = Array.isArray(files) ? files : [files];
        //console.log('got rc search path append value %j', files);
        conf.append = files;
      }
    }
    runcontrol(conf, function(err, rc, runcontrol) {
      if(err) {
        if(err instanceof SyntaxError) {
          return next(errors.ERC_SYNTAX, [err.file], err);
        }
        return next(errors.ERC_LOAD, [err.file]);
      }
      req.runcontrol = runcontrol;
      req.rc = rc;
      if(conf.merge !== false) {
        for(var k in rc) {
          assign.call(scope, null, k, rc[k]);
        }
      }

      loaded = {rc: rc, runcontrol: runcontrol};

      // persistent reference
      config.rc = config.rc || {};
      config.rc.info = loaded;

      if(typeof onload === 'function') {
        return onload.call(scope, req, next, rc, runcontrol);
      }

      next();
    })
  }
}
