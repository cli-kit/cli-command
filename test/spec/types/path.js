var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(path.join(__dirname, '..', '..', '..', 'package.json'));
var types = require('../../..').types;
var fs = require('cli-fs');

describe('cli-command:', function() {
  var cwd = process.cwd();
  var home = fs.home();
  it('should resolve multiple values to array of paths', function(done) {
    var cli = require('../../..')(pkg);
    var file = 'file.txt';
    var rel = './' + file;
    var abs = '/' + file;
    var user = '~/' + file;
    var relative = path.join(cwd, file);
    var args = ['-p', file, '--path=' + rel, '--path', abs, '-p=' + user];
    cli
      .option('-p, --path <path...>', 'a path argument', types.path)
      .parse(args);
    expect(cli.path).to.eql([relative, relative, abs, path.join(home, file)]);
    done();
  });
})
