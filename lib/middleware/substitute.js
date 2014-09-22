var substitutor = require('../loader/substitute');

var loaded = false;

/**
 *  Performs variable substitution on program data.
 *
 *  Should be declared after the load middleware.
 */
module.exports = function(conf) {
  conf = conf || this.configure().substitute;
  if(!conf || !conf.enabled) return this;
  return function substitute(req, next) {
    if(loaded) {
      return next();
    }

    // build up see variables (top-level)
    var subs = req.substitute || {};
    var list = this.finder.getCommandList(null, {max: 1});
    list = list.sort(function(a, b) {
      a = a.key(), b = b.key();
      if(a > b) {
        return 1;
      }else if(a < b) {
        return -1;
      }
      return 0;
    })
    var i, cmd, nm, val, prefix = 'see_', suffix = '(1)', all = [];
    for(i = 0;i < list.length;i++) {
      cmd = list[i];
      nm = prefix + cmd.getFullName('_', true, true, true);
      val = cmd.getFullName(null, true, true, false) + suffix;
      subs[nm] = val;
      all.push(val);
    }

    // join the lot together for SEE man sections
    req.substitute.see_all = all.join(', ');

    substitutor.call(this, req.substitute || {},
      conf.escaping !== undefined ? conf.escaping : true);
    this.emit('substitute', req);
    if(this.configure().load.cache) {
      loaded = module.exports.loaded = true;
    }
    next();
  }
}
