/**
 *  Utility used to determine the name of a function.
 *
 *  @param func The function.
 *
 *  @return The string name of the function if instantiating
 *  the function does not throw an error, otherwise null.
 */
module.exports = function(func) {
  //console.log('func %s', func);
  var name = null;
  try{
    name = new func().constructor.name;
  }catch(e){}
  return name;
}
