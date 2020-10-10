#!/usr/bin/env node --experimental-modules

import fs from 'fs'
import minimist from 'minimist'
import { DLF, FTS, LLF } from '../src/index.mjs'
import { fileExists, getPackageVersion, streamToBuffer } from './helpers.mjs'
import { SUPPORTED_EXTENSIONS } from './constants.mjs'

const args = minimist(process.argv.slice(2), {
  string: ['output', 'ext'],
  boolean: ['version']
});

(async () => {
  if (args.version) {
    console.log(await getPackageVersion())
    process.exit(0)
  }

  let filename = args._[0]
  let extension = args.ext ? args.ext.toLowerCase() : ''
  let output = args.output

  let hasErrors = false

  let input
  if (filename) {
    if (await fileExists(filename)) {
      input = fs.createReadStream(filename)
      if (!extension) {
        extension = filename.match(/\.([a-zA-Z]+)$/)[1].toLowerCase()
      }
    } else {
      console.error('error: input file does not exist')
      hasErrors = true
    }
  } else {
    input = process.openStdin()
  }

  if (!SUPPORTED_EXTENSIONS.includes(extension)) {
    console.error('error: unsupported extension')
    hasErrors = true
  }

  if (output) {
    output = fs.createWriteStream(output)
  } else {
    output = process.stdout
  }

  if (hasErrors) {
    process.exit(1)
  }

  const json = JSON.parse(await streamToBuffer(input))

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
