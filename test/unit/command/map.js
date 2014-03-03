var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(
  path.join(__dirname, '..', '..', '..', 'package.json'));
var file = path.join(
  __dirname, path.basename(__filename).replace(/\.js$/, '') + '.md')
var Command = require('cli-define').Command;

describe('cli-command:', function() {
  it('should map command definition to action module', function(done) {
    var dir = path.join(__dirname, 'map')
    var cli = require('../../..');
    var options = {};
    cli(pkg, 'mock-command-map')
      .configure({
        load: {file: file, options: options},
        command: {dir: dir}
      })
      .on('complete', function() {
        expect(this.commands().conf).to.be.instanceof(Command);
        expect(this.commands().conf.action()).to.be.a('function');
        var subcommands = this.commands().conf.commands();
        var keys = Object.keys(subcommands);
        expect(keys.length).to.eql(3);
        for(var i = 0;i < keys.length;i++) {
          expect(subcommands[keys[i]]).to.be.instanceof(Command);
        }
        done();
      })
      .parse(['conf']);
  });
  it('should map subcommand definition to action module', function(done) {
    var dir = path.join(__dirname, 'submap')
    var cli = require('../../..');
    var options = {};
    cli(pkg, 'mock-subcommand-map')
      .configure({
        load: {file: file, options: options},
        command: {dir: dir}
      })
      .on('complete', function() {
        expect(this.commands().conf).to.be.instanceof(Command);
        expect(this.commands().conf.action()).to.be.a('function');
        var subcommands = this.commands().conf.commands();
        var keys = Object.keys(subcommands);
        expect(keys.length).to.eql(3);
        for(var i = 0;i < keys.length;i++) {
          expect(subcommands[keys[i]]).to.be.instanceof(Command);
        }
        done();
      })
      .parse(['conf', 'ls']);
  });
})
