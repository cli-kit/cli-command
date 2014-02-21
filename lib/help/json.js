var fields = [
  'author',
  'bugs',
  'contributors',
  'license',
  'licenses',
  'repository'
]

function json() {
  var pkg = this.package();
  var o = {};
  o.name = this.name();
  o.version = this.version();
  o.description = this.description();
  if(pkg) {
    fields.forEach(function(z) {
      if(pkg[z]) o[z] = pkg[z];
    });
  }
  return o;
}

json.fields = fields;

module.exports = json;
