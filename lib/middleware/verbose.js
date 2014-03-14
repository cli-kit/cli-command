/**
 *  Adds a verbose option to the program.
 *
 *  @param name The option name.
 *  @param description The option description.
 */
module.exports = function(name, description) {
  name = name || '-v, --verbose';
  description = description || 'print more information';
  this.option(name, description);
  return this;
}
