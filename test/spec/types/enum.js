var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(
  path.join(__dirname, '..', '..', '..', 'package.json'));
var types = require('../../..').types;

describe('cli-command:', function() {
  it('should be allowed by enum list (repeatable)', function(done) {
    var cli = require('../../..')(pkg);
    var list = ['css', 'scss', 'less'];
    var args = ['-e', 'css', '--enum=scss'];
    cli
      .option('-e, --enum <value...>',
        'an enum argument', types.enum(list))
    cli.parse(args);
    expect(cli.enum).to.eql(['css', 'scss']);
    done();
  });
  it('should allow primitives in enum list (repeatable)', function(done) {
    var cli = require('../../..')(pkg);
    var list = [null, false, true, 1, -1, undefined, 'string'];
    var args = [
      '-e=null', '-e=false', '-e=true', '-e=1', '-e=-1', '-e', '-1',
      '-e=undefined', '-e=string'];
    cli
      .option('-e, --enum <value...>',
        'an enum argument', types.enum(list, true))
    cli.parse(args);
    expect(cli.enum).to.eql([null, false, true, 1, -1, -1, undefined, 'string']);
    done();
  });
})
