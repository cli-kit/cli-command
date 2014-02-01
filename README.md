# Command

Command execution for command line interfaces, a component of the [toolkit][toolkit].

This module is a binding of the [define][define] and [argparse][argparse] modules to provide option parsing and command execution for more complex programs. If your requirements are not very complex you may prefer to use [argparse][argparse] by itself.

## Install

```
npm install cli-command
```

## Test

```
npm test
```

## Examples

Example programs are in the [bin](https://github.com/freeformsystems/cli-command/tree/master/bin) directory, there are also a ton of examples in the [test](https://github.com/freeformsystems/cli-command/tree/master/test) directory.

## API

The [define][define] module is thoroughly documented so you should check that out to learn more about defining program options, if you want to dig under the hood a little also read the [argparse][argparse] documentation.

### Commands ([command](https://github.com/freeformsystems/cli-command/tree/master/bin/example/command))

```javascript
var path = require('path');
var cli = require('..')(
  path.join(__dirname, '..', 'package.json'));  // use existing meta data (package.json)
cli
  .option('-f --file <file...>', 'files to copy')
  .option('-v --verbose', 'print more information')
  .version()
  .help();
cli.command('cp')
  .description('copy files')
  .action(function(cmd, options, raw) {
    // execute copy logic here, scope is the program instance (cli)
    console.dir(this.file);
  });
cli.parse();  // defaults to process.argv.slice(2)
```

### Subcommands ([pkg](https://github.com/freeformsystems/cli-command/tree/master/bin/example/pkg) + [pkg-install](https://github.com/freeformsystems/cli-command/tree/master/bin/example/pkg-install))

If you wish to structure your program as a series of executables for each command ([git][git] style) use the alternative syntax:

```javascript
var path = require('path');
var cli = require('..')();
cli
  .version()
  .help()
  .command('install', 'install packages')
  .parse();   // execute pkg-install(1) upon install command
```

```javascript
var path = require('path');
var cli = require('..')();
cli
  .usage('[options] <packages...>')
  .version()
  .help()
  .run(function() {
    console.log('install %s', this.args);
  })
  .action(function(cmd, help, version) {
    help.call(this);  // invoke help on zero arguments
  })
  .parse();
```

## License

Everything is [MIT](http://en.wikipedia.org/wiki/MIT_License). Read the [license](/LICENSE) if you feel inclined.

[toolkit]: https://github.com/freeformsystems/cli-toolkit
[argparse]: https://github.com/freeformsystems/cli-argparse
[define]: https://github.com/freeformsystems/cli-define
[git]: http://git-scm.com
