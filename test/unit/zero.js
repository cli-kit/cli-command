var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(path.join(__dirname, '..', '..', 'package.json'));

describe('cli-command:', function() {
  it('should execute program action on zero arguments', function(done) {
    var cli = require('../..')(pkg, 'zero');
    cli.configuration({exit: false});
    var args = [];
    cli
      .once('empty', function(help, version) {
        expect(cli).to.eql(this);
        expect(help).to.be.a('function');
        expect(version).to.be.a('function');
        done();
      })
    cli.parse(args);
  });

  it('should execute empty listener on zero arguments', function(done) {
    var cli = require('../..')(pkg, 'zero');
    cli.configuration({exit: false});
    var args = [];
    function helpHandler(req, next){
      //expect(help).to.be.a('function');
      //help.call(this, true);
    }
    function versionHandler(req, next){
      //expect(version).to.be.a('function');
      //version.call(this, true);
    }
    cli
      .help(helpHandler)
      .version(versionHandler)
      .once('empty', function(help, version) {
        expect(cli).to.eql(this);
        expect(help).to.be.a('function');
        version.call(this);
        help.call(this);
        done();
      })
    cli.parse(args);
  });
})
