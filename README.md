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

## Errors

Handling errors in any program is important but doing it elegantly in a command lin program can be tricky, so the [error] module has been integrated to make error handling consistent and robust.

The pre-defined error conditions are in [en.json][en.json]. The [error][error] module intentionally starts incorementing exit status codes from `128` so as not to conflict with low exit status codes, for example, `node` uses exit code `8` to indicate an uncaught exception. The command module uses exit codes from `64-127` and you are encouraged to start your exit codes from `128`.

Error conditions encountered by the module are treated in an idiomatic manner, they are dispatched as an `error` event from the program. However, you may just want some default error handling, so if you have not registered an `eror` listener on the program by the time `parse()` is called then the default error handling will be used.

Source: [error/custom](https://github.com/freeformsystems/cli-command/tree/master/bin/error/custom)

```javascript
var path = require('path');
require('ttycolor')().defaults();
var pkg = path.normalize(
  path.join(__dirname, '..', '..', 'package.json'));
var cli = require('../..')(pkg, 'error/custom');
cli
  .on('error', function(e) {
    // map of error definitions is `this.errors`
    if(e.code == this.errors.EUNCAUGHT.code) {
      e.error(false); // omit stack trace
      e.exit();       // use error definition exit code
    }
    // pass other errors through to the default handler
    this.error(e);
  })
  .option('-n, --number [n]', 'a numeric value', Number)
  .version()
  .help()
  .parse();
throw new Error('a custom error message');
```

If you are only interested in a particular error you can listen for the error event by error definition `key` (note the event name is lowercase). When you listen for a particular error the generic `error` event is not dispatched for that error condition.

Source: [error/event](https://github.com/freeformsystems/cli-command/tree/master/bin/error/event)

```
var path = require('path');
require('ttycolor')().defaults();
var pkg = path.normalize(
  path.join(__dirname, '..', '..', 'package.json'));
var cli = require('../..')(pkg, 'error/event');
cli
  .on('etype', function(e) {
    console.error(this.name + ': %s', 'etype listener fired');
    // NOTE: if we did not invoke the default handler
    // NOTE: which exits the process on error by default
    // NOTE: then the default uncaught exception handling
    // NOTE: would also be triggered
    this.error(e);
  })
  .option('-n, --number [n]', 'a numeric value', Number)
  .version()
  .help()
  .parse();
throw new Error('an euncaught listener error message');
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
[error]: https://github.com/freeformsystems/cli-error
[git]: http://git-scm.com

[en.json]: https://github.com/freeformsystems/cli-command/blob/master/lib/error/locales/en.json

[scream]: https://github.com/freeformsystems/cli-command/blob/master/lib/conflict.js#L11
[conflict]: https://github.com/freeformsystems/cli-command/blob/master/bin/conflict

[error/defaults]: https://github.com/freeformsystems/cli-command/blob/master/bin/error/defaults
[error/custom]: https://github.com/freeformsystems/cli-command/blob/master/bin/error/custom
