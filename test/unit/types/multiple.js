var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(path.join(__dirname, '..', '..', '..', 'package.json'));
var types = require('../../..').types;

describe('cli-command:', function() {
  it('should return a string [Number, Date, String]', function(done) {
    var cli = require('../../..')(pkg);
    cli.configure({exit:false});
    var value = 'value';
    var args = ['-s', value];
    cli
      .option('-s, --string <s>', 'a string argument', [Number,Date,String])
    cli.parse(args);
    expect(cli.string).to.eql(value);
    done();
  });
  it('should return a string [String, Number, Date]', function(done) {
    var cli = require('../../..')(pkg);
    cli.configure({exit:false});
    var value = 'value';
    var args = ['-s', value];
    cli
      .option('-s, --string <s>', 'a string argument', [String, Number, Date])
    cli.parse(args);
    expect(cli.string).to.eql(value);
    done();
  });
  it('should error on invalid type [Number, Date]', function(done) {
    var cli = require('../../..')(pkg);
    cli.configure({exit:false});
    var value = 'value';
    var args = ['-s', value];
    cli
      .once('error', function(e) {
        expect(cli).to.eql(this);
        //expect(code).to.eql(codes.ETYPE);
        //parameters.unshift(message);
        //console.error.apply(null, parameters);
        done();
      })
      .option('-s, --string <s>', 'a string argument', [Number,Date])
    cli.parse(args);
  });
})
