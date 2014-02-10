var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(path.join(__dirname, '..', '..', 'package.json'));

function range(val) {
  return val.split('..').map(Number);
}

function list(val) {
  return val.split(',');
}

describe('cli-command:', function() {
  it('should coerce argument values', function(done) {
    var cli = require('../..')(pkg);
    var args = ['assert', '-i', '10', '-f', '3.14',
      '--range', '1..10', '--list=apples,oranges', 'file.txt', '-v=value'];
    cli
      .usage('[options] <file ...>')
      .option('-i, --integer <n>', 'an integer argument', parseInt)
      .option('-f, --float <n>', 'a float argument', parseFloat)
      .option('-r, --range <a>..<b>', 'a range', range)
      .option('-l, --list <items>', 'a list', list)
      .option('-v, --value [value]', 'an optional value')
      .command('assert')
        .description('assert on arguments')
        .action(function(cmd, args) {
          expect(cli.integer).to.eql(10);
          expect(cli.float).to.eql(3.14);
          expect(cli.range).to.eql([1,10]);
          expect(cli.list).to.eql(['apples','oranges']);
          expect(cli.request().args).to.eql(['file.txt']);
          expect(cli.value).to.eql('value');
          done();
        })
    //console.dir(cli);
    cli.parse(args);
  });
})
