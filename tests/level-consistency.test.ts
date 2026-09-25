import assert from 'node:assert/strict'
import { test } from 'node:test'
import { DLF, FTS, LLF } from 'arx-convert'
import { isQuad } from 'arx-convert/utils'
import { levelsForTest, readFixture } from './fixtures.ts'

const DEFAULT_LEVELS = [8, 20]

for (const level of await levelsForTest(DEFAULT_LEVELS)) {
  const description = `level${level}`

  void test(`${description}: the FTS, the DLF and the LLF describe the same level`, async () => {
    const fts = FTS.load(await readFixture(level, 'fts'))
    const dlf = DLF.load(await readFixture(level, 'dlf'))
    const llf = LLF.load(await readFixture(level, 'llf'))

    assert.equal(dlf.header.levelIdx, fts.header.levelIdx, `${description}: the levelIdx of the DLF and the FTS`)

    /**
     * The LLF stores a color for every vertex of every polygon of the FTS (see `addLightIndex()`), which
     * pins the polygon count and the polygon flags of the two files together.
     *
     * `dlf.header.numberOfPolygonsInFTS` is not checked: the game data itself disagrees with the FTS in
     * level3, level11 and level21, and the game never reads that field of the header.
     */
    const quads = fts.polygons.filter((polygon) => {
      return isQuad(polygon)
    }).length

    assert.equal(
      llf.header.numberOfPolygonsInFTS,
      fts.polygons.length,
      `${description}: the number of polygons in the LLF header and in the FTS`,
    )
    assert.equal(
      llf.colors.length,
      fts.polygons.length * 3 + quads,
      `${description}: the number of LLF colors against the polygons of the FTS`,
    )
  })
}
