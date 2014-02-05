var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(path.join(__dirname, '..', '..', 'package.json'));

describe('cli-command:', function() {
  it('should execute command function', function(done) {
    var cli = require('../..')(pkg);
    var args = ['ls', '-v', '-f=file.txt'];
    cli
      .option('-v --verbose', 'print more information')
      .option('-f --file [file]', 'files to modify')
      .command('ls')
        .description('list files')
        .action(function(cmd, options, raw) {
          args.shift();
          expect(raw).to.eql(args);
          expect(cmd.name()).to.equal('ls');
          expect(cli.verbose).to.eql(true);
          expect(options.verbose).to.eql(true);
          expect(cli.file).to.eql('file.txt');
          expect(options.file).to.eql('file.txt');
          done();
        })
    cli.parse(args);
  });
  it('should execute command function by alias (space delimited)',
    function(done) {
      var cli = require('../..')(pkg);
      var args = ['i', 'package.tgz'];
      cli
        .command('install i')
          .description('install packages')
          .action(function(cmd, options, raw) {
            done();
          })
      cli.parse(args);
    }
  );
  it('should execute command function by alias (pipe delimited)',
    function(done) {
      var cli = require('../..')(pkg);
      var args = ['install', 'package.tgz'];
      cli
        .command('install|i')
          .description('install packages')
          .action(function(cmd, options, raw) {
            done();
          })
      cli.parse(args);
    }
  );
  it('should execute command function by alias (comma delimited)',
    function(done) {
      var cli = require('../..')(pkg);
      var args = ['ins', 'package.tgz'];
      cli
        .command('install, i, ins')
          .description('install packages')
          .action(function(cmd, options, raw) {
            done();
          })
      cli.parse(args);
    }
  );
})
