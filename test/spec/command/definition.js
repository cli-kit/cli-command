var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(
  path.join(__dirname, '..', '..', '..', 'package.json'));
var file = path.join(
  __dirname, path.basename(__filename).replace(/\.js$/, '') + '.md')
var Command = require('cli-define').Command;

describe('cli-command:', function() {
  it('should load command definition', function(done) {
    var cli = require('../../..');
    var options = {};
    cli(pkg, 'mock-command-definition')
      .configure({
        load: {file: file, options: options},
        //substitute: {enabled: true}
      })
      .on('load', function() {
        expect(this.commands().conf).to.be.instanceof(Command);
        var subcommands = this.commands().conf.commands();
        var keys = Object.keys(subcommands);
        expect(keys.length).to.eql(3);
        for(var i = 0;i < keys.length;i++) {
          expect(subcommands[keys[i]]).to.be.instanceof(Command);
        }
        done();
      })
      .parse([]);
  });
})
