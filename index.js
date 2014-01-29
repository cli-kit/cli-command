var cli = require('cli-define');
var parser = require('cli-argparse');

function parse(args) {
  //console.log('parse called');
  var map = parser(args);
  //console.dir(map);
  //console.dir(this);
}

module.exports = function(package, name, description) {
  var root = cli(package, name, description);
  root.parse = parse;
  return root;
}
