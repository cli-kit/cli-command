var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(path.join(__dirname, '..', '..', 'package.json'));

describe('cli-command:', function() {
  it('should set default value on program', function(done) {
    var value = 'a default value';
    var cli = require('../..')(pkg);
    var args = [];
    cli.option('-d --default [str]', 'a default value option', value);
    cli.parse(args);
    expect(cli.default).to.eql(value);
    done();
  });
  it('should set default value on stash object', function(done) {
    var value = 'a default value';
    var cli = require('../..')(pkg);
    var stash = {};
    var args = [];
    cli.configure({stash: stash});
    cli.option('-d --default [str]', 'a default value option', value);
    cli.parse(args);
    expect(stash.default).to.eql(value);
    done();
  });
})
