var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(path.join(__dirname, '..', '..', 'package.json'));
describe('cli-command:', function() {
  it('should set positive flag', function(done) {
    var cli = require('../..')(pkg);
    var args = ['--color'];
    cli
      .option('--color', 'use ansi colors')
      .option('--no-color', 'do not use ansi colors')
      .parse(args);
    expect(cli.color).to.eql(true);
    done();
  });
  it('should override positive flag', function(done) {
    var cli = require('../..')(pkg);
    var args = ['--color', '--no-color'];
    cli
      .option('--color', 'use ansi colors')
      .option('--no-color', 'do not use ansi colors')
      .parse(args);
    expect(cli.color).to.eql(false);
    done();
  });
  it('should override positive override', function(done) {
    var cli = require('../..')(pkg);
    var args = ['--color', '--no-color', '--color'];
    cli
      .option('--color', 'use ansi colors')
      .option('--no-color', 'do not use ansi colors')
      .parse(args);
    expect(cli.color).to.eql(true);
    done();
  });
  it('should set positive flag (expansion)', function(done) {
    var cli = require('../..')(pkg);
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
    var cli = require('../..')(pkg);
    var args = ['-xvcC'];
    cli
      .option('-x', 'extract archive')
      .option('-v', 'verbose')
      .option('-c --color', 'use ansi colors')
      .option('-C --no-color', 'do not use ansi colors')
      .on('complete', function(req) {
        //console.log(JSON.stringify(req, undefined, 2));
        expect(this.color).to.eql(false);
      })
      .parse(args);
    done();
  });
  it('should override positive override (expansion)', function(done) {
    var cli = require('../..')(pkg);
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
  it('should use --[no]-pedantic (--pedantic: true)', function(done) {
    var cli = require('../..')(pkg);
    var args = ['--pedantic'];
    cli
      .option('--[no]-pedantic', 'be pedantic or not')
      .on('complete', function(req) {
        //console.log(JSON.stringify(req, undefined, 2));
        expect(this.pedantic).to.eql(true);
      })
      .parse(args);
    done();
  });
  it('should use --[no]-pedantic (--no-pedantic: false)', function(done) {
    var cli = require('../..')(pkg);
    var args = ['--no-pedantic'];
    cli
      .option('--[no]-pedantic', 'be pedantic or not')
      .on('complete', function(req) {
        //console.log(JSON.stringify(req, undefined, 2));
        expect(this.pedantic).to.eql(false);
      })
      .parse(args);
    done();
  });
})
