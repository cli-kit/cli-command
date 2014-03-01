$0
==

## Description

An ***example*** program to illustrate the ability to change the help output format.

By default this program will use *markdown* as the help output format, however
you can change this with the `${opt_format_long}` option.

The format `text` and style `gnu` are equivalent.

## Commands

* `fmt, format`: Print the available formats

## Options

* `-f, --format [format]`: Set the help output format, run the `${cmd_format_long}` command to see the list of available formats. If an unknown format is specified the default will be used.
* `-o, --output [file]`: Write the result to *file*.

## Examples

Set the help output format to the default `gnu` style:

```
$0 ${opt_format_short} gnu
```

Use the minimal `synopsis` format:

```
$0 ${opt_format_short} synopsis
```

Print the underlying `JSON` structure that is used to create help output:

```
$0 ${opt_format_short} json
```
