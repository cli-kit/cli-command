var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(path.join(__dirname, '..', '..', 'package.json'));

describe('cli-command:', function() {
  it('should error on unknown option (strict mode)', function(done) {
    var cli = require('../..')(pkg);
    var args = ['unknown value'];
    cli.configure({strict: true})
      .on('error', function(e) {
        expect(e.code).to.eql(this.errors.EUNKNOWN.code);
        done();
      })
      .parse(args);
  });
  it('should disable unknown option validation', function(done) {
    var cli = require('../..')(pkg);
    var args = ['unknown value'];
    cli.configure({unknown: false})
      .parse(args);
    expect(cli.request().args).to.eql(args);
    expect(cli.request().unparsed).to.eql(args);
    done();
  });
  it('should allow all unknown options (string converter)', function(done) {
    var cli = require('../..')(pkg);
    var args = ['unknown value'];
    cli
      .converter(String)
      .parse(args);
    expect(cli.request().args).to.eql(args);
    expect(cli.request().unparsed).to.eql([]);
    done();
  });
  it('should allow all unknown options (number converter)', function(done) {
    var cli = require('../..')(pkg);
    var args = ['1', '2', '3'];
    cli
      .converter(Number)
      .parse(args);
    expect(cli.request().args).to.eql([1,2,3]);
    expect(cli.request().unparsed).to.eql([]);
    done();
  });
  it('should emit unknown event (-strict -converter)', function(done) {
    var cli = require('../..')(pkg);
    var args = ['unknown value'];
    cli
      .on('unknown', function(unparsed, request) {
        expect(unparsed).to.eql(args);
        done();
      })
      .parse(args);
  });
})
