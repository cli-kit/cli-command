$0
==

## Description

Demonstrates chaining commands using a map of functions.

This is not the recommended way to handle subcommands but demonstrates that you may pass an object containing functions in a command action to invoke a subcommand function.

The downside to using this approach is that your subcommands are *not* included in the generated help output as the program does not know about the subcommands until execution time.

Subcommands may return an object of valid subcommands to invoke ad infinitum.

## Commands

* `config`: Command to operate on a configuration, expects a subcommand of `get`, `set` or `ls`.

## Examples

Print all configuration data:

```
$0 ${cmd_config_long} ls
```

Print the value of `foo`:

```
$0 ${cmd_config_long} get foo
```

Overwrite the value of `foo`:

```
$0 ${cmd_config_long} set foo baz
```

Add the value of `baz`:

```
$0 ${cmd_config_long} set baz fubar
```
