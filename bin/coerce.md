coerce
======

## Description

An ***example*** program to illustrate option validation and coercion.

## Synopsis

```
[options] <file ...>
```

## Commands

* `print`: Print some messages using the log middleware

## Options

* `-i, --integer <n>`: an integer argument
* `-f, --float <n>`: a float argument
* `-r, --range <a>..<b>`: a range
* `-l, --list <items>`: a list
* `-o, --optional [value]`: an *optional* value

## Examples

Generate an error on missing required option.

```
coerce
```

Pass all required options with valid values.

```
coerce -i 10 -f 3.14 --range 1..10 -o=10 --list=apples,oranges file.txt
```

## Copyright

Copyright (C) 2014 Freeform Systems, Ltd.
This is free software; see the source for copying conditions. There is NO warranty; not even for MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
