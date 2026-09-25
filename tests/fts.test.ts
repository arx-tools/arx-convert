import assert from 'node:assert/strict'
import { test } from 'node:test'
import { FTS } from 'arx-convert'
import type { ArxFTS } from 'arx-convert/types'
import { MAP_DEPTH_IN_CELLS, MAP_WIDTH_IN_CELLS } from 'arx-convert/utils'
import {
  assertSameBytes,
  assertTopLevelKeys,
  assertValidJsonValues,
  levelsForTest,
  readFixture,
  toJsonRoundTrip,
} from './fixtures.ts'

/**
 * The smallest levels, they keep `npm test` fast - `ARX_FULL_TEST=1 npm test` runs on every fixture.
 */
const DEFAULT_LEVELS = [8, 20]

const EXPECTED_KEYS = [
  '$schema',
  'header',
  'uniqueHeaders',
  'textureContainers',
  'cells',
  'polygons',
  'anchors',
  'portals',
  'rooms',
  'roomDistances',
]

for (const level of await levelsForTest(DEFAULT_LEVELS)) {
  const description = `level${level} FTS`
  const bytes = await readFixture(level, 'fts')

  void test(`${description}: both conversion paths produce the same file`, () => {
    // what the game gets from a JSON has to be byte identical with what it gets from the binary,
    // otherwise the shortest float32 serialization lost precision
    assertSameBytes(FTS.save(toJsonRoundTrip(FTS.load(bytes))), FTS.save(FTS.load(bytes)), description)
  })

  void test(`${description}: levelIdx matches the folder of the fixture`, () => {
    assert.equal(FTS.load(bytes).header.levelIdx, level, `${description}: header.levelIdx`)
  })

  void test(`${description}: every value is representable in JSON`, () => {
    const json = FTS.load(bytes)

    assertValidJsonValues(json, description)
    assert.equal(json.$schema, 'https://arx-tools.github.io/schemas/fts.schema.json', `${description}: $schema`)
  })

  void test(`${description}: the document has the expected shape`, () => {
    const json: ArxFTS = FTS.load(bytes)

    assertTopLevelKeys(json, EXPECTED_KEYS, description)
    assert.ok(json.polygons.length > 0, `${description}: there are no polygons`)
    assert.ok(json.anchors.length > 0, `${description}: there are no anchors`)
    assert.ok(json.rooms.length > 0, `${description}: there are no rooms`)
    assert.ok(json.textureContainers.length > 0, `${description}: there are no texture containers`)
    assert.equal(json.cells.length, MAP_WIDTH_IN_CELLS * MAP_DEPTH_IN_CELLS, `${description}: the number of cells`)
    assert.equal(
      json.roomDistances.length,
      json.rooms.length ** 2,
      `${description}: every room distance is stored for every room pair`,
    )
  })
}
