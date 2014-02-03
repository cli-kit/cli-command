var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(
  path.join(__dirname, '..', '..', '..', 'package.json'));
var types = require('../../..').types;

describe('cli-command:', function() {
  it('should be an array list (single value)', function(done) {
    var cli = require('../../..')(pkg);
    var value = 'value';
    var args = ['-l', value];
    cli
      .option('-l, --list <list>',
        'a comma-delimited list argument', types.list(/\s*,\s*/))
    cli.parse(args);
    expect(cli.list).to.eql([value]);
    done();
  });
  it('should be an array list (multiple value)', function(done) {
    var cli = require('../../..')(pkg);
    var value = 'apple , orange,pear, mango';
    var args = ['--list', value];
    cli
      .option('-l, --list <list>',
        'a comma-delimited list argument', types.list(/\s*,\s*/))
    cli.parse(args);
    expect(cli.list).to.eql(['apple', 'orange', 'pear', 'mango']);
    done();
  });
})
