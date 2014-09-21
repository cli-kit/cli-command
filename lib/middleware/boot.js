/**
 *  The boot middleware invokes a boot function declared on the configuration
 *  object.
 *
 *  A boot function may be used to check for external dependencies or any
 *  preconditions that a program relies on.
 *
 *  This middleware should be invoked as early as possible in the middleware
 *  invocation chain, preferably immediately after the error middleware.
 */
module.exports = function() {
  var conf = this.configure();
  if(typeof conf.boot !== 'function') return this;
  return function boot(req, next) {
    conf.boot.call(this, req, next);
  }
}
