var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(path.join(__dirname, '..', '..', 'package.json'));
var cli = require('../..')(pkg);

describe('cli-command:', function() {
  it('should execute help function', function(done) {
    var args = ['-h'];
    cli.help(function(help) {
      done();
    })
    //console.dir(args);
    cli.parse(args);
  });
})
