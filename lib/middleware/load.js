/**
 *  Loads program commands, options and help information
 *  from a markdown definition.
 */
module.exports = function() {
  var conf = this.configure();
  console.log('load middleware %j', conf);
  return function load(req, next) {
    if(!arguments.length) return;
    this.emit('load');
    next();
  }
}
