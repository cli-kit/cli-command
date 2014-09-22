var assign = require('../util/assign');

/**
 *  The merge middleware assigns argument values to the program stash.
 *
 *  Note that options assigned to child commands are assigned to the top-level
 *  stash (the program or a custom stash object) so there are potentially
 *  conflicts if you use options with the same key as global options and as
 *  command specific options.
 */
module.exports = function() {
  return function merge(req, next) {
    var k, v, arg
      , find = this.finder.findOption;
    //console.dir(req.result);
    for(k in req.result.all) {
      arg = find.call(this, k);
      if(arg) {
        v = req.result.all[k];
        if(arg.multiple() && !Array.isArray(v)) {
          v = [v];
        }
        //console.log('merge assign: %s=%s', k, v);
        assign.call(this, arg, k, v);
        //console.log('after merge %s', this[k]);
        //
      }
    }
    next();
  }
}
