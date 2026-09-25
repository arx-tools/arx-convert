import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { compactFloat32Values } from 'arx-convert/utils'

/**
 * The game files the tests run on. They come from
 * {@link https://github.com/arx-tools/pkware-test-files | pkware-test-files}, checked out next to this
 * repository (the same convention as {@link https://github.com/arx-tools/node-pkware | node-pkware}).
 *
 * Only the `.unpacked` files are used, the pkware compression is not a dependency of this project.
 */
const PKWARE_TEST_FILES_REPOSITORY = 'https://github.com/arx-tools/pkware-test-files'

export type ArxTestFormat = 'fts' | 'dlf' | 'llf'

export function pathToRepoRoot(): string {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
}

export function pathToTestFiles(): string {
  return path.resolve(pathToRepoRoot(), '../pkware-test-files/')
}

export function pathToLevelFolder(level: number): string {
  return path.join(pathToTestFiles(), 'arx-fatalis', `level${level}`)
}

function pathToLevelsFolder(): string {
  return path.join(pathToTestFiles(), 'arx-fatalis')
}

/**
 * The levels of the original game, in ascending order. The folder names are the only place where the
 * level number of a fixture is stored, so `levelIdx` can be checked against them.
 */
export async function availableLevels(): Promise<number[]> {
  const levels: number[] = []

  const filenames = await readdir(pathToLevelsFolder())
  filenames.forEach((filename) => {
    const level = /^level(\d+)$/.exec(filename)

    if (level !== null) {
      levels.push(Number.parseInt(level[1], 10))
    }
  })

  levels.sort((a, b) => {
    return a - b
  })

  return levels
}

/**
 * The levels a test runs on: the `defaultLevels` (a couple of small ones, so `npm test` stays fast),
 * or every fixture when `ARX_FULL_TEST=1` is set.
 */
export async function levelsForTest(defaultLevels: number[]): Promise<number[]> {
  if (process.env.ARX_FULL_TEST === '1') {
    return availableLevels()
  }

  return defaultLevels
}

function filenameOf(level: number, format: ArxTestFormat): string {
  if (format === 'fts') {
    return 'fast.fts.unpacked'
  }

  return `level${level}.${format}.unpacked`
}

/**
 * The path of an `.unpacked` fixture.
 */
export function pathToFixture(level: number, format: ArxTestFormat): string {
  return path.join(pathToLevelFolder(level), filenameOf(level, format))
}

/**
 * Reads a binary file into an `ArrayBuffer`. The `Buffer` node.js gives back can share its memory with other
 * files, so the bytes of this file are copied into an `ArrayBuffer` of their own.
 */
export async function readBinaryFile(filename: string): Promise<ArrayBuffer> {
  const file = await readFile(filename)
  const copy = new ArrayBuffer(file.byteLength)
  new Uint8Array(copy).set(file)

  return copy
}

/**
 * Reads the `.unpacked` fixture of a level. It fails loudly when the test files are missing - a silently
 * empty test run would be worse than a failure.
 */
export async function readFixture(level: number, format: ArxTestFormat): Promise<ArrayBuffer> {
  const filename = pathToFixture(level, format)

  try {
    return await readBinaryFile(filename)
  } catch (error_: unknown) {
    const error = error_ as NodeJS.ErrnoException

    if (error.code !== 'ENOENT') {
      throw error
    }

    throw new Error(`${filename} is missing - check out ${PKWARE_TEST_FILES_REPOSITORY} next to this repository`)
  }
}

/**
 * The JSON the CLI writes and reads back: float32 values are serialized in their shortest decimal
 * representation (see `compactFloat32Values` in `@common/float32.ts`), which has to parse back to the
 * very same binary.
 */
export function toJsonRoundTrip<T>(document: T): T {
  const json: unknown = JSON.parse(compactFloat32Values(JSON.stringify(document)))

  return json as T
}

/**
 * Visits every value of a parsed document (the objects and arrays themselves included) and hands its
 * JSON path over to `callback`, so a problem can be reported with the exact location.
 *
 * @example
 * ```js
 * visitValues({ positions: [1, 2] }, (jsonPath, value) => ...) // "$.positions[0]" -> 1
 * ```
 */
export function visitValues(
  value: unknown,
  callback: (jsonPath: string, value: unknown) => void,
  jsonPath = '$',
): void {
  callback(jsonPath, value)

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      visitValues(item, callback, `${jsonPath}[${index}]`)
    })

    return
  }

  if (typeof value === 'object' && value !== null) {
    for (const [property, propertyValue] of Object.entries(value)) {
      visitValues(propertyValue, callback, `${jsonPath}.${property}`)
    }
  }
}

/**
 * Asserts that a parsed document is representable in JSON: no `null` (the float32 values of a JS object
 * would become `null` when `NaN`, `Infinity` or `-0` reaches `JSON.stringify()`) and no non-finite number.
 */
export function assertValidJsonValues(document: unknown, description: string): void {
  const problems: string[] = []

  visitValues(document, (jsonPath, value) => {
    if (value === null) {
      problems.push(`${jsonPath} is null`)
    }

    if (typeof value === 'number' && !Number.isFinite(value)) {
      problems.push(`${jsonPath} is ${value.toString()}`)
    }
  })

  assert.deepEqual(problems, [], `${description}: the parsed document has values JSON can not represent`)
}

/**
 * Asserts that two saved files are byte identical - comparing the bytes is what protects the game from a
 * lossy conversion, and the first difference tells which field went wrong.
 */
export function assertSameBytes(actual: ArrayBuffer, expected: ArrayBuffer, description: string): void {
  const actualBytes = new Uint8Array(actual)
  const expectedBytes = new Uint8Array(expected)

  if (actualBytes.byteLength !== expectedBytes.byteLength) {
    assert.fail(
      `${description}: the saved file is ${actualBytes.byteLength} bytes, expected ${expectedBytes.byteLength}`,
    )
  }

  for (let index = 0; index < expectedBytes.byteLength; index++) {
    if (actualBytes[index] !== expectedBytes[index]) {
      assert.fail(
        `${description}: the first difference is at byte ${index} of ${expectedBytes.byteLength}` +
          ` (got ${actualBytes[index]}, expected ${expectedBytes[index]})`,
      )
    }
  }
}

/**
 * Asserts that the top level keys of a parsed document are exactly the expected ones, so a renamed or a
 * dropped field can never slip through unnoticed.
 */
export function assertTopLevelKeys(
  document: Record<string, unknown>,
  expectedKeys: string[],
  description: string,
): void {
  const keys = Object.keys(document).sort()
  const sortedExpectedKeys = [...expectedKeys].sort()

  assert.deepEqual(
    keys,
    sortedExpectedKeys,
    `${description}: the top level keys are ${keys.join(', ')}, expected ${sortedExpectedKeys.join(', ')}`,
  )
}
