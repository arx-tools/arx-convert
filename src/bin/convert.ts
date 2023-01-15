#!/usr/bin/env -S node --enable-source-maps

import minimist from 'minimist-lite'
import {
  getPackageVersion,
  streamToBuffer,
  stringifyYAML,
  stringifyJSON,
  outputInChunks,
  getInputStream,
  getOutputStream,
  isValidFormat,
  isArxFormat,
  isDataFormat,
} from '@bin/helpers'
import { DLF, FTS, LLF, FTL, TEA, AMB } from '../index'

type AppArgs = {
  _: string[]
  version: boolean
  v: boolean
  prettify: boolean
  output?: string
  from?: string
  to?: string
}

const args: AppArgs = minimist(process.argv.slice(2), {
  string: ['output', 'from', 'to'],
  boolean: ['version', 'prettify'],
  alias: {
    v: 'version',
  },
})

;(async () => {
  if (args.version) {
    const version = await getPackageVersion()
    console.log(`arx-convert - version ${version}`)
    process.exit(0)
  }

  let input: NodeJS.ReadableStream
  let output: NodeJS.WritableStream
  try {
    if (typeof args.from === 'undefined' || args.from === '') {
      throw new Error('"from" argument is missing or empty')
    }
    if (typeof args.to === 'undefined' || args.to === '') {
      throw new Error('"to" argument is missing or empty')
    }

    if (!isValidFormat(args.from)) {
      throw new Error(`unknown format '${args.from}' in "from"`)
    }
    if (!isValidFormat(args.to)) {
      throw new Error(`unknown format '${args.to}' in "to"`)
    }

    if (args.from === args.to) {
      throw new Error('"from" and "to" have the same format')
    }

    if (isArxFormat(args.from) && isArxFormat(args.to)) {
      throw new Error('"from" and "to" are both referencing arx formats, expected one of them to be a data type')
    }
    if (isDataFormat(args.from) && isDataFormat(args.to)) {
      throw new Error('"from" and "to" are both referencing data types, expected one of them to be an arx format')
    }

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
    case 'amb':
      parsedIn = AMB.load(rawIn)
      break
  }

  let rawOut: string | Buffer
  switch (args.to) {
    case 'json':
      rawOut = stringifyJSON(parsedIn, args.prettify)
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
    case 'amb':
      rawOut = AMB.save(parsedIn)
      break
  }

  outputInChunks(rawOut, output)
})()
