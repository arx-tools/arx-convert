#!/usr/bin/env node --experimental-modules

import fs from 'fs'
import minimist from 'minimist'
import { fileExists, getPackageVersion, streamToBuffer } from './helpers.mjs'
import { omit, compose, dissocPath, evolve, assoc, map } from '../node_modules/ramda/src/index.mjs'
import { isZeroVertex } from '../src/common/helpers.mjs'
import { SUPPORTED_EXTENSIONS } from './constants.mjs'

const args = minimist(process.argv.slice(2), {
  string: ['output'],
  boolean: ['version', 'pretty']
});

(async () => {
  if (args.version) {
    console.log(await getPackageVersion())
    process.exit(0)
  }

  let filename1 = args._[0]
  let filename2 = args._[1]
  let filename3 = args._[2]
  let output = args.output

  let hasErrors = false

  let input1
  if (await fileExists(filename1)) {
    input1 = fs.createReadStream(filename1)
  } else {
    console.error('error: 1st input file does not exist')
    hasErrors = true
  }

  let input2
  if (await fileExists(filename2)) {
    input2 = fs.createReadStream(filename2)
  } else {
    console.error('error: 2nd input file does not exist')
    hasErrors = true
  }

  let input3
  if (await fileExists(filename3)) {
    input3 = fs.createReadStream(filename3)
  } else {
    console.error('error: 2nd input file does not exist')
    hasErrors = true
  }

  const source = {
    dlf: null,
    llf: null,
    fts: null
  }

  let json = JSON.parse(await streamToBuffer(input1))
  let extension = json.meta.type

  if (!SUPPORTED_EXTENSIONS.includes(extension)) {
    console.error('error: unsupported meta type for input file #1, expected "dlf", "fts" or "llf" ')
    hasErrors = true
  } else {
    source[extension] = json
  }

  json = JSON.parse(await streamToBuffer(input2))
  extension = json.meta.type

  if (!SUPPORTED_EXTENSIONS.includes(extension)) {
    console.error('error: unsupported meta type for input file #2, expected "dlf", "fts" or "llf" ')
    hasErrors = true
  } else {
    source[extension] = json
  }

  json = JSON.parse(await streamToBuffer(input3))
  extension = json.meta.type

  if (!SUPPORTED_EXTENSIONS.includes(extension)) {
    console.error('error: unsupported meta type for input file #3, expected "dlf", "fts" or "llf" ')
    hasErrors = true
  } else {
    source[extension] = json
  }

  if (source.dlf === null) {
    console.error('error: missing dlf data')
    hasErrors = true
  }
  if (source.fts === null) {
    console.error('error: missing fts data')
    hasErrors = true
  }
  if (source.llf === null) {
    console.error('error: missing llf data')
    hasErrors = true
  }

  if (hasErrors) {
    process.exit(1)
  }

  if (output) {
    output = fs.createWriteStream(output)
  } else {
    output = process.stdout
  }

  const data = {
    meta: {
      type: 'combined'
    },
    header: {
      name: source.dlf.scene.name
    },
    dlf: compose(
      dissocPath(['header', 'numberOfBackgroundPolygons']),
      omit(['meta', 'scene'])
    )(source.dlf),
    fts: compose(
      dissocPath(['header', 'path']),
      omit(['meta'])
    )(source.fts),
    llf: compose(
      dissocPath(['header', 'numberOfBackgroundPolygons']),
      omit(['meta'])
    )(source.llf)
  }

  // TODO: when lighting generation is implemented, then we don't need to deal with colors at all
  let colorIdx = 0
  data.fts.polygons = map(evolve({
    vertices: map(vertex => {
      let color = isZeroVertex(vertex) ? null : data.llf.colors[colorIdx++]
      return assoc('color', color, vertex)
    })
  }), data.fts.polygons)

  delete data.llf.colors

  if (args.pretty) {
    output.write(JSON.stringify(data, 0, 4))
  } else {
    output.write(JSON.stringify(data))
  }
})()
