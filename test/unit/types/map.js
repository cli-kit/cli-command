var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(path.join(__dirname, '..', '..', '..', 'package.json'));

describe('cli-command:', function() {
  it('should be a string (String)', function(done) {
    var cli = require('../../..')(pkg);
    var value = 'value';
    var args = ['-s', value];
    cli
      .option('-s, --string <s>', 'a string argument', String)
    cli.parse(args);
    expect(cli.string).to.eql(value);
    done();
  });
  it('should be a boolean (Boolean)', function(done) {
    var cli = require('../../..')(pkg);
    var value = '0';
    var args = ['-b', value];
    cli
      .option('-b, --boolean <b>', 'a boolean argument', Boolean)
    cli.parse(args);
    expect(cli.boolean).to.eql(false);
    done();
  });
  it('should be a number (Number)', function(done) {
    var cli = require('../../..')(pkg);
    var value = '128';
    var args = ['-n', value];
    cli
      .option('-n, --number <n>', 'a number argument', Number)
    cli.parse(args);
    expect(cli.number).to.eql(128);
    done();
  });
  it('should be a date (Date)', function(done) {
    var cli = require('../../..')(pkg);
    var d = '2014-02-01';
    var dt = new Date(d);
    var args = ['-d', d];
    cli
      .option('-d, --date <d>', 'a date argument', Date)
    cli.parse(args);
    expect(cli.date).to.eql(dt);
    done();
  });
  it('should be an array (Array)', function(done) {
    var cli = require('../../..')(pkg);
    var value = 'value';
    var args = ['-a', value];
    cli
      .option('-a, --array <a>', 'an array argument', Array)
    cli.parse(args);
    expect(cli.array).to.eql([value]);
    done();
  });
  it('should be a string (JSON)', function(done) {
    var cli = require('../../..')(pkg);
    var value = '"value"';
    var args = ['-j', value];
    cli
      .option('-j, --json <j>', 'a json argument', JSON)
    cli.parse(args);
    expect(cli.json).to.eql('value');
    done();
  });
})
