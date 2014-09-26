var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(path.join(__dirname, '..', '..', 'package.json'));

describe('cli-command:', function() {
  it('should set property on stash object', function(done) {
    var cli = require('../..')(pkg, 'mock-stash-object');
    var stash = {};
    cli.configure({stash: stash});
    var args = ['-i=10'];
    cli.option('-i, --integer [n]', 'an integer', Number);
    cli.parse(args);
    expect(cli.integer).to.eql(undefined);
    expect(stash.integer).to.eql(10);
    done();
  });
})
