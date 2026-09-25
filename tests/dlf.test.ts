import assert from 'node:assert/strict'
import { test } from 'node:test'
import { DLF } from 'arx-convert'
import type { ArxDLF } from 'arx-convert/types'
import {
  assertSameBytes,
  assertTopLevelKeys,
  assertValidJsonValues,
  levelsForTest,
  readFixture,
  toJsonRoundTrip,
} from './fixtures.ts'

/**
 * level6 is the smallest fixture whose header path is stored in the `\\ARKANESERVER\...` style of the early
 * builds (see `levelIdxFromPath()`), so the default run covers that path parsing as well
 */
const DEFAULT_LEVELS = [6, 8, 20]

const EXPECTED_KEYS = ['$schema', 'header', 'interactiveObjects', 'fogs', 'paths', 'zones']

for (const level of await levelsForTest(DEFAULT_LEVELS)) {
  const description = `level${level} DLF`
  const bytes = await readFixture(level, 'dlf')

  void test(`${description}: both conversion paths produce the same file`, () => {
    assertSameBytes(DLF.save(toJsonRoundTrip(DLF.load(bytes))), DLF.save(DLF.load(bytes)), description)
  })

  void test(`${description}: levelIdx matches the folder of the fixture`, () => {
    assert.equal(DLF.load(bytes).header.levelIdx, level, `${description}: header.levelIdx`)
  })

  void test(`${description}: every value is representable in JSON`, () => {
    const json = DLF.load(bytes)

    assertValidJsonValues(json, description)
    assert.equal(json.$schema, 'https://arx-tools.github.io/schemas/dlf.schema.json', `${description}: $schema`)
  })

  void test(`${description}: the document has the expected shape`, () => {
    const json: ArxDLF = DLF.load(bytes)

    assertTopLevelKeys(json, EXPECTED_KEYS, description)
    assert.ok(json.header.lastModifiedBy.length > 0, `${description}: header.lastModifiedBy is empty`)
    assert.ok(json.interactiveObjects.length > 0, `${description}: there are no interactive objects`)
    assert.ok(json.paths.length + json.zones.length > 0, `${description}: there are no paths or zones`)
  })
}
