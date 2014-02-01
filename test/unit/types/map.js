var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(path.join(__dirname, '..', '..', '..', 'package.json'));
var cli = require('../../..')(pkg);

describe('cli-command:', function() {
  it('should be a string (String)', function(done) {
    var value = 'value';
    var args = ['-s', value];
    cli
      .option('-s, --string <s>', 'a string argument', String)
    cli.parse(args);
    expect(cli.string).to.eql(value);
    done();
  });
})
