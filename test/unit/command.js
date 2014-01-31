var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(path.join(__dirname, '..', '..', 'package.json'));
var cli = require('../..')(pkg);

describe('cli-command:', function() {
  it('should execute command function', function(done) {
    var args = ['ls', '-v', '-f=file.txt'];
    cli
      .option('-v --verbose', 'print more information')
      .option('-f --file [file]', 'files to modify')
      .command('ls')
        .description('list files')
        .action(function(cmd, args) {
          console.dir(args);
          expect(cmd.name).to.equal('ls');
          expect(cli.verbose).to.eql(true);
          expect(cli.file).to.eql('file.txt');
          done();
        })
    cli.parse(args);
  });
})
