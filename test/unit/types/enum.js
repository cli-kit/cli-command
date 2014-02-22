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
  it('should allow primitive in enum list (null)', function(done) {
    var cli = require('../../..')(pkg);
    var list = [null, false, true, 1, -1, undefined];
    var value = 'null';
    var args = ['-e', value];
    cli
      .option('-e, --enum <value>',
        'an enum argument', types.enum(list, true))
    cli.parse(args);
    expect(cli.enum).to.eql(null);
    done();
  });
  it('should allow primitive in enum list (false)', function(done) {
    var cli = require('../../..')(pkg);
    var list = [null, false, true, 1, -1, undefined];
    var value = 'false';
    var args = ['-e', value];
    cli
      .option('-e, --enum <value>',
        'an enum argument', types.enum(list, true))
    cli.parse(args);
    expect(cli.enum).to.eql(false);
    done();
  });
  it('should allow primitive in enum list (true)', function(done) {
    var cli = require('../../..')(pkg);
    var list = [null, false, true, 1, -1, undefined];
    var value = 'true';
    var args = ['-e', value];
    cli
      .option('-e, --enum <value>',
        'an enum argument', types.enum(list, true))
    cli.parse(args);
    expect(cli.enum).to.eql(true);
    done();
  });
  it('should allow primitive in enum list (1)', function(done) {
    var cli = require('../../..')(pkg);
    var list = [null, false, true, 1, -1, undefined];
    var value = '1';
    var args = ['-e', value];
    cli
      .option('-e, --enum <value>',
        'an enum argument', types.enum(list, true))
    cli.parse(args);
    expect(cli.enum).to.eql(1);
    done();
  });
  it('should allow primitive in enum list (-1)', function(done) {
    var cli = require('../../..')(pkg);
    var list = [null, false, true, 1, -1, undefined];
    var value = '-1';
    var args = ['-e', value];
    cli
      .option('-e, --enum <value>',
        'an enum argument', types.enum(list, true))
    cli.parse(args);
    expect(cli.enum).to.eql(-1);
    done();
  });
  it('should allow primitive in enum list (undefined)', function(done) {
    var cli = require('../../..')(pkg);
    var list = [null, false, true, 1, -1, undefined];
    var value = 'undefined';
    var args = ['-e', value];
    cli
      .option('-e, --enum <value>',
        'an enum argument', types.enum(list, true))
    cli.parse(args);
    expect(cli.enum).to.eql(undefined);
    done();
  });
  it('should allow primitive in enum list (string)', function(done) {
    var cli = require('../../..')(pkg);
    var list = [null, false, true, 1, -1, undefined, 'string'];
    var value = 'string';
    var args = ['-e', value];
    cli
      .option('-e, --enum <value>',
        'an enum argument', types.enum(list, true))
    cli.parse(args);
    expect(cli.enum).to.eql('string');
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
