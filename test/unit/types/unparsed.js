var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(
  path.join(__dirname, '..', '..', '..', 'package.json'));
var types = require('../../..').types;

describe('cli-command:', function() {
  it('should coerce unparsed arguments (parseInt)', function(done) {
    var cli = require('../../..')(pkg);
    var args = ['1', '2', '3'];
    cli
      .converter(parseInt)
      .parse(args);
    expect(cli.request().args).to.eql([1,2,3]);
    done();
  });
  it('should coerce unparsed arguments (Array)', function(done) {
    var cli = require('../../..')(pkg);
    var args = ['1', '2', '3'];
    cli
      .converter(Array)
      .parse(args);
    expect(cli.request().args).to.eql([['1'],['2'],['3']]);
    done();
  });
  it('should coerce unparsed arguments (Boolean)', function(done) {
    var cli = require('../../..')(pkg);
    var args = ['true', 'False', '1', '0'];
    cli
      .converter(Boolean)
      .parse(args);
    expect(cli.request().args).to.eql([true, false, true, false]);
    done();
  });
  it('should coerce unparsed arguments (Date)', function(done) {
    var d = '2014-02-01';
    var dt = new Date(d);
    var cli = require('../../..')(pkg);
    var args = [d];
    cli
      .converter(Date)
      .parse(args);
    expect(cli.request().args).to.eql([dt]);
    done();
  });
  it('should coerce unparsed arguments (enum)', function(done) {
    var list = ['css', 'scss', 'less'];
    var cli = require('../../..')(pkg);
    var args = ['css', 'scss'];
    cli
      .converter(types.enum(list))
      .parse(args);
    expect(cli.request().args).to.eql(['css', 'scss']);
    done();
  });
  it('should coerce unparsed arguments (float)', function(done) {
    var golden = 1.61803398875;
    var cli = require('../../..')(pkg);
    var args = ['' + golden];
    cli
      .converter(types.float)
      .parse(args);
    expect(cli.request().args).to.eql([golden]);
    done();
  });
  it('should coerce unparsed arguments (integer)', function(done) {
    var integer = 128;
    var cli = require('../../..')(pkg);
    var args = ['' + integer];
    cli
      .converter(types.float)
      .parse(args);
    expect(cli.request().args).to.eql([integer]);
    done();
  });
  it('should coerce unparsed arguments (JSON)', function(done) {
    var cli = require('../../..')(pkg);
    var value =
      {string: 'value', number: 128, boolean: true, obj: {}, arr: [1,2,3]};
    var stringified = JSON.stringify(value);
    var args = [stringified];
    cli
      .converter(JSON)
      .parse(args);
    expect(cli.request().args).to.eql([value]);
    done();
  });
})
