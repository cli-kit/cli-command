var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(
  path.join(__dirname, '..', '..', '..', 'package.json'));
var types = require('../../..').types;

var files = {
  regular: pkg,
  missing: 'this-file-really-does-not-want-to-be-found.txt'
}

describe('cli-command:', function() {
  it('should be a file type', function(done) {
    var cli = require('../../..')(pkg, 'mock-file-type');
    var value = files.regular;
    var args = ['-f', value];
    cli
      .option('-f, --file <file>', 'a file argument', types.file('f'))
    cli.parse(args);
    expect(cli.file).to.eql(value);
    done();
  });
  it('should throw argument type error (missing)', function(done) {
    var cli = require('../../..')(pkg, 'mock-file-type');
    var value = files.missing;
    var args = ['-f', value];
    cli
      .option('-f, --file <file>', 'a file argument', types.file('f'))
      .once('error', function(e) {
        expect(e.code).to.eql(this.errors.EFILE_TYPE_F.code);
        done();
      })
    cli.parse(args);
  });
})
