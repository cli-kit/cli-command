var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(path.join(__dirname, '..', '..', '..', 'package.json'));
var types = require('../../..').types;

describe('cli-command:', function() {
  it('should be a string', function(done) {
    var cli = require('../../..')(pkg);
    var value = 'value';
    var args = ['-s', value];
    cli
      .option('-s, --string <s>', 'a string argument', types.string)
    cli.parse(args);
    expect(cli.string).to.eql(value);
    done();
  });
})
