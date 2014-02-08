var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(
  path.join(__dirname, '..', '..', '..', 'package.json'));
var types = require('../../..').types;

var files = {
  file: __filename,
  dir: __dirname,
  missing: 'this-file-really-does-not-want-to-be-found.txt'
}

describe('cli-command:', function() {
  it('should throw error on unsupported expression', function(done) {
    var cli = require('../../..')(pkg, 'mock-file-type');
    function fn() {
      cli
        .option('-f, --file <file>', 'a file argument', types.file('Z'))
    }
    expect(fn).throws(Error);
    done();
  });
  it('should be a file type', function(done) {
    var cli = require('../../..')(pkg, 'mock-file-type');
    var value = files.file;
    var args = ['-f', value];
    cli
      .option('-f, --file <file>', 'a file argument', types.file('f'))
    cli.parse(args);
    expect(cli.file).to.eql(value);
    done();
  });
  it('should be a readable file', function(done) {
    var cli = require('../../..')(pkg, 'mock-file-type');
    var value = files.file;
    var args = ['-f', value];
    cli
      .option('-f, --file <file>', 'a file argument', types.file('rf'))
    cli.parse(args);
    expect(cli.file).to.eql(value);
    done();
  });
  it('should be a file type (repeatable)', function(done) {
    var cli = require('../../..')(pkg, 'mock-file-type');
    var value = files.file;
    var args = ['-f', value, '-f=' + value];
    cli
      .option('-f, --file <file...>', 'a file argument', types.file('f'))
    cli.parse(args);
    expect(cli.file).to.eql([value, value]);
    done();
  });
  it('should throw argument type error (-f)', function(done) {
    var cli = require('../../..')(pkg, 'mock-file-type');
    var value = files.missing;
    var args = ['-f', value];
    cli
      .option('-f, --file <file>', 'a file argument', types.file('f'))
      .once('error', function(e) {
        expect(e.code).to.eql(this.errors.EFILE_TYPE_F.code);
        function fn() {
          throw e;
        }
        expect(fn).throws(Error);
        expect(fn).throws(/not a file/);
        done();
      })
    cli.parse(args);
  });
  it('should throw argument type error (-d)', function(done) {
    var cli = require('../../..')(pkg, 'mock-file-type');
    var value = files.missing;
    var args = ['-f', value];
    cli
      .option('-f, --file <file>', 'a file argument', types.file('d'))
      .once('error', function(e) {
        expect(e.code).to.eql(this.errors.EFILE_TYPE_D.code);
        function fn() {
          throw e;
        }
        expect(fn).throws(Error);
        expect(fn).throws(/not a directory/);
        done();
      })
    cli.parse(args);
  });
  it('should throw argument type error (-e)', function(done) {
    var cli = require('../../..')(pkg, 'mock-file-type');
    var value = files.missing;
    var args = ['-f', value];
    cli
      .option('-f, --file <file>', 'a file argument', types.file('e'))
      .once('error', function(e) {
        expect(e.code).to.eql(this.errors.EFILE_TYPE_E.code);
        function fn() {
          throw e;
        }
        expect(fn).throws(Error);
        expect(fn).throws(/does not exist/);
        done();
      })
    cli.parse(args);
  });
  it('should throw argument type error (-x)', function(done) {
    var cli = require('../../..')(pkg, 'mock-file-type');
    var value = files.missing;
    var args = ['-f', value];
    cli
      .option('-f, --file <file>', 'a file argument', types.file('x'))
      .once('error', function(e) {
        expect(e.code).to.eql(this.errors.EFILE_TYPE_X.code);
        function fn() {
          throw e;
        }
        expect(fn).throws(Error);
        expect(fn).throws(/is not executable/);
        done();
      })
    cli.parse(args);
  });
  it('should throw argument type error (-r)', function(done) {
    var cli = require('../../..')(pkg, 'mock-file-type');
    var value = files.missing;
    var args = ['-f', value];
    cli
      .option('-f, --file <file>', 'a file argument', types.file('r'))
      .once('error', function(e) {
        expect(e.code).to.eql(this.errors.EFILE_TYPE_R.code);
        function fn() {
          throw e;
        }
        expect(fn).throws(Error);
        expect(fn).throws(/is not readable/);
        done();
      })
    cli.parse(args);
  });
  it('should throw argument type error (-w)', function(done) {
    var cli = require('../../..')(pkg, 'mock-file-type');
    var value = files.missing;
    var args = ['-f', value];
    cli
      .option('-f, --file <file>', 'a file argument', types.file('w'))
      .once('error', function(e) {
        expect(e.code).to.eql(this.errors.EFILE_TYPE_W.code);
        function fn() {
          throw e;
        }
        expect(fn).throws(Error);
        expect(fn).throws(/is not writable/);
        done();
      })
    cli.parse(args);
  });
  it('should throw argument type error (-L)', function(done) {
    var cli = require('../../..')(pkg, 'mock-file-type');
    var value = files.missing;
    var args = ['-f', value];
    cli
      .option('-f, --file <file>', 'a file argument', types.file('L'))
      .once('error', function(e) {
        expect(e.code).to.eql(this.errors.EFILE_TYPE_L.code);
        function fn() {
          throw e;
        }
        expect(fn).throws(Error);
        expect(fn).throws(/is not a symbolic link/);
        done();
      })
    cli.parse(args);
  });
  it('should throw argument type error (-S)', function(done) {
    var cli = require('../../..')(pkg, 'mock-file-type');
    var value = files.missing;
    var args = ['-f', value];
    cli
      .option('-f, --file <file>', 'a file argument', types.file('S'))
      .once('error', function(e) {
        expect(e.code).to.eql(this.errors.EFILE_TYPE_S.code);
        function fn() {
          throw e;
        }
        expect(fn).throws(Error);
        expect(fn).throws(/is not a socket/);
        done();
      })
    cli.parse(args);
  });
  it('should throw argument type error (-t)', function(done) {
    var cli = require('../../..')(pkg, 'mock-file-type');
    var value = files.missing;
    var args = ['-f', value];
    cli
      .option('-f, --file <file>', 'a file argument', types.file('t'))
      .once('error', function(e) {
        expect(e.code).to.eql(this.errors.EFILE_TYPE_T.code);
        function fn() {
          throw e;
        }
        expect(fn).throws(Error);
        expect(fn).throws(/is not a tty/);
        done();
      })
    cli.parse(args);
  });
  it('should throw argument type error (-b)', function(done) {
    var cli = require('../../..')(pkg, 'mock-file-type');
    var value = files.missing;
    var args = ['-f', value];
    cli
      .option('-f, --file <file>', 'a file argument', types.file('b'))
      .once('error', function(e) {
        expect(e.code).to.eql(this.errors.EFILE_TYPE_B.code);
        function fn() {
          throw e;
        }
        expect(fn).throws(Error);
        expect(fn).throws(/is not a block special file/);
        done();
      })
    cli.parse(args);
  });
  it('should throw argument type error (-c)', function(done) {
    var cli = require('../../..')(pkg, 'mock-file-type');
    var value = files.missing;
    var args = ['-f', value];
    cli
      .option('-f, --file <file>', 'a file argument', types.file('c'))
      .once('error', function(e) {
        expect(e.code).to.eql(this.errors.EFILE_TYPE_C.code);
        function fn() {
          throw e;
        }
        expect(fn).throws(Error);
        expect(fn).throws(/is not a character special file/);
        done();
      })
    cli.parse(args);
  });
  it('should throw argument type error (-p)', function(done) {
    var cli = require('../../..')(pkg, 'mock-file-type');
    var value = files.missing;
    var args = ['-f', value];
    cli
      .option('-f, --file <file>', 'a file argument', types.file('p'))
      .once('error', function(e) {
        expect(e.code).to.eql(this.errors.EFILE_TYPE_P.code);
        function fn() {
          throw e;
        }
        expect(fn).throws(Error);
        expect(fn).throws(/is not a named pipe/);
        done();
      })
    cli.parse(args);
  });
  it('should throw argument type error (-n)', function(done) {
    var cli = require('../../..')(pkg, 'mock-file-type');
    var args = ['-f='];
    cli
      .option('-f, --file [file]', 'a file argument', types.file('n'))
      .once('error', function(e) {
        expect(e.code).to.eql(this.errors.EFILE_TYPE_N.code);
        function fn() {
          throw e;
        }
        expect(fn).throws(Error);
        expect(fn).throws(/is the empty string/);
        done();
      })
    cli.parse(args);
  });
  it('should throw argument type error (-z)', function(done) {
    var cli = require('../../..')(pkg, 'mock-file-type');
    var value = files.missing;
    var args = ['-f', value];
    cli
      .option('-f, --file <file>', 'a file argument', types.file('z'))
      .once('error', function(e) {
        expect(e.code).to.eql(this.errors.EFILE_TYPE_Z.code);
        function fn() {
          throw e;
        }
        expect(fn).throws(Error);
        expect(fn).throws(/is not the empty string/);
        done();
      })
    cli.parse(args);
  });
  it('should throw argument type error (-s)', function(done) {
    var cli = require('../../..')(pkg, 'mock-file-type');
    var value = '/dev/null';
    var args = ['-f', value];
    cli
      .option('-f, --file <file>', 'a file argument', types.file('s'))
      .once('error', function(e) {
        expect(e.code).to.eql(this.errors.EFILE_TYPE_SIZE.code);
        function fn() {
          throw e;
        }
        expect(fn).throws(Error);
        expect(fn).throws(/is an empty file/);
        done();
      })
    cli.parse(args);
  });
})
