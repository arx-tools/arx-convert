#!/usr/bin/env node

import fs from 'node:fs'
import minimist from 'minimist-lite'
import {
  fileExists,
  getPackageVersion,
  streamToBuffer,
  stringifyYAML,
  stringifyJSON,
  outputInChunks,
  validateFromToPair,
} from './helpers'
import { DLF, FTS, LLF, FTL, TEA } from '../index'

// ---------------------------

const args = minimist(process.argv.slice(2), {
  string: ['output', 'from', 'to'],
  boolean: ['version', 'pretty'],
  alias: {
    v: 'version',
    p: 'pretty',
  },
})

;(async () => {
  if (args.version) {
    const version = await getPackageVersion()
    console.log(`arx-level-json-converter - version ${version}`)
    process.exit(0)
  }

  const filename = args._[0]
  let hasErrors = false

  let input: fs.ReadStream | NodeJS.Socket
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

  try {
    validateFromToPair(args.from, args.to)
  } catch (e: unknown) {
    const error = e as Error
    console.error('error:', error.message)
    hasErrors = true
  }

  let output
  if (args.output) {
    output = fs.createWriteStream(args.output)
  } else {
    output = process.stdout
  }

  if (hasErrors) {
    process.exit(1)
  }

  const rawIn = await streamToBuffer(input)
  let parsedIn
  switch (args.from) {
    case 'json':
      parsedIn = JSON.parse(rawIn)
      break
    case 'yml':
    case 'yaml':
      {
        const YAML = require('yaml')
        parsedIn = YAML.parse(rawIn.toString())
      }
      break
    case 'dlf':
      parsedIn = DLF.load(rawIn)
      break
    case 'fts':
      parsedIn = FTS.load(rawIn)
      break
    case 'llf':
      parsedIn = LLF.load(rawIn)
      break
    case 'ftl':
      parsedIn = FTL.load(rawIn)
      break
    case 'tea':
      parsedIn = TEA.load(rawIn)
      break
  }

  let rawOut
  switch (args.to) {
    case 'json':
      rawOut = stringifyJSON(parsedIn, args.pretty)
      break
    case 'yml':
    case 'yaml':
      rawOut = stringifyYAML(parsedIn)
      break
    case 'dlf':
      rawOut = DLF.save(parsedIn)
      break
    case 'fts':
      rawOut = FTS.save(parsedIn)
      break
    case 'llf':
      rawOut = LLF.save(parsedIn)
      break
    case 'ftl':
      rawOut = FTL.save(parsedIn)
      break
    case 'tea':
      rawOut = TEA.save(parsedIn)
      break
  }

  outputInChunks(rawOut, output)
})()
