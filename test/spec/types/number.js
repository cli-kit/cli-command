var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(path.join(__dirname, '..', '..', '..', 'package.json'));
var types = require('../../..').types;

describe('cli-command:', function() {
  var pi = 3.14159265359;
  var golden = 1.61803398875;
  var integer = 128;

  it('should coerce multiple values to array of numbers', function(done) {
    var cli = require('../../..')(pkg);
    cli.configure({exit:false});
    var args = ['-n', '' + pi, '--number=' + golden, '--number', '' + integer];
    cli
      .option('-n, --number <n...>', 'a number argument', types.number)
    cli.parse(args);
    expect(cli.number).to.eql([pi, golden, integer]);
    done();
  });
  it('should error on invalid number in array', function(done) {
    var cli = require('../../..')(pkg);
    cli.configure({exit:false});
    var args = ['-n', '' + pi, '--number=' + golden, '--number', 'zyx'];
    cli
      .once('error', function(e) {
        expect(cli).to.eql(this);
        //expect(code).to.eql(codes.ETYPE);
        //parameters.unshift(message);
        //console.error.apply(null, parameters);
        done();
      })
      .option('-n, --number <n...>', 'a number argument', types.number)
    cli.parse(args);
  });
})
