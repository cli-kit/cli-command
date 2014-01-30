/**
 *  Default program version action.
 *
 *  @param alive Do not exit the process.
 *  @param format The format string.
 *  @param ... Message replacement parameters.
 */
module.exports =  function(alive) {
  var opts = [this._version];
  if(arguments.length > 1) {
    opts = opts.concat([].slice.call(arguments, 1));
  }
  opts.unshift(this._name + ' %s');
  console.log.apply(console, opts);
  if(!alive) process.exit();
}
