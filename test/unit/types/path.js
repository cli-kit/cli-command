var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(path.join(__dirname, '..', '..', '..', 'package.json'));
var cli = require('../../..')(pkg);
var types = require('../../..').types;
var utils = require('cli-util');

describe('cli-command:', function() {
  var cwd = process.cwd();
  var home = utils.home();
  it('should resolve relative path', function(done) {
    var file = 'file.txt';
    var args = ['-p', file];
    cli
      .option('-p, --path <path>', 'a path argument', types.path)
      .parse(args);
    expect(cli.path).to.eql(path.join(cwd, file));
    done();
  });
  it('should resolve relative path (./)', function(done) {
    var file = 'file.txt';
    var args = ['-p', './' + file];
    cli
      .option('-p, --path <path>', 'a path argument', types.path)
      .parse(args);
    expect(cli.path).to.eql(path.join(cwd, file));
    done();
  });
  it('should respect absolute path', function(done) {
    var file = '/file.txt';
    var args = ['-p', file];
    cli
      .option('-p, --path <path>', 'a path argument', types.path)
      .parse(args);
    expect(cli.path).to.eql(file);
    done();
  });
  it('should resolve multiple values to array of paths', function(done) {
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
