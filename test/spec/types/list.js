var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(
  path.join(__dirname, '..', '..', '..', 'package.json'));
var types = require('../../..').types;

describe('cli-command:', function() {
  it('should be a multi-dimensional array list (repeatable)', function(done) {
    var cli = require('../../..')(pkg);
    var value = 'apple , orange,pear, mango';
    var alt = 'banana, watermelon';
    var args = ['-l', value, '--list', alt];
    cli
      .option('-l, --list <list...>',
        'a comma-delimited list argument', types.list(/\s*,\s*/))
    cli.parse(args);
    expect(cli.list).to.eql([
      ['apple', 'orange', 'pear', 'mango'], ['banana', 'watermelon']]);
    done();
  });
})
