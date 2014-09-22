/**
 *  Type to represent a mapping of converter functions
 *  to command keys so that validation for an argument
 *  may switch on command.
 */
module.exports = function ConverterMap(source) {
  for(var z in source) {
    this[z] = source[z];
  }
}
