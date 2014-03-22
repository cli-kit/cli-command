## Configuration

Invoke the `configure()` method with an object to override the default configuration.

```javascript
var stash = {};
cli.configure({stash: stash})
```

* `bin`: A specific directory to use when executing commands as external programs, defaults to the same directory as the parent executable.
* `exit`: Whether the default error handler will exit the process when an error occurs, default is `true`.
* `help`: An object containing properties that control the default help output, see [help](#help).
* `middleware`: An object containing booleans that allows subtractive configuration of the default middleware.
* `stash`: An object to receive parsed options as properties, default is the program instance.
* `strict`: Do not allow any unparsed options, default `false`.
* `trace`: A boolean that forces the default error handler to always print stack traces, default is `false`.
* `unknown`: Whether unknown option error handling is enabled, default `true`.

