var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(
  path.join(__dirname, '..', '..', 'package.json'));
var ttycolor = require('ttycolor');

describe('cli-command:', function() {
  it('should use color middleware', function(done) {
    var cli = require('../..');
    var args = ['--color=never'];
    cli(pkg, 'mock-color')
      .use(cli.middleware.color)
      .configure({exit: false})
      .parse(args);
    ttycolor.revert();
    done();
  });
  it('should add enum validation', function(done) {
    var cli = require('../..');
    var args = ['--color'];
    cli(pkg, 'mock-color')
      .use(cli.middleware.color, {validate: true, defaults: false})
      .configure({exit: false})
      .parse(args);
    done();
  });
  it('should use color middleware (defaults: false)', function(done) {
    var cli = require('../..');
    var args = ['--color=never'];
    cli(pkg, 'mock-color')
      .use(cli.middleware.color, {defaults: false})
      .configure({exit: false})
      .parse(args);
    done();
  });
  it('should configure color middleware with custom option', function(done) {
    var cli = require('../..');
    var args = ['--color=never'];
    cli(pkg, 'mock-color')
      .use(cli.middleware.color, {defaults: false, option: {always: '-c'}})
      .configure({exit: false})
      .parse(args);
    done();
  });
  it('should configure color middleware with empty styles', function(done) {
    var cli = require('../..');
    var args = ['--color=never'];
    cli(pkg, 'mock-color')
      .use(cli.middleware.color, {styles: {}})
      .configure({exit: false})
      .parse(args);
    done();
  });
})
