$0
==

## Description

Demonstrates chaining commands using subcommands declared in a markdown definition file.

## Commands

* `conf`: Command to operate on a configuration.

### Configuration

#### Commands

* `ls`: List configuration items.
* `get`: Get a configuration item.
* `set`: Set a configuration item.

## Examples

Print all configuration data:

```
$0 ${cmd_conf_long} ls
```

Print the value of `foo`:

```
$0 ${cmd_conf_long} get foo
```

Overwrite the value of `foo`:

```
$0 ${cmd_conf_long} set foo baz
```

Add the value of `baz`:

```
$0 ${cmd_conf_long} set baz fubar
```
