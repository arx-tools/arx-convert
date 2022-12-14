# arx-convert

Converts Arx Fatalis level data to JSON or YAML and vice versa.

**IMPORTANT: Arx Fatalis files are partially compressed. See "compression" section for more info**

## Installation

`npm i arx-convert -g`

This will give you access to the following commands, both do the same:

- `arx-convert`

### Recommended requirements

nodejs 18+ (because the lib uses prefix-only core modules)

It might work with older versions of nodejs, but I haven't tested it there.

## Command-line API

`arx-convert <inputfile> --from=<format> --to=<format> --output=<outputfile> --prettify`

the inputfile and --output parameters can be omitted and then the code can be used in pipelines

`cat <inputfile> | arx-convert --from=<format> --to=<format> > <outputfile>`

the format parameter can be one of the following arx formats: `dlf`, `llf`, `fts`

work in progress formats: `ftl` and `tea`

and it can also a data format for the other side: `json` and `yaml`(can also be spelled as `yml`)

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

The built js files come with sourcemaps, which you can use by running your nodejs file with the
[--enable-source-maps](https://nodejs.org/api/cli.html#--enable-source-maps) flag

### Javascript example

```js
const fs = require('node:fs')
const path = require('node:path')
const { FTS } = require('arx-convert')

;(async () => {
  // reads an unpacked fts file into a buffer
  const binary = await fs.promises.readFile(path.resolve(__dirname, './fast.fts.unpacked'))

  // converts the buffer into a json using the FTS converter
  const json = FTS.load(binary)

  // save as a minified json
  await fs.promises.writeFile(path.resolve(__dirname, './fast.fts.min.json'), JSON.stringify(json), 'utf-8')

  // save as a formatted json
  await fs.promises.writeFile(path.resolve(__dirname, './fast.fts.json'), JSON.stringify(json, null, 2), 'utf-8')
})()
```

### Typescript example

```ts
import fs from 'node:fs'
import path from 'node:path'
import { DLF } from 'arx-convert'
import { ArxDLF } from 'arx-convert/dist/dlf/DLF'
// types are currently scattered around the project,
// but a good IDE, like vscode will find the types you're looking for with no issue
;(async () => {
  // reads an unpacked dlf file into a buffer
  const binary = await fs.promises.readFile(path.resolve(__dirname, './level1.dlf.unpacked'))

  // converts the buffer into a json using the DLF converter
  // optionally you can assign a type to the variable
  const json: ArxDLF = DLF.load(binary)

  // save as a minified json
  await fs.promises.writeFile(path.resolve(__dirname, './level1.dlf.min.json'), JSON.stringify(json), 'utf-8')

  // save as a formatted json
  await fs.promises.writeFile(path.resolve(__dirname, './level1.dlf.json'), JSON.stringify(json, null, 2), 'utf-8')
})()
```

## Compression

Arx Fatalis files are partially compressed with Stormlib Pkware and you need a separate
tool for unpacking/repacking: [node-pkware](https://www.npmjs.com/package/node-pkware)

Also, Arx Fatalis file headers are not constant in size, but there is a tool
that can give you the exact offset you need to pipe into node-pkware: [arx-header-size](https://www.npmjs.com/package/arx-header-size)

Install these tools by running

```sh
npm i node-pkware arx-header-size -g
```

### Example for unpacking

```sh
arx-header-size level3.dlf --format=dlf # this will print out 8520
explode level3.dlf --offset=8520 --output=level3.dlf.unpacked
arx-convert level3.dlf.unpacked --from=dlf --to=yaml --output=level3.dlf.yml
```

### Example for repacking

```sh
arx-convert level3.dlf.yml --from=yaml --to=dlf --output=level3.dlf.repacked
implode level3.dlf.repacked --offset=8520 --binary --large --output=level3.dlf
```
