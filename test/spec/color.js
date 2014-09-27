var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(
  path.join(__dirname, '..', '..', 'package.json'));
var ttycolor = require('ttycolor');
var color = require('cli-mid-color');

describe('cli-command:', function() {
  it('should use color middleware', function(done) {
    var cli = require('../..');
    var args = ['--color=never'];
    cli(pkg, 'mock-color')
      .use(color)
      .configure({exit: false})
      .parse(args);
    ttycolor.revert();
    done();
  });
  it('should add enum validation', function(done) {
    var cli = require('../..');
    var args = ['--color'];
    cli(pkg, 'mock-color')
      .use(color, {validate: true, defaults: false})
      .configure({exit: false})
      .parse(args);
    done();
  });
  it('should use color middleware (defaults: false)', function(done) {
    var cli = require('../..');
    var args = ['--color=never'];
    cli(pkg, 'mock-color')
      .use(color, {defaults: false})
      .configure({exit: false})
      .parse(args);
    done();
  });
  it('should configure color middleware with custom option', function(done) {
    var cli = require('../..');
    var args = ['--color=never'];
    cli(pkg, 'mock-color')
      .use(color, {defaults: false, option: {always: '-c'}})
      .configure({exit: false})
      .parse(args);
    done();
  });
  it('should configure color middleware with empty styles', function(done) {
    var cli = require('../..');
    var args = ['--color=never'];
    cli(pkg, 'mock-color')
      .use(color, {styles: {}})
      .configure({exit: false})
      .parse(args);
    done();
  });
})
