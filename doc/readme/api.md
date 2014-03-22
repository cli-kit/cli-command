## API

The [define][define] module is thoroughly documented so you should check that out to learn more about defining program options, if you want to dig under the hood a little also read the [argparse][argparse] documentation.

### Program

#### Methods

##### help([name], [description], [action])

```javascript
cli.help()
cli.help('--info', 'print help information', function(){})
cli.help(function(){})
```

Adds a help flag to the program, scope for the `action` callback is the program instance.

* `name`: A specific name for the help flag, default is `--help`.
* `description`: A specific description for the option, overrides the default.
* `action`: A callback to invoke when the help option is encountered.

Returns the program for chaining.

##### version([version], [name], [description], [action])

```javascript
cli.version()
cli.version('1.0.0')
cli.version('1.0.0', '--version', 'print version', function(){})
cli.version(function(){})
```

Adds a version flag to the program, scope for the `action` callback is the program instance. Configured version number is available via after setting the flag option by invoking with zero arguments.

* `version`: A specific version for the program, overrides any version extracted from `package.json`.
* `name`: A specific name for the version option flags, default is `--version`.
* `description`: A specific description for the option, overrides the default.
* `action`: A callback to invoke when the version option is encountered.

Returns the program for chaining or the version string if a version flag exists and zero arguments are passed.

