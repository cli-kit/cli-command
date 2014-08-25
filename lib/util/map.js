module.exports = function ConverterMap(source) {
  for(var z in source) {
    this[z] = source[z];
  }
}
