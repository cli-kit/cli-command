var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(
  path.join(__dirname, '..', '..', '..', 'package.json'));
var cli = require('../../..')(pkg);
var types = require('../../..').types;

describe('cli-command:', function() {
  it('should coerce to boolean (true)', function(done) {
    var args = ['-b', 'true'];
    cli
      .option('-b, --boolean <boolean>', 'a boolean argument', types.boolean)
    cli.parse(args);
    expect(cli.boolean).to.eql(true);
    done();
  });
  it('should coerce to boolean (false)', function(done) {
    var args = ['-b', 'false'];
    cli
      .option('-b, --boolean <boolean>', 'a boolean argument', types.boolean)
    cli.parse(args);
    expect(cli.boolean).to.eql(false);
    done();
  });
  it('should coerce to boolean (true) insensitive', function(done) {
    var args = ['-b', 'TRUE'];
    cli
      .option('-b, --boolean <boolean>', 'a boolean argument', types.boolean)
    cli.parse(args);
    expect(cli.boolean).to.eql(true);
    done();
  });
  it('should coerce to boolean (false) insensitive', function(done) {
    var args = ['-b', 'FALSE'];
    cli
      .option('-b, --boolean <boolean>', 'a boolean argument', types.boolean)
    cli.parse(args);
    expect(cli.boolean).to.eql(false);
    done();
  });
  it('should coerce to boolean (true) integer', function(done) {
    var args = ['-b', '1'];
    cli
      .option('-b, --boolean <boolean>', 'a boolean argument', types.boolean)
    cli.parse(args);
    expect(cli.boolean).to.eql(true);
    done();
  });
  it('should coerce to boolean (false) integer', function(done) {
    var args = ['-b', '0'];
    cli
      .option('-b, --boolean <boolean>', 'a boolean argument', types.boolean)
    cli.parse(args);
    expect(cli.boolean).to.eql(false);
    done();
  });
  it('should coerce to boolean (true) positive string length', function(done) {
    var args = ['-b', 'value'];
    cli
      .option('-b, --boolean <boolean>', 'a boolean argument', types.boolean)
    cli.parse(args);
    expect(cli.boolean).to.eql(true);
    done();
  });
  it('should coerce to array of booleans', function(done) {
    var args = ['-b', 'true', '--boolean=False', '-b=1', '-b', '0' ];
    cli
      .option('-b, --boolean <boolean...>', 'a boolean argument', types.boolean)
    cli.parse(args);
    expect(cli.boolean).to.eql([true, false, true, false]);
    done();
  });
})
