import { DLF, FTS, LLF } from 'arx-convert'
import { type ArxTestFormat, availableLevels, pathToFixture, readBinaryFile, readFixture } from '../fixtures.ts'

/**
 * A parsed document together with the name of the fixture or file it came from, so a report can tell which
 * file a problem is in.
 */
export type ArxDocument = {
  name: string
  document: unknown
}

const SUFFIXES: Array<{ format: ArxTestFormat; suffix: string }> = [
  { format: 'fts', suffix: '.fts.unpacked' },
  { format: 'dlf', suffix: '.dlf.unpacked' },
  { format: 'llf', suffix: '.llf.unpacked' },
]

export function isArxTestFormat(value: string): value is ArxTestFormat {
  for (const { format } of SUFFIXES) {
    if (format === value) {
      return true
    }
  }

  return false
}

/**
 * The formats the diagnostic tools of `tests/tools` work on, taken from the arguments (`fts`, `dlf`, `llf`),
 * falling back to the FTS which is the one the audits focus on.
 */
export function formatsOfArguments(args: string[]): ArxTestFormat[] {
  const formats = args.filter(isArxTestFormat)

  if (formats.length === 0) {
    return ['fts']
  }

  return formats
}

/**
 * The `.unpacked` files of the arguments, their format is taken from their name.
 */
export function filesOfArguments(args: string[]): string[] {
  return args.filter((arg) => {
    return !isArxTestFormat(arg)
  })
}

export function loadDocument(format: ArxTestFormat, bytes: ArrayBuffer): unknown {
  if (format === 'fts') {
    return FTS.load(bytes)
  }

  if (format === 'dlf') {
    return DLF.load(bytes)
  }

  return LLF.load(bytes)
}

/**
 * The format of an `.unpacked` file, taken from its name.
 */
export function formatsOfFile(filename: string): ArxTestFormat {
  for (const { format, suffix } of SUFFIXES) {
    if (filename.endsWith(suffix)) {
      return format
    }
  }

  throw new Error(`${filename} is not an .unpacked fts, dlf or llf file`)
}

/**
 * Walks through the fixtures of the given formats, or through the files passed on the command line, and
 * hands the parsed document over to `callback`.
 *
 * The documents are read one by one and `callback` is called in that order, so the output of the tools is
 * deterministic.
 *
 * @example
 * ```sh
 * node tests/tools/nan-finder.ts dlf ../pkware-test-files/arx-fatalis/level6/level6.dlf.unpacked
 * ```
 */
export async function forEachDocument(args: string[], callback: (parsed: ArxDocument) => void): Promise<void> {
  const files = filesOfArguments(args)

  if (files.length > 0) {
    for (const file of files) {
      const bytes = await readBinaryFile(file)
      callback({ name: file, document: loadDocument(formatsOfFile(file), bytes) })
    }

    return
  }

  for (const format of formatsOfArguments(args)) {
    for (const level of await availableLevels()) {
      const bytes = await readFixture(level, format)
      callback({ name: pathToFixture(level, format), document: loadDocument(format, bytes) })
    }
  }
}
