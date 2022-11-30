#!/usr/bin/env node

import minimist from 'minimist-lite'
import {
  getPackageVersion,
  streamToBuffer,
  stringifyYAML,
  stringifyJSON,
  outputInChunks,
  validateFromToPair,
  getInputStream,
  getOutputStream,
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

  let input
  let output
  try {
    validateFromToPair(args.from, args.to)
    input = await getInputStream(args._[0])
    output = await getOutputStream(args.output)
  } catch (e: unknown) {
    const error = e as Error
    console.error('error:', error.message)
    process.exit(1)
  }

  const rawIn = await streamToBuffer(input)
  let parsedIn
  switch (args.from) {
    case 'json':
      parsedIn = JSON.parse(rawIn.toString('utf-8'))
      break
    case 'yml':
    case 'yaml':
      {
        const YAML = await import('yaml')
        parsedIn = YAML.parse(rawIn.toString('utf-8'))
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

  let rawOut: string | Buffer
  switch (args.to) {
    case 'json':
      rawOut = stringifyJSON(parsedIn, args.pretty)
      break
    case 'yml':
    case 'yaml':
      rawOut = await stringifyYAML(parsedIn)
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
    default:
      rawOut = ''
  }

  if (rawOut) {
    outputInChunks(rawOut, output)
  }
})()
