var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(path.join(__dirname, '..', '..', 'package.json'));
var cli = require('../..')(pkg);

describe('cli-command:', function() {
  it('should define program structure', function(done) {
    var args = ['-v', 'add', '-f=file.txt', '-V'];
    cli
      .version()
      .help()
      .flag('-v --verbose', 'print more information')
      .command('ls', 'list files')
      .command('rm', 'remove files')
      .command('add', 'create a file')
      .option('-f --file', 'files to modify')
      .parse(args);
    expect(cli.verbose).to.eql(true);
    expect(cli.file).to.eql('file.txt');
    done();
  });
})
