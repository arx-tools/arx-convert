import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import { test } from 'node:test'
import { LLF } from '../src/index.ts'
import type { ArxLLF } from '../src/types.ts'
import { assertTopLevelKeys, assertValidJsonValues, levelsForTest, readFixture, toJsonRoundTrip } from './fixtures.ts'

const DEFAULT_LEVELS = [8, 20]

const EXPECTED_KEYS = ['$schema', 'header', 'lights', 'colors']

for (const level of await levelsForTest(DEFAULT_LEVELS)) {
  const description = `level${level} LLF`
  const bytes = await readFixture(level, 'llf')

  void test(`${description}: both conversion paths produce the same file`, () => {
    const fromBinary = LLF.save(LLF.load(bytes))
    const fromJson = LLF.save(toJsonRoundTrip(LLF.load(bytes)))

    assert.ok(Buffer.from(fromJson).equals(Buffer.from(fromBinary)), `${description}: the two paths differ`)
  })

  void test(`${description}: every value is representable in JSON`, () => {
    const json = LLF.load(bytes)

    assertValidJsonValues(json, description)
    assert.equal(json.$schema, 'https://arx-tools.github.io/schemas/llf.schema.json', `${description}: $schema`)
  })

  void test(`${description}: the document has the expected shape`, () => {
    const json: ArxLLF = LLF.load(bytes)

    assertTopLevelKeys(json, EXPECTED_KEYS, description)
    assert.ok(json.lights.length > 0, `${description}: there are no lights`)
    assert.ok(json.colors.length > 0, `${description}: there are no colors`)
    assert.ok(json.header.numberOfPolygonsInFTS > 0, `${description}: header.numberOfPolygonsInFTS is not positive`)
  })
}
