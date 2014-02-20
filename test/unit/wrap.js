var path = require('path');
var expect = require('chai').expect;
var CliError = require('cli-error').CliError;
var ErrorDefinition = require('cli-error').ErrorDefinition;

var msg = 'Mock error message';

describe('cli-command:', function() {
  it('should throw type error on zero arguments to wrap', function(done) {
    var cli = require('../..')(null, 'error-wrap');
    function fn() {
      var err = cli.wrap();
    }
    expect(fn).throws(TypeError);
    done();
  });
  it('should throw type error on invalid argument', function(done) {
    var cli = require('../..')(null, 'error-wrap');
    function fn() {
      var err = cli.wrap({});
    }
    expect(fn).throws(TypeError);
    done();
  });
  it('should return cli error', function(done) {
    var cli = require('../..')(null, 'error-wrap');
    var e = new CliError(msg);
    var err = cli.wrap(e);
    expect(err).to.eql(e);
    expect(err.message).to.eql(msg);
    //console.dir(err.code);
    done();
  });
  it('should wrap error message', function(done) {
    var cli = require('../..')(null, 'error-wrap');
    //var e = new Error(msg);
    var err = cli.wrap(msg);
    expect(err).to.be.instanceof(CliError);
    //expect(err.cause()).to.eql(e);
    expect(err.message).to.eql(msg);
    expect(err.code).to.eql(cli.errors.EUNCAUGHT.code);
    done();
  });
  it('should wrap plain error', function(done) {
    var cli = require('../..')(null, 'error-wrap');
    var e = new Error(msg);
    var err = cli.wrap(e);
    expect(err).to.be.instanceof(CliError);
    expect(err.cause()).to.eql(e);
    expect(err.message).to.eql(msg);
    expect(err.code).to.eql(cli.errors.EUNCAUGHT.code);
    done();
  });
  it('should convert error definition', function(done) {
    var cli = require('../..')(null, 'error-wrap');
    var e = new ErrorDefinition(null, msg);
    var err = cli.wrap(e);
    expect(err).to.be.instanceof(CliError);
    expect(err.message).to.eql(msg);
    //expect(err.code).to.eql(cli.errors.EUNCAUGHT.code);
    done();
  });
  it('should convert error definition with source error', function(done) {
    var cli = require('../..')(null, 'error-wrap');
    var ex = new Error(msg);
    var e = new ErrorDefinition();
    var err = cli.wrap(e, null, ex);
    expect(err).to.be.instanceof(CliError);
    expect(err.message).to.eql(msg);
    //expect(err.code).to.eql(cli.errors.EUNCAUGHT.code);
    done();
  });
})
