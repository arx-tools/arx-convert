# Arx Fatalis converter

Converts various Arx Fatalis formats (DLF, FTS, LLF, AMB and FTL) to JSON/YAML and back

**IMPORTANT: Arx Fatalis files are partially compressed. See "compression" section for more info**

## Installation

`npm i arx-convert -g`

This will give you access to the following commands, both do the same:

- `arx-convert`

### Recommended requirements

node.js 18.0+ (because the lib uses prefix-only core modules)

It might work with older versions of node.js, but I haven't tested it there.

## Command-line API

`arx-convert <inputfile> --from=<format> --to=<format> --output=<outputfile> [--format] [--pretty] [--prettify]`

the inputfile and --output parameters can be omitted and then the code can be used in pipelines

`cat <inputfile> | arx-convert --from=<format> --to=<format> > <outputfile>`

the `<format>` parameter can be one of the following arx formats: `dlf`, `llf`, `fts`, `amb` or `ftl`

work in progress formats: `tea`

and it can also a data format for the other side: `json` and `yaml`(can also be spelled as `yml`)

prettifying the json output can be done by using any of the 3 parameters: `--format`, `--pretty` or `--prettify`

### Examples

```sh
# prints out version
--version
-v

# converts an unpacked fts file to a json through piping
cat fast.fts.unpacked | arx-convert --from=fts --to=json --prettify > fast.fts.json

# converts an unpacked dlf file to a minified json through files
arx-convert level8.dlf.unpacked --from=dlf --to=json --output=level8.dlf.min.json

# converts a json to an unpacked dlf
cat level8.dlf.min.json | arx-convert --from=json --to=dlf > level8.dlf.repacked

# converts json to an unpacked fts
arx-convert fast.fts.json --from=json --to=fts --output=fast.fts.repacked

# converts an unpacked dlf to yaml
cat level8.dlf.unpacked | arx-convert --to=yaml --from=dlf > level8.dlf.yml

# converts yaml to an unpacked dlf
cat level8.dlf.yml | arx-convert --from=yaml --to=dlf > level8.dlf.repacked
```

## Javascript/Typescript API

The package is published as a commonjs lib and the files can be found in the `dist` folder, but only if you
install it via npm. If you downloaded the source files from github, then you need to transpile the typescript
files yourself using the `npm run build` command.

The built js files come with sourcemaps, which you can use by running your node.js file with the
[--enable-source-maps](https://nodejs.org/api/cli.html#--enable-source-maps) flag

### Javascript example

```js
const fs = require('node:fs/promises')
const path = require('node:path')
const { FTS } = require('arx-convert')

;(async () => {
  // reads an unpacked fts file into a buffer
  const binary = await fs.readFile(path.resolve(__dirname, './fast.fts.unpacked'))

  // converts the buffer into a json using the FTS converter
  const json = FTS.load(binary)

  // save as a minified json
  await fs.writeFile(path.resolve(__dirname, './fast.fts.min.json'), JSON.stringify(json), 'utf8')

  // save as a formatted json
  await fs.writeFile(path.resolve(__dirname, './fast.fts.json'), JSON.stringify(json, null, '\t'), 'utf8')
})()
```

### Typescript example

```ts
import fs from 'node:fs/promises'
import path from 'node:path'
import { DLF } from 'arx-convert'
import type { ArxDLF } from 'arx-convert/types'

;(async () => {
  // reads an unpacked dlf file into a buffer
  const binary = await fs.readFile(path.resolve(__dirname, './level1.dlf.unpacked'))

  // converts the buffer into a json using the DLF converter
  // optionally you can assign a type to the variable
  const json: ArxDLF = DLF.load(binary)

  // save as a minified json
  await fs.writeFile(path.resolve(__dirname, './level1.dlf.min.json'), JSON.stringify(json), 'utf8')

  // save as a formatted json
  await fs.writeFile(path.resolve(__dirname, './level1.dlf.json'), JSON.stringify(json, null, '\t'), 'utf8')
})()
```

## Compression

Some Arx Fatalis files are partially compressed with Stormlib Pkware and you need a separate
tool for unpacking/repacking: [node-pkware](https://www.npmjs.com/package/node-pkware)

Also, Arx Fatalis file headers are not constant in size, but there is a tool
that can give you the exact offset you need to pipe into node-pkware: [arx-header-size](https://www.npmjs.com/package/arx-header-size)

Install these tools by running

```sh
npm i node-pkware arx-header-size -g
```

### Example for unpacking a compressed file

```sh
arx-header-size level3.dlf --format=dlf # this will print out 8520
explode level3.dlf --offset=8520 --output=level3.dlf.unpacked
arx-convert level3.dlf.unpacked --from=dlf --to=yaml --output=level3.dlf.yml
```

### Example for repacking a file that needs compression

```sh
arx-convert level3.dlf.yml --from=yaml --to=dlf --output=level3.dlf.repacked
implode level3.dlf.repacked --offset=8520 --binary --large --output=level3.dlf
```

### General scripts with detection to whether the input needs decompression or not

#### unpack.sh

```sh
#!/bin/bash

#
# usage: unpack.sh goblin_lord.ftl
#        unpack.sh ../goblin_lord/goblin_lord.ftl json
#

# try reading the 1st argument from the command line
if [ $# -lt 1 ]; then
  echo "missing filename, expected format: $0 <filename>"
  exit 1
fi

# read the 1st argument
INPUT=$1

# get the extension of the input file's name and make it lowercase
INPUT_FORMAT=$( \
  echo $INPUT \
  | tr '[:upper:]' '[:lower:]' \
  | tr '.' '\n' \
  | tail -1 \
)

# if a 2nd argument exists, then read it, otherwise set yaml as the output format
if [ $# -lt 2 ]; then
  OUTPUT_FORMAT=yml
else
  OUTPUT_FORMAT=$2
fi

# get the offset in bytes, might also get back "not compressed"
OFFSET=$(arx-header-size $INPUT --format=$INPUT_FORMAT)

if [[ $OFFSET == "not compressed" ]]; then
  arx-convert $INPUT --from=$INPUT_FORMAT --to=$OUTPUT_FORMAT --pretty --output="$INPUT.$OUTPUT_FORMAT"
else
  explode $INPUT --offset=$OFFSET | arx-convert --from=$INPUT_FORMAT --to=$OUTPUT_FORMAT --pretty --output="$INPUT.$OUTPUT_FORMAT"
fi
```

#### repack.sh

```sh
#!/bin/bash

#
# usage: repack.sh level3.dlf.json
#        repack.sh ../level3/level3.dlf.json
#

# try reading the 1st argument from the command line
if [ $# -lt 1 ]; then
  echo "missing filename, expected format: $0 <filename>"
  exit 1
fi

# read the 1st argument
INPUT=$1

# something.ftl.json -> json
INPUT_FORMAT=$( \
  echo $INPUT \
  | tr '[:upper:]' '[:lower:]' \
  | tr '.' '\n' \
  | tail -1 \
)

# something.ftl.json -> ftl
OUTPUT_FORMAT=$( \
  echo $INPUT \
  | tr '[:upper:]' '[:lower:]' \
  | tr '.' '\n' \
  | tail -2 \
  | head -1 \
)

arx-convert $INPUT --from=$INPUT_FORMAT --to=$OUTPUT_FORMAT --pretty --output="$INPUT.$OUTPUT_FORMAT.tmp"

# get the offset in bytes, might also get back "not compressed"
OFFSET=$(arx-header-size $INPUT --format=$OUTPUT_FORMAT)

if [[ $OFFSET == "not compressed" ]]; then
  mv "$INPUT.$OUTPUT_FORMAT.tmp" "$INPUT.$OUTPUT_FORMAT"
else
  implode "$INPUT.$OUTPUT_FORMAT.tmp" --offset=$OFFSET --binary --large --output="$INPUT.$OUTPUT_FORMAT"
  rm "$INPUT.$OUTPUT_FORMAT.tmp"
fi
```

### Uncompressed FTS files in Arx Libertatis 1.3

`FTS.save()` now takes a 2nd parameter to control whether the given fts data should be marked as compressed
or uncompressed

- `FTS.save(ftsData, true)` -> fts files get compressed (true can be omitted as it is the **default** value)
- `FTS.save(ftsData, false)` -> marks the fts file as uncompressed, no pkware compression is required afterwards
