/**
 *  The ready middleware is invoked before command execution
 *  but after arguments have been parsed.
 *
 *  This allows programs to perform manipulation of the parsed arguments
 *  prior to command execution, useful if you have mutually exclusive arguments
 *  of wish to always perform an action and decorate the request prior to
 *  command execution.
 */
module.exports = function() {
  var conf = this.configure();
  if(typeof conf.ready !== 'function') return this;
  return function ready(req, next) {
    conf.ready.call(this, req, next);
  }
}
