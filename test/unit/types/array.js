var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(
  path.join(__dirname, '..', '..', '..', 'package.json'));
var types = require('../../..').types;

describe('cli-command:', function() {
  it('should be an array (single value)', function(done) {
    var cli = require('../../..')(pkg);
    var value = 'value';
    var args = ['-a', value];
    cli
      .option('-a, --array <a>', 'an array argument', types.array)
    cli.parse(args);
    expect(cli.array).to.eql([value]);
    done();
  });
  it('should be an array (multiple value)', function(done) {
    var cli = require('../../..')(pkg);
    var value = 'value';
    var args = ['-a', value, '--array=' + value, '-a', 'value'];
    cli
      .option('-a, --array <a...>', 'an array argument', types.array)
    cli.parse(args);
    expect(cli.array).to.eql([value, value, value]);
    done();
  });
})
