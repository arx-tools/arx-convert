#!/usr/bin/env node --experimental-modules

import fs from 'fs'
import minimist from 'minimist'
import { DLF, FTS, LLF } from '../src/index.mjs'
import { fileExists, getPackageVersion, streamToBuffer } from './helpers.mjs'
import { SUPPORTED_EXTENSIONS } from './constants.mjs'

const args = minimist(process.argv.slice(2), {
  string: ['output'],
  boolean: ['version']
});

(async () => {
  if (args.version) {
    console.log(await getPackageVersion())
    process.exit(0)
  }

  let filename = args._[0]
  let output = args.output

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

  if (output) {
    output = fs.createWriteStream(output)
  } else {
    output = process.stdout
  }

  const json = JSON.parse(await streamToBuffer(input))
  const extension = json.meta.type

  if (!SUPPORTED_EXTENSIONS.includes(extension)) {
    console.error('error: unsupported extension')
    hasErrors = true
  }

  if (hasErrors) {
    process.exit(1)
  }

  let binary
  switch (extension) {
    case 'fts':
      binary = FTS.save(json)
      break
    case 'dlf':
      binary = DLF.save(json)
      break
    case 'llf':
      binary = LLF.save(json)
      break
  }

  output.write(binary)
})()
