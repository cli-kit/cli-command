var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(
  path.join(__dirname, '..', '..', '..', 'package.json'));
var cli = require('../../..')(pkg);
var types = require('../../..').types;

describe('cli-command:', function() {
  var d = '2014-02-01';
  var dt = new Date(d);
  it('should coerce single value to date', function(done) {
    var args = ['-d', d];
    cli
      .option('-d, --date <d>', 'a date argument', types.date)
      .parse(args);
    expect(cli.date).to.eql(dt);
    done();
  });
  it('should coerce multiple values to array of dates', function(done) {
    var args = ['-d', d, '--date=' + d];
    cli
      .option('-d, --date <date...>', 'a date argument', types.date)
      .parse(args);
    expect(cli.date).to.eql([dt, dt]);
    done();
  });
  it('should error on invalid date', function(done) {
    var args = ['-d', 'xyz' + d];
    cli
      .once('error', function(e) {
        //expect(cli).to.eql(this);
        //expect(code).to.eql(codes.ETYPE);
        //parameters.unshift(message);
        //console.error.apply(null, parameters);
        done();
      })
      .option('-d, --date <date>', 'a date argument', types.date)
    cli.parse(args);
  });
  it('should error on invalid date in array', function(done) {
    var args = ['-d', d, '--date=' + d, '--date', d + 'zyx'];
    cli
      .once('error',function(e) {
        //expect(cli).to.eql(this);
        //expect(code).to.eql(codes.ETYPE);
        //parameters.unshift(message);
        //console.error.apply(null, parameters);
        done();
      })
      .option('-d, --date <date...>', 'a date argument', types.date)
    cli.parse(args);
  });
})
