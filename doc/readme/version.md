## Version

```javascript
var cli = require('cli-command');
cli
  .version()
  // ...
  .parse();
```

The `version` method adds a flag to the program which by default is mapped to `--version`. If you wish to customize the version output pass a function to the `help` method, this can be useful if you want to include version information for external programs you depend upon or just to include more useful information.

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
* `name`: A specific name for the version option flags, default is `--version`.
* `description`: A specific description for the option, overrides the default.
* `action`: A callback to invoke when the version option is encountered.

Returns the program for chaining or the version string if a version flag exists and zero arguments are passed.

See the [version/defaults][version/defaults] and [version/custom][version/custom] example executables.

<p align="center">
  <img src="https://raw.github.com/freeformsystems/cli-command/master/img/version.png" />
</p>

Source: [version/defaults][version/defaults] and [version/custom][version/custom]
