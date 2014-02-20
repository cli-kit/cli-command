/**
 *  Adds a default error event listener to the
 *  program.
 */
module.exports = function error() {
  var errors = this.errors;
  var listeners = this.listeners('error');
  if(!listeners.length) {
    this.on('error', function(e) {
      var key = ('' + e.key).toLowerCase();
      if(this.listeners(key).length) return this.emit(key, e, errors);
      this.error(e, errors);
    })
  }
  return this;
}
