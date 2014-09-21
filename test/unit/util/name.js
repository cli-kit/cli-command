var name = require('../../../lib/util/name'),
  expect = require('chai').expect;

describe('name', function () {
  it('should be a function', function (done) {
    expect(name).to.be.a('function');
    done();
  });

  it('should return null on a non-function parameter', function (done) {
    expect(name('foo')).to.be.null;
    done();
  });

  it('should return null for an anonymous function', function (done) {
    expect(name(function() {})).to.be.null;
    done();
  });

  it('should return the name of a named function', function (done) {
    expect(name(function foo() {})).to.equal('foo');
    done();
  });
});
