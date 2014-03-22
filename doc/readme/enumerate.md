## Enumerate

The program class has been designed such that enumeration will only show properties that derived from the argument parsing. This provides a convenient way to iterate over the argument keys and values for options that were specified on the command line.

The only drawback to this design is that the `console.dir()` method no longer allows inspection of properties and methods.

At times you may wish to inspect the internal structure of the program using `console.dir()`, to enable this functionality set the `CLI_TOOLKIT_DEBUG` environment variable *before all require() statements*. This forces all properties and methods to be enumerable and `console.dir()` will work as expected.

See the [enumerate/defaults][enumerate/defaults] and [enumerate/debug][enumerate/debug] examples.
