var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(path.join(__dirname, '..', '..', 'package.json'));
var cli = require('../..')(pkg, 'zero');
var Program = require('cli-define').Program;

describe('cli-command:', function() {
  it('should execute program action on zero arguments', function(done) {
    var args = [];
    cli
      .action(function(program, help, version) {
        expect(cli).to.eql(this).to.eql(program);
        expect(program).to.be.an.instanceof(Program);
        expect(help).to.be.a('function');
        expect(version).to.be.a('function');
        done();
      })
    cli.parse(args);
  });

  it('should execute program action on zero arguments', function(done) {
    var args = [];
    function helpHandler(help){
      expect(help).to.be.a('function');
      help.call(this);
    }
    function versionHandler(version){
      expect(version).to.be.a('function');
      version.call(this, true);
    }
    cli
      .help(helpHandler)
      .version(versionHandler)
      .action(function(program, help, version) {
        expect(cli).to.eql(this).to.eql(program);
        expect(program).to.be.an.instanceof(Program);
        expect(help).to.be.a('function');
        version.call(this);
        help.call(this);
        done();
      })
    cli.parse(args);
  });
})
