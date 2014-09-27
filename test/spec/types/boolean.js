var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(
  path.join(__dirname, '..', '..', '..', 'package.json'));
var types = require('../../..').types;

describe('cli-command:', function() {
  it('should coerce to array of booleans', function(done) {
    var cli = require('../../..')(pkg);
    var args = ['-b', 'true', '--boolean=False', '-b=1', '-b', '0' ];
    cli
      .option('-b, --boolean <boolean...>', 'a boolean argument', types.boolean)
    cli.parse(args);
    expect(cli.boolean).to.eql([true, false, true, false]);
    done();
  });
})
