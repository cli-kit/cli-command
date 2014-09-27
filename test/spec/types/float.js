var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(path.join(__dirname, '..', '..', '..', 'package.json'));
var types = require('../../..').types;

describe('cli-command:', function() {
  var pi = 3.14159265359;
  var golden = 1.61803398875;
  it('should coerce multiple values to array of floats', function(done) {
    var cli = require('../../..')(pkg);
    cli.configure({exit:false});
    var args = ['-f', '' + pi, '--float=' + golden];
    cli
      .option('-f, --float <n...>', 'a float argument', types.float)
    cli.parse(args);
    expect(cli.float).to.eql([pi, golden]);
    done();
  });
  it('should error on invalid float in array', function(done) {
    var cli = require('../../..')(pkg);
    cli.configure({exit:false});
    var args = ['-f', '' + pi, '--float=' + golden, '--float', 'zyx'];
    cli
      .once('error', function(e) {
        //expect(cli).to.eql(this);
        //expect(code).to.eql(codes.ETYPE);
        //parameters.unshift(message);
        //console.error.apply(null, parameters);
        done();
      })
      .option('-f, --float <n...>', 'a float argument', types.float)
    cli.parse(args);
  });
})
