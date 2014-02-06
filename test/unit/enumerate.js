var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(path.join(__dirname, '..', '..', 'package.json'));

describe('cli-command:', function() {
  it('should not enumerate builtin properties and methods', function(done) {
    var cli = require('../..')(pkg);
    var args = ['-s', 'option value'];
    cli
      .option('-v --verbose', 'a flag option')
      .option('-s --string <str>', 'an option that expects a value')
      .option('-d --default [str]',
        'an option that has a default value', 'default value')
      .parse(args);
    expect(Object.keys(cli).length).to.eql(3);
    var enumerated = [];
    for(var z in cli) {
      enumerated.push(z);
    }
    expect(enumerated.length).to.eql(3);
    done();
  });
})
