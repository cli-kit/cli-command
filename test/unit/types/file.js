var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(
  path.join(__dirname, '..', '..', '..', 'package.json'));
var types = require('../../..').types;

describe('cli-command:', function() {
  it('should be a file type', function(done) {
    var cli = require('../../..')(pkg);
    var value = '/etc/passwd';
    var args = ['-f', value];
    cli
      .option('-f, --file <file>', 'a file argument', types.file('f'))
    cli.parse(args);
    expect(cli.file).to.eql(value);
    done();
  });
})
