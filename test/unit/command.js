var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(path.join(__dirname, '..', '..', 'package.json'));
var cli = require('../..')(pkg);

describe('cli-command:', function() {
  it('should define program structure', function(done) {
    cli
      .flag('-v --verbose', 'print more information')
      .flag('-h --help', 'print help')
      .flag('-V --version', 'print program version')
      .command('ls', 'list files')
      .command('rm', 'remove files')
      .command('add', 'create a file')
      .option('-f --file', 'files to modify')
      .parse();
    //console.dir(cli);
    done();
  });
})
