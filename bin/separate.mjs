#!/usr/bin/env node --experimental-modules

import fs from 'fs'
import minimist from 'minimist'
import { fileExists, getPackageVersion, streamToBuffer } from './helpers.mjs'
import { pluck, unnest, reject, evolve, map, dissoc } from '../node_modules/ramda/src/index.mjs'
import { isZeroVertex } from '../src/common/helpers.mjs'

const args = minimist(process.argv.slice(2), {
  string: ['dlf', 'llf', 'fts'],
  boolean: ['version', 'pretty']
});

(async () => {
  if (args.version) {
    console.log(await getPackageVersion())
    process.exit(0)
  }

  let filename = args._[0]

  let hasErrors = false

  let input
  if (filename) {
    if (await fileExists(filename)) {
      input = fs.createReadStream(filename)
    } else {
      console.error('error: input file does not exist')
      hasErrors = true
    }
  } else {
    input = process.openStdin()
  }

  const json = JSON.parse(await streamToBuffer(input))
  const extension = json.meta.type

  if (extension !== 'combined') {
    console.error('error: unsupported meta type, expected "combined"')
    hasErrors = true
  }

  if (hasErrors) {
    process.exit(1)
  }

  const outputs = {
    dlf: fs.createWriteStream(args.dlf),
    llf: fs.createWriteStream(args.llf),
    fts: fs.createWriteStream(args.fts)
  }

  const numberOfPolygons = json.fts.polygons.length

  const dlf = json.dlf
  dlf.header.numberOfBackgroundPolygons = numberOfPolygons
  dlf.meta = {
    type: 'dlf'
  }
  dlf.scene = {
    name: json.header.name
  }

  if (args.pretty) {
    outputs.dlf.write(JSON.stringify(dlf, 0, 4))
  } else {
    outputs.dlf.write(JSON.stringify(dlf))
  }

  const llf = json.llf
  llf.meta = {
    type: 'llf'
  }
  llf.header.numberOfBackgroundPolygons = numberOfPolygons

  // TODO: generate colors, not just get them from vertices
  llf.colors = pluck('color', reject(isZeroVertex, unnest(pluck('vertices', json.fts.polygons))))

  if (args.pretty) {
    outputs.llf.write(JSON.stringify(llf, 0, 4))
  } else {
    outputs.llf.write(JSON.stringify(llf))
  }

  const fts = json.fts
  fts.meta = {
    type: 'fts'
  }
  fts.header.path = `C:\\ARX\\Game\\${json.header.name}`
  fts.polygons = map(evolve({
    vertices: map(dissoc('color'))
  }), fts.polygons)

  if (args.pretty) {
    outputs.fts.write(JSON.stringify(fts, 0, 4))
  } else {
    outputs.fts.write(JSON.stringify(fts))
  }
})()
