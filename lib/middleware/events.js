/**
 *  Dispatches events for all parsed arguments that match
 *  a known option or command.
 */
module.exports = function() {
  return function events(req, next) {
    if(!arguments.length) return;
    next();
  }
}
