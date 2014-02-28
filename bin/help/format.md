format
======

## Description

An ***example*** program to illustrate the ability to change the help output format.

By default this program will use *markdown* as the help output format, however
you can change this with the `--format` option.

The format `text` and style `gnu` are equivalent.

## Commands

* `format, fmt`: Print the available formats

## Options

* `-f, --format [format]`: Set the help output format, run the `format` command to see the list of available formats.

## Examples

Set the help output format to the default `gnu` style:

```
format -f gnu
```

Use the minimal `synopsis` format:

```
format -f synopsis
```
