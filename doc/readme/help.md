## Help

```javascript
var cli = require('cli-command');
cli
  .help()
  // ...
  .parse();
```

The `help` method adds a flag to the program which by default is mapped to `--help`.

### Help Configuration

The `help` configuration object supports the following properties:

* `align`: A string indicating the alignment style, possible values are `column|line|flex|wrap`, default is `column`.
* `assignment`: A string delimiter to use for options that accept values, default is `=`.
* `collapse`: A boolean indicating that whitespace should not be printed between sections, default is `false`.
* `copyright`: A string describing the program copyright, default is `undefined`.
* `delimiter`: A string delimiter to use between option names, default is `, `.
* `exit`: A boolean that forces inclusion of an `EXIT` section generated from the program error definitions, default is `false`.
* `indent`: An integer indicating the number of spaces to indent, default is `1`.
* `maximum`: An integer of the column used to wrap long descriptions, default is `80`.
* `messages`: An object containing strings for miscellaneous help messages.
* `pedantic`: A boolean indicating that description should be title case and terminated with a period, default is `true`.
* `sections`: An object containing booleans, strings or arrays that control which help sections are printed, default is `undefined`.
* `sort`: Whether commands and options are sorted, default is `false`, may be a boolean, a custom sort function or one of the recognized sort values, see [help sort](#help-sort).
* `style`: A string indicating the style of help output, default is `gnu`, see [help styles](#help-styles).
* `titles`: Map of custom section titles.
* `vanilla`: Never use parameter replacement when printing help output, default is `false`. This is useful if you are using the [ttycolor][ttycolor] module but would prefer commands and options not to be highlighted.
* `width`: The character width of the left column, default is `20`, only applies when `align` is set to `column`.

### Help Styles

* `gnu`: Prints the default `GNU` style help output.
* `json`: Prints the `JSON` document used to create help output.
* `synopsis`: A minimal style that just prints the synopsis (usage).

### Help Sections

Help output sections are named the same as `man` pages, the keys are:

```javascript
var sections = [
  'name',
  'description',
  'synopsis',
  'commands',
  'options',
  'environment',
  'files',
  'examples',
  'exit',
  'history',
  'author',
  'bugs',
  'copyright',
  'see'
];
```

Disable output for a section with `false`:

```javascript
cli.configure({help:{sections: {description: false}}});
```

Set a section to a string value to include the string literal:

```javascript
cli.configure({help:{sections: {examples: 'Some example section text'}}});
```

Or specify an array of objects with `name` and `description` properties:

```javascript
cli.configure({
  help:{
    sections: {
      examples: [
        {
          name: 'fu --bar',
          description: 'Example of using fu with --bar'
        }
      ]
    }
  }
});
```

### Help Sort

// TODO

### Help Environment

All help configuration properties (with the exception of complex objects such as `sections`, `messages`, `titles` etc.) may be configured using environment variables.

This enables you to quickly inspect help output under different configurations and allows users of your program to set a preference for how help output should be displayed. For example:

```shell
export cli_toolkit_help_align=line;
export cli_toolkit_help_maximum=120;
```

Use `unset` to clear set variables:

```shell
unset cli_toolkit_help_*;           // bash
unset -m 'cli_toolkit_help_*';      // zsh requires -m option and quotes
```

You may disable this behaviour when invoking the `help` middleware, for example:

```javascript
cli.help(null, null, null, false);
```

### Help Manual

Help output can be converted into the following formats by setting environment variables:

* Plain text help designed to be [help2man][help2man] compatible
* JSON text used as an intermediary format for other converters
* TODO: man page format
* TODO: markdown format
* TODO: markdown+pandoc format

#### Plain

The default `GNU` style help output is designed to be compatible with [help2man][help2man].

#### JSON

To print help as JSON set the `CLI_TOOLKIT_HELP_JSON` variable. By default the output is compact, however you can pretty print the JSON by setting `CLI_TOOLKIT_HELP_JSON_INDENT` to a valid integer.
