var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(path.join(__dirname, '..', '..', '..', 'package.json'));
var cli = require('../../..')(pkg);
cli.configuration({exit:false});
var types = require('../../..').types;

describe('cli-command:', function() {
  it('should coerce single value to integer', function(done) {
    var args = ['-i', '10'];
    cli
      .option('-i, --integer <n>', 'an integer argument', types.integer)
    cli.parse(args);
    expect(cli.integer).to.eql(10);
    done();
  });
  it('should coerce multiple values to array of integers', function(done) {
    var args = ['-i', '10', '--integer=20'];
    cli
      .option('-i, --integer <n...>', 'an integer argument', types.integer)
    cli.parse(args);
    expect(cli.integer).to.eql([10, 20]);
    done();
  });
  it('should error on invalid integer', function(done) {
    var args = ['-i', 'xyz'];
    cli
      .once('error', function(e) {
        //expect(cli).to.eql(this);
        //expect(code).to.eql(codes.ETYPE);
        //parameters.unshift(message);
        //console.error.apply(null, parameters);
        done();
      })
      .option('-i, --integer <n>', 'an integer argument', types.integer)
    cli.parse(args);
  });
  it('should error on invalid integer in array', function(done) {
    var args = ['-i', '10', '--integer', 'zyx'];
    cli
      .once('error', function(e) {
        //expect(cli).to.eql(this);
        //expect(code).to.eql(codes.ETYPE);
        //parameters.unshift(message);
        //console.error.apply(null, parameters);
        done();
      })
      .option('-i, --integer <n...>', 'an integer argument', types.integer)
    cli.parse(args);
  });
})
