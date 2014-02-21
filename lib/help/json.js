function json() {
  var o = {};
  o.name = this.name();
  o.description = this.description();
  return o;
}

module.exports = json;
