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

## Configuration

Invoke the `configure()` method with an object to override the default configuration.

```javascript
var stash = {};
cli.configure({stash: stash})
```

* `bin`: A specific directory to use when executing commands as external programs, defaults to the same directory as the parent executable.
* `exit`: Whether the default error handler will exit the process when an error occurs, default is `true`.
* `stash`: An object to receive parsed options as properties.
* `trace`: A boolean that forces the default error handler to always print stack traces, default is `false`.
* `middleware`: An object containing booleans that allows subtractive configuration of the default middleware.

## Help

```javascript
var cli = require('cli-command');
cli
  .help()
  // ...
  .parse();
```

The `help` method adds a flag to the program which by default is mapped to `-h | --help`. The default help output is sufficient for many programs however you can pass a callback to `help` if you wish to customize the help output.

```javascript
var cli = require('cli-command');
var help = cli.help;
cli()
  .help(function() {
    // only print usage information
    help.usage.call(this);
  })
  .parse();
```

You may re-use some of the default help functions as properties of the main help function (be sure to always invoke with the correct scope, ie, `help.usage.call(this)`):

* `head`: Print the help header.
* `usage`: Print program usage.
* `commands`: Print program commands.
* `options`: Print program options.
* `foot`: Print the help footer.

### help([name], [description], [action])

```javascript
cli.help()
cli.help('--help', 'print help', function(){})
cli.help(function(){})
```

Adds a help flag to the program, scope for the `action` callback is the program instance.

* `name`: A specific name for the help flag, default is `-h | --help`.
* `description`: A specific description for the option, overrides the default.
* `action`: A callback to invoke when the help option is encountered.

Returns the program for chaining.

See the [help/defaults][help/defaults] and [help/custom][help/custom] example executables.

<p align="center">
  <img src="https://raw.github.com/freeformsystems/cli-command/master/img/help-defaults.png" />
</p>

Source: [help/defaults][help/defaults]

## Version

```javascript
var cli = require('cli-command');
cli
  .version()
  // ...
  .parse();
```

The `version` method adds a flag to the program which by default is mapped to `-V | --version`. If you wish to customize the version output pass a function to the `help` method, this can be useful if you want to include version information for external programs you depend upon or just to include more useful information.

```javascript
var cli = require('cli-command');
var version = cli.version;
cli()
  .version(function() {
    // invoke the default version action
    // and pass true so it does not exit the process
    version.call(this, true);
    // add additional version information here
    process.exit(0);
  })
  .parse();
```

### version([version], [name], [description], [action])

```javascript
cli.version()
cli.version('1.0.0')
cli.version('1.0.0', '--version', 'print version', function(){})
cli.version(function(){})
```

Adds a version flag to the program, scope for the `action` callback is the program instance. Configured version number is available via after setting the flag option by invoking with zero arguments.

* `version`: A specific version for the program, overrides any version extracted from `package.json`.
* `name`: A specific name for the version option flags, default is `-V | --version`.
* `description`: A specific description for the option, overrides the default.
* `action`: A callback to invoke when the version option is encountered.

Returns the program for chaining or the version string if a version flag exists and zero arguments are passed.

See the [version/defaults][version/defaults] and [version/custom][version/custom] example executables.

<p align="center">
  <img src="https://raw.github.com/freeformsystems/cli-command/master/img/version.png" />
</p>

Source: [version/defaults][version/defaults] and [version/custom][version/custom]

# Types

A flexible, extensible and intuitive type system allows coercion between the argument string values and javascript types.

Essentially the type coercion system is just a function that gets passed the string value of the argument, which allows simple coercion with `parseInt` etc.

```javascript
var cli = require('cli-command')();
function range(val) {
  return val.split('..').map(Number);
}
function list(val) {
  return val.split(',');
}
cli
  .option('-i, --integer <n>', 'an integer argument', parseInt)
  .option('-f, --float <n>', 'a float argument', parseFloat)
  .option('-r, --range <a>..<b>', 'a range', range)
  .option('-l, --list <items>', 'a list', list)
// ...
```
Source: [test/unit/coerce](https://github.com/freeformsystems/cli-command/blob/master/test/unit/coerce.js)

The coercion function (referred to as a `converter`) may be more complex, the signature is:

```javascript
function(value, arg, index)
```

Where `value` is the argument string value, `arg` is the option definition and `index` is the position in an array (only for options that are repeatable). Functions are executed in the scope of the program so you can access all it's properties (`this.name()` is very useful).

Native functions are good if you are willing to accept `NaN` as a possible value; for those cases where you must have a valid number you should use one of the pre-defined type coercion functions that will throw an error if the value is `NaN`. The type error will then be emitted as an `error` event (`ETYPE`). If there is no listener for `error` and `etype` a useful error message is printed and the program will exit, otherwise you are free to handle the error as you like.

Source [test/unit/types](https://github.com/freeformsystems/cli-command/tree/master/test/unit/types)

```javascript
var cli = require('cli-command');
var types = cli.types;
var program = cli()
  .option('-f, --float <n>', 'a float argument', types.float);
// ...
```

### Type List

* `array`: Argument value must be coerced to an `array`, useful if you wish to ensure that a non-repeatable option becomes an array, for repeatable options it will always be an `array`. This method does not throw an error.
* `boolean`: Coerce the value to a `boolean`. Accepts the string values `true` and `false` (case insensitive) and converts integers using the javascript notion of truthy, otherwise any positive length string is treated as `true`. The method does not throw an error.
* `date`: Parse the value as a `Date` and throw an error if the value could not be parsed.
* `float`: Parse the value as a floating point number and throw an error if the result is `NaN`.
* `integer`: Parse the value as an integer and throw an error if the result is `NaN`.
* `json`: Parse the value as a `JSON` string and throw an error if the value is malformed.
* `number`: Parse the value as a `number` and throw an error if the result is `NaN`.
* `path`: Parse the value as a file system path, relative paths are resolved relative to the current working directory and tilde expansion is performed to resolve paths relative to the user's home directory. This method does not throw an error.
* `string`: Strictly speaking a noop, however it is declared if you wish to allow multiple types for an argument and fallback to `string`. This method does not throw an error.
* `url`: Parse the value to an object containing `URL` information, this method will throw an error if no `host` could be determined from the value.

### Type Map

As a convenience common native types are mapped from the constructor to the coercion function:

```javascript
{
  Array: types.array,
  Boolean: types.boolean,
  Date: types.date,
  JSON: types.json,
  Number: types.number,
  String: types.string
}
```

Such that you can map types with:

```javascript
cli.option('-n, --number <n>', 'a number argument', Number)
```

The `JSON` type is an exception as it is not a constructor, however, it is supported as a shortcut for `types.json`.

### Multiple Types

It is also possible to declare an option as being one of a list of types by specifying an array of functions:

```javascript
cli.option('-d, --date <d>', 'a date or string', [Date, String])
```

When an array is used coercion will be attempted for each listed type function, the first to succeed will become the option's value, if all type coercions fail then an `ETYPE` error event is emitted.

### Custom Types

Declare a function to create your own custom type:

```javascript
var ArgumentTypeError = require('cli-command').error.type;
function mime(value, arg, index) {
  // validate the value is a recognized mime type
  // and return it if valid
  throw new ArgumentTypeError('invalid mime type for %s, got %s',
    arg.toString(null), value);
}
// ...
cli.option('-m, --mime-type <mime>', 'a mime type', mime)
// ...
```

If you throw `Error` rather than `ArgumentTypeError` that is fine, it will be wrapped in an `ArgumentTypeError`. You can utilize `ArgumentTypeError` for it's message parameter support.

### Complex Types

Complex types differ in that the type function must be invoked when declaring the option and it *returns a closure* that is the `converter`.

#### Enum

Validates that a value exists in a list of acceptable values.

```javascript
types.enum(Array)
```

```javascript
var list = ['css', 'scss', 'less'];
cli.option('-c, --css <value>',
    'css preprocessor', types.enum(list))
```

#### File

It is useful to be able to test options that are files to be of a particular type. You may use the file type with a series of file test expressions:

```javascript
types.file(String, [Boolean])
```

By default files are resolved according to the rules for the `path` type, you may specify the second argument as `false` to disable this behaviour.

To test that an option's value is a regular file and exists use:

```javascript
cli.option('-f, --file <file>',
    'file to process', types.file('f'))
```

See the [fs][fs] documentation for the list of file expressions and some caveats. Note that multiple expressions can be specified, so to test a file is readable and has it's executable bit set you could use `rx`.

#### List

Splits a value into an array based on a `string` or `regexp` delimiter.

```javascript
types.list(String|RegExp)
```

```javascript
cli.option('-l, --list <list>',
    'a comma-delimited list argument', types.list(/\s*,\s*/))
```

#### Object

Coalesces related options into an object. Note that the [conflicts](#conflicts) logic applies to object property names when the `stash` configuration property is not set.

```javascript
types.object(String)
```

```javascript
cli
  .option('-s, --scheme <scheme>',
    'transport scheme', types.object('server'))
  .option('-h, --host <host>',
    'server hostname', types.object('server'))
  .option('-p, --port <n>',
    'server port', types.object('server'))
```

### Unparsed Types

It is possible to coerce or validate the unparsed options by specifying a `converter` on the program:

```javascript
var cli = require('cli-command');
var types = cli.types;
var program = cli()
  .converter(types.integer)
  .parse(); 
```

Note that because the unparsed arguments list is always an arrray specifying the `Array` type will result in a multi-dimensional array of strings.

## Commands

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
    console.log('files: %j', this.file);
  });
cli.parse();  // defaults to process.argv.slice(2)
```

Source: [command](https://github.com/freeformsystems/cli-command/tree/master/bin/example/command)

## Subcommands

If you wish to structure your program as a series of executables for each command ([git][git] style) use the alternative syntax:

```javascript
require('ttycolor')().defaults();
var cli = require('../..')();
cli
  .version()
  .help()
  .on('empty', function(help, version) {
    help.call(this, true);
    console.error(this.name() + ': command required');
  })
  .command('install', 'install packages')
var ps = cli.parse();   // execute pkg-install(1) upon install command
```

Source: [pkg](https://github.com/freeformsystems/cli-command/tree/master/bin/example/pkg)

```javascript
require('ttycolor')().defaults();
var cli = require('../..')();
cli
  .usage('[options] <packages...>')
  .version()
  .help()
  .on('run', function() {
    console.log('install %s', this.request().args);
  })
  .on('empty', function(help, version) {
    help.call(this, true);  // invoke help on zero arguments
    console.error(this.name() + ': no packages specified');
  })
  .parse();
```

Source: [pkg-install](https://github.com/freeformsystems/cli-command/tree/master/bin/example/pkg-install)

## Errors

Handling errors in any program is important but doing it elegantly in a command line program can be tricky, so the [error] module has been integrated to make error handling consistent and robust.

The pre-defined error conditions are in [en.json][en.json]. The [error][error] module intentionally starts incrementing exit status codes from `128` so as not to conflict with low exit status codes, for example, `node` uses exit code `8` to indicate an uncaught exception. The command module uses exit codes from `64-127` and you are encouraged to start your exit codes from `128`.

Error conditions encountered by the module are treated in an idiomatic manner, they are dispatched as an `error` event from the program. However, you may just want some default error handling, so if you have not registered an `eror` listener on the program by the time `parse()` is called then the default error handling will be used.

The default error handling prints useful messages to `stderr` with information about the error except for an uncaught exception which will also print the stack trace.

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

Source: [error/custom](https://github.com/freeformsystems/cli-command/tree/master/bin/error/custom)

If you are only interested in a particular error you can listen for the error event by error definition `key` (note the event name is lowercase). When you listen for a particular error the generic `error` event is not dispatched for that error condition.

```javascript
var path = require('path');
require('ttycolor')().defaults();
var pkg = path.normalize(
  path.join(__dirname, '..', '..', 'package.json'));
var cli = require('../..')(pkg, 'error/event');
cli
  .on('etype', function(e) {
    console.error(this.name() + ': %s', 'etype listener fired');
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

Source: [error/event](https://github.com/freeformsystems/cli-command/tree/master/bin/error/event)

## API

The [define][define] module is thoroughly documented so you should check that out to learn more about defining program options, if you want to dig under the hood a little also read the [argparse][argparse] documentation.

### Methods

## Conflicts

By default the module will set parsed options as properties of the program. This makes for very convenient access to option values, it is just `this.option` (or `program.option` if the scope is not the program).

However, there may be times when an argument key conflicts with an internal property or method. To prevent this you can either rename the option or set the configuration property `stash` to an object that will contain the option values, for example:

```javascript
var cli = require('..');
var stash = {};
cli.configure({stash: stash});
// ...
cli.parse();
```

If a `stash` has not been configured and your program declares an option that would cause a conflict, the program will scream at you, literally [scream][scream].

<p align="center">
  <img src="https://raw.github.com/freeformsystems/cli-command/master/img/conflict.png" />
</p>

Source: [conflict][conflict]

## Enumerate

The program class has been designed such that enumeration will only show properties that derived from the argument parsing. This provides a convenient way to iterate over the argument keys and values for options that were specified on the command line.

The only drawback to this design is that the `console.dir()` method no longer allows inspection of properties and methods.

At times you may wish to inspect the internal structure of the program using `console.dir()`, to enable this functionality set the `CLI_TOOLKIT_DEBUG` environment variable *before all require() statements*. This forces all properties and methods to be enumerable and `console.dir()` will work as expected.

See the [enumerate/defaults][enumerate/defaults] and [enumerate/debug][enumerate/debug] examples.

## Reserved Keywords

`__middleware__`, `_action`, `_arguments`, `_author`, `_commands`, `_conf`, `_converter`, `_description`, `_emitter`, `_events`, `_exec`, `_id`, `_key`, `_maxListeners`, `_middleware`, `_name`, `_names`, `_package`, `_request`, `_usage`, `_version`, `action`, `addListener`, `args`, `arguments`, `command`, `commands`, `configure`, `converter`, `description`, `domain`, `emit`, `env`, `error`, `errors`, `flag`, `getReceiver`, `help`, `id`, `key`, `listeners`, `name`, `names`, `on`, `once`, `option`, `package`, `parse`, `raise`, `removeAllListeners`, `removeListener`, `request`, `setMaxListeners`, `toString`, `usage`, `use`, `version`, `wrap`

## Credits

Chainable program definition inspired by [commander][commander], type conversion on native type constructors lifted from [nopt][nopt] and middleware design thanks to [express][express].

## License

Everything is [MIT](http://en.wikipedia.org/wiki/MIT_License). Read the [license](/LICENSE) if you feel inclined.

[toolkit]: https://github.com/freeformsystems/cli-toolkit
[argparse]: https://github.com/freeformsystems/cli-argparse
[fs]: https://github.com/freeformsystems/cli-fs
[define]: https://github.com/freeformsystems/cli-define
[error]: https://github.com/freeformsystems/cli-error
[git]: http://git-scm.com

[help/defaults]: https://github.com/freeformsystems/cli-command/blob/master/bin/help/defaults
[help/custom]: https://github.com/freeformsystems/cli-command/blob/master/bin/help/custom

[enumerate/defaults]: https://github.com/freeformsystems/cli-command/blob/master/bin/enumerate/defaults
[enumerate/debug]: https://github.com/freeformsystems/cli-command/blob/master/bin/enumerate/debug

[version/defaults]: https://github.com/freeformsystems/cli-command/blob/master/bin/version/defaults
[version/custom]: https://github.com/freeformsystems/cli-command/blob/master/bin/version/custom

[en.json]: https://github.com/freeformsystems/cli-command/blob/master/lib/error/locales/en.json

[scream]: https://github.com/freeformsystems/cli-command/blob/master/lib/conflict.js#L11
[conflict]: https://github.com/freeformsystems/cli-command/blob/master/bin/conflict

[error/defaults]: https://github.com/freeformsystems/cli-command/blob/master/bin/error/defaults
[error/custom]: https://github.com/freeformsystems/cli-command/blob/master/bin/error/custom

[commander]: https://github.com/visionmedia/commander.js
[nopt]: https://github.com/npm/nopt
[express]: http://expressjs.com/
