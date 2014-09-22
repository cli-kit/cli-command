var coerce = require('../util/coerce').coerce;

/**
 *  Filters commands from the unparsed arguments array.
 *
 *  Note that currently this only filters top-level commands.
 */
function filter(unparsed) {
  var cmds = this.commands()
    , alias = this.finder.getCommandByName;
  var i, l = unparsed.length;
  for(i = 0;i < l;i++) {
    //console.log('unparsed filter %s', unparsed[i]);
    if(alias(unparsed[i], cmds)) {
      unparsed.splice(i, 1);
      i--;
      l--;
    }
  }
  //console.log('return %j', unparsed);
  return unparsed;
}

/**
 *  Coerces unparsed arguments.
 *
 *  The resulting array is then assigned to the request
 *  for easy access.
 */
module.exports = function() {
  return function unparsed(req, next) {
    var conf = this.configure();
    var args = req.result.unparsed.slice(0), v, i = 0, j = 0;
    req.unparsed = args.slice(0);
    args = filter.call(this, args);
    req.args = args;
    if(conf.strict) return next();
    if(typeof(this.converter()) == 'function'
      || this.converter() === JSON) {
      for(i = 0;i < args.length;i++, j++) {
        try {
          v = coerce.call(this, this, args[i], i);
          req.unparsed.splice(j, 1);
          args[i] = v;
          j--;
        }catch(e) {
          return next(e);
        }
      }
    }
    //console.dir(args);
    next();
  }
}
