## Types

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
Source: [test/spec/coerce](https://github.com/freeformsystems/cli-command/blob/master/test/spec/coerce.js)

The coercion function (referred to as a `converter`) may be more complex, the signature is:

```javascript
function(value, arg, index)
```

Where `value` is the argument string value, `arg` is the option definition and `index` is the position in an array (only for options that are repeatable). Functions are executed in the scope of the program so you can access all it's properties (`this.name()` is very useful).

Native functions are good if you are willing to accept `NaN` as a possible value; for those cases where you must have a valid number you should use one of the pre-defined type coercion functions that will throw an error if the value is `NaN`. The type error will then be emitted as an `error` event (`ETYPE`). If there is no listener for `error` and `etype` a useful error message is printed and the program will exit, otherwise you are free to handle the error as you like.

Source [test/spec/types](https://github.com/freeformsystems/cli-command/tree/master/test/spec/types)

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

Note that because the unparsed arguments list is always an array specifying the `Array` type will result in a multi-dimensional array of strings.
