var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(
  path.join(__dirname, '..', '..', '..', 'package.json'));
var types = require('../../..').types;

describe('cli-command:', function() {
  it('should be allowed by enum list', function(done) {
    var cli = require('../../..')(pkg);
    var list = ['css', 'scss', 'less'];
    var value = 'css';
    var args = ['-e', value];
    cli
      .option('-e, --enum <value>',
        'an enum argument', types.enum(list))
    cli.parse(args);
    expect(cli.enum).to.eql(value);
    done();
  });
  it('should wrap non-array as enum array list', function(done) {
    var cli = require('../../..')(pkg);
    var list = 'css';
    var value = 'css';
    var args = ['-e', value];
    cli
      .option('-e, --enum <value>',
        'an enum argument', types.enum(list))
    cli.parse(args);
    expect(cli.enum).to.eql(value);
    done();
  });
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
  it('should throw error on invalid enum value', function(done) {
    var cli = require('../../..')(pkg);
    var list = ['css', 'scss', 'less'];
    var args = ['-e', 'css', '--enum=sass', '-e=less'];
    cli
      .once('etype', function(e) {
        expect(e).to.be.instanceof(Error);
        expect(e.code).to.eql(this.errors.ETYPE.code);
        done();
      })
      .option('-e, --enum <value...>',
        'an enum argument', types.enum(list))
    cli.parse(args);
  });
})
