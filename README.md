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

### Commands

Source: [command](https://github.com/freeformsystems/cli-command/tree/master/bin/example/command)

```javascript
var path = require('path');
require('ttycolor')().defaults();
// use existing meta data (package.json)
var cli = require('../..')(
  path.join(__dirname, '..', 'package.json'));
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

### Subcommands

If you wish to structure your program as a series of executables for each command ([git][git] style) use the alternative syntax:

Source: [pkg](https://github.com/freeformsystems/cli-command/tree/master/bin/example/pkg)

```javascript
require('ttycolor')().defaults();
var cli = require('../..')();
cli
  .version()
  .help()
  .on('empty', function(help, version) {
    help.call(this, true);
    console.error(this.name + ': command required');
  })
  .command('install', 'install packages')
  .parse();   // execute pkg-install(1) upon install command
```

Source: [pkg-install](https://github.com/freeformsystems/cli-command/tree/master/bin/example/pkg-install)

```javascript
require('ttycolor')().defaults();
var cli = require('../..')();
cli
  .usage('[options] <packages...>')
  .version()
  .help()
  .on('run', function() {
    console.log('install %s', this.args);
  })
  .on('empty', function(help, version) {
    help.call(this, true);  // invoke help on zero arguments
    console.error(this.name + ': no packages specified');
  })
  .parse();
```

## API

The [define][define] module is thoroughly documented so you should check that out to learn more about defining program options, if you want to dig under the hood a little also read the [argparse][argparse] documentation.

### Methods

## Conflicts

By default the module will set parsed options as properties of the program. This makes for very convenient access to option values, it is just `this.option` (or `program.option` if the scope is not the program).

However, there may be times when an argument key conflicts with an internal property or method. To prevent this you can either rename the option or set the configuration property `stash` to a string naming an object that will contain the option values, for example:

```javascript
var cli = require('..');
cli.configuration({stash: 'data'});
// ...
cli.parse();
// now access the option values via cli.data
```

If a `stash` has not been configured and your program declares an option that would cause a conflict, the program will scream at you, literally [scream][scream].

<p align="center">
  <img src="https://raw.github.com/freeformsystems/cli-command/master/img/conflict.png" />
</p>

The [conflict][conflict] test executable illustrates this behaviour.

## License

Everything is [MIT](http://en.wikipedia.org/wiki/MIT_License). Read the [license](/LICENSE) if you feel inclined.

[toolkit]: https://github.com/freeformsystems/cli-toolkit
[argparse]: https://github.com/freeformsystems/cli-argparse
[define]: https://github.com/freeformsystems/cli-define
[git]: http://git-scm.com

[scream]: https://github.com/freeformsystems/cli-command/blob/master/lib/conflict.js#L11
[conflict]: https://github.com/freeformsystems/cli-command/blob/master/bin/conflict

[error/defaults]: https://github.com/freeformsystems/cli-command/blob/master/bin/error/defaults
[error/custom]: https://github.com/freeformsystems/cli-command/blob/master/bin/error/custom
