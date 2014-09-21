var prefix = 'opt:';
var reserved = ['error'];

/**
 *  Dispatches events for all parsed arguments that match
 *  a known option.
 */
module.exports = function() {
  var conf = this.configure();
  if(conf.events === false) return this;
  return function events(req, next) {
    var z, arg;
    for(z in req.result.all) {
      arg = this._options[z];
      if(arg) {
        var name = arg.key();
        if(~reserved.indexOf(name)) name = prefix.name;
        this.emit(name, req, arg, req.result.all[z]);
      }
    }
    next();
  }
}
module.exports.prefix = prefix;
