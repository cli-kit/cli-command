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

<p align="center">
  <img src="https://raw.github.com/freeformsystems/cli-command/master/img/version.png" />
</p>

Source: [version/defaults][version/defaults] and [version/custom][version/custom]
