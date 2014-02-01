var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(path.join(__dirname, '..', '..', '..', 'package.json'));
var cli = require('../../..')(pkg);
var types = require('../../..').types;

describe('cli-command:', function() {
  var pi = 3.14159265359;
  var golden = 1.61803398875;
  it('should coerce single value to float', function(done) {
    var args = ['-f', '' + pi];
    cli
      .option('-f, --float <n>', 'a float argument', types.float)
    cli.parse(args);
    expect(cli.float).to.eql(pi);
    done();
  });
  it('should coerce multiple values to array of floats', function(done) {
    var args = ['-f', '' + pi, '--float=' + golden];
    cli
      .option('-f, --float <n...>', 'a float argument', types.float)
    cli.parse(args);
    expect(cli.float).to.eql([pi, golden]);
    done();
  });
  it('should error on invalid float', function(done) {
    var args = ['-f', 'xyz'];
    cli
      .error(function(code, codes, message, parameters, data) {
        expect(cli).to.eql(this);
        expect(code).to.eql(codes.ETYPE);
        //parameters.unshift(message);
        //console.error.apply(null, parameters);
        done();
      })
      .option('-f, --float <n>', 'a float argument', types.float)
    cli.parse(args);
  });
  it('should error on invalid float in array', function(done) {
    var args = ['-f', '' + pi, '--float=' + golden, '--float', 'zyx'];
    cli
      .error(function(code, codes, message, parameters, data) {
        expect(cli).to.eql(this);
        expect(code).to.eql(codes.ETYPE);
        //parameters.unshift(message);
        //console.error.apply(null, parameters);
        done();
      })
      .option('-f, --float <n...>', 'a float argument', types.float)
    cli.parse(args);
  });
})
