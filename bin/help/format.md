format
======

## Description

An ***example*** program to illustrate the ability to change the help output format.

By default this program will use *markdown* as the help output format, however
you can change this with the `--format` option.

## Commands

* `format, fmt`: Print the available formats

## Options

* `-f, --format [format]`: Set the help output format.

## Examples

Set the help output format to the default:

```
format -f gnu
```

Use the minimal synopsis format:

```
format -f synopsis
```
