var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(path.join(__dirname, '..', '..', 'package.json'));
var cli = require('../..')(pkg);

describe('cli-command:', function() {
  cli._arguments = {};
  it('should set positive flag', function(done) {
    var args = ['--color'];
    cli
      .option('--color', 'use ansi colors')
      .option('--no-color', 'do not use ansi colors')
      .parse(args);
    expect(cli.color).to.eql(true);
    done();
  });
  it('should override positive flag', function(done) {
    var args = ['--color', '--no-color'];
    cli
      .option('--color', 'use ansi colors')
      .option('--no-color', 'do not use ansi colors')
      .parse(args);
    expect(cli.color).to.eql(false);
    done();
  });
  it('should override positive override', function(done) {
    var args = ['--color', '--no-color', '--color'];
    cli
      .option('--color', 'use ansi colors')
      .option('--no-color', 'do not use ansi colors')
      .parse(args);
    expect(cli.color).to.eql(true);
    done();
  });
  it('should set positive flag (expansion)', function(done) {
    var args = ['-xvc'];
    cli
      .option('-x', 'extract archive')
      .option('-v', 'verbose')
      .option('-c, --color', 'use ansi colors')
      .option('-C --no-color', 'do not use ansi colors')
      .parse(args);
    expect(cli.color).to.eql(true);
    done();
  });
  it('should override positive flag (expansion)', function(done) {
    var args = ['-xvcC'];
    cli
      .option('-x', 'extract archive')
      .option('-v', 'verbose')
      .option('-c --color', 'use ansi colors')
      .option('-C --no-color', 'do not use ansi colors')
      .parse(args);
    expect(cli.color).to.eql(false);
    done();
  });
  it('should override positive override (expansion)', function(done) {
    var args = ['-xcCcv'];
    cli
      .option('-x', 'extract archive')
      .option('-v', 'verbose')
      .option('-c, --color', 'use ansi colors')
      .option('-C --no-color', 'do not use ansi colors')
      .parse(args);
    expect(cli.color).to.eql(true);
    done();
  });
})
