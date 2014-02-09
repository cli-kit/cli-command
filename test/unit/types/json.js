var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(path.join(__dirname, '..', '..', '..', 'package.json'));
var types = require('../../..').types;

describe('cli-command:', function() {
  it('should be a parsed object (json)', function(done) {
    var cli = require('../../..')(pkg);
    cli.configure({exit:false});
    var value =
      {string: 'value', number: 128, boolean: true, obj: {}, arr: [1,2,3]};
    var stringified = JSON.stringify(value);
    var args = ['-j', stringified];
    cli
      .option('-j, --json <j>', 'a json argument', types.json)
    cli.parse(args);
    expect(cli.json).to.eql(value);
    done();
  });
  it('should error on malformed json', function(done) {
    var cli = require('../../..')(pkg);
    cli.configure({exit:false});
    var args = ['-j="escaped \" quote and malformed escape \<"'];
    cli
      .once('error',function(e) {
        //expect(cli).to.eql(this);
        //expect(code).to.eql(codes.ETYPE);
        //parameters.unshift(message);
        //console.error.apply(null, parameters);
        done();
      })
    cli
      .option('-j, --json <j>', 'a json argument', types.json)
    cli.parse(args);
  });
})
