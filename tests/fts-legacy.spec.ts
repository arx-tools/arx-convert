import assert from 'node:assert/strict'
import { test } from 'node:test'
import { FTS } from '../src/index.ts'

/**
 * The header of the format before 0.141, in bytes.
 */
const LEGACY_HEADER_SIZE = 264

/**
 * The polygon of the format before 0.141, in bytes.
 */
const LEGACY_POLYGON_SIZE = 140

/**
 * The header of the scene, in bytes.
 */
const SCENE_HEADER_SIZE = 56

/**
 * One cell of the scene: the number of its polygons and of its anchors.
 */
const SCENE_INFO_SIZE = 8

/**
 * The cells of a level: the scene is a 160x160 grid.
 */
const NUMBER_OF_CELLS = 160 * 160

/**
 * The header of a room, in bytes: the number of its portals and of its polygons, and six words of padding.
 */
const ROOM_DATA_SIZE = 32

/**
 * The distance of the one room of the test, in bytes: a float and two vectors.
 */
const ROOM_DISTANCE_SIZE = 28

/**
 * One vertex of the old format, in the unit the file stores it in.
 */
type LegacyVertex = {
  readonly y: number
  readonly xOffset: number
  readonly zOffset: number
  readonly u: number
  readonly v: number
}

/**
 * Writes the path of the level into the header.
 *
 * @param bytes The file to write into.
 * @param path The path the header carries.
 */
function writePath(bytes: Uint8Array, path: string): void {
  for (const [index, character] of [...path].entries()) {
    bytes[index] = character.codePointAt(0) ?? 0
  }
}

/**
 * Builds one vertex of the old format: a float height, two shorts of cell relative hundredths and two shorts of UV.
 *
 * @param view The polygon to write into.
 * @param at The offset of the vertex.
 * @param vertex The value of the vertex.
 * @param vertex.y The height of the vertex.
 * @param vertex.xOffset The first floor coordinate, in hundredths from the cell origin.
 * @param vertex.zOffset The second floor coordinate, in hundredths from the cell origin.
 * @param vertex.u The first texture coordinate, in 1024ths.
 * @param vertex.v The second texture coordinate, in 1024ths.
 */
function writeLegacyVertex(view: DataView, at: number, vertex: LegacyVertex): void {
  view.setFloat32(at, vertex.y, true)
  view.setInt16(at + 4, vertex.xOffset, true)
  view.setInt16(at + 6, vertex.zOffset, true)
  view.setInt16(at + 8, vertex.u, true)
  view.setInt16(at + 10, vertex.v, true)
}

/**
 * Builds a polygon of the old format.
 *
 * @param options The shape of the polygon.
 * @param options.flags The bits that say whether the polygon is a quad or a triangle of the old format.
 *
 * @returns The bytes of the polygon.
 */
function legacyPolygonOf(options: { readonly flags: number }): ArrayBuffer {
  const buffer = new ArrayBuffer(LEGACY_POLYGON_SIZE)
  const view = new DataView(buffer)
  const vertices: readonly LegacyVertex[] = [
    { y: 100, xOffset: 150, zOffset: 250, u: 512, v: 1024 },
    { y: 110, xOffset: 350, zOffset: 450, u: 256, v: 0 },
    { y: 120, xOffset: 550, zOffset: 650, u: 0, v: 512 },
    { y: 130, xOffset: 750, zOffset: 850, u: 768, v: 1024 },
  ]

  for (const [index, vertex] of vertices.entries()) {
    writeLegacyVertex(view, index * 12, vertex)
  }

  view.setInt32(48, 7, true) // texture container id
  // the normals (at 52, 64 and 76) stay zero
  view.setFloat32(124, 0, true) // transval
  view.setFloat32(128, 100, true) // area
  view.setInt32(132, options.flags, true)
  view.setInt16(136, 3, true) // room
  view.setInt16(138, 0, true) // paddy

  return buffer
}

/**
 * Builds the file of a level of the old format, with one polygon in the first cell.
 *
 * @param polygon The polygon bytes.
 *
 * @returns The unpacked file.
 */
function legacyFtsOf(polygon: ArrayBuffer): ArrayBuffer {
  const bodySize =
    SCENE_HEADER_SIZE + NUMBER_OF_CELLS * SCENE_INFO_SIZE + polygon.byteLength + ROOM_DATA_SIZE + ROOM_DISTANCE_SIZE
  const buffer = new ArrayBuffer(LEGACY_HEADER_SIZE + bodySize)
  const bytes = new Uint8Array(buffer)
  const view = new DataView(buffer)

  writePath(bytes, 'C:\\ARX\\Game\\Graph\\Levels\\level12\\')
  view.setInt32(256, 0, true) // no unique headers
  view.setFloat32(260, 0.139, true) // the version of the old format

  let at = LEGACY_HEADER_SIZE

  // the scene header
  view.setFloat32(at, 0.139, true)
  view.setInt32(at + 4, 160, true) // size x
  view.setInt32(at + 8, 160, true) // size z
  view.setInt32(at + 12, 0, true) // number of textures
  view.setInt32(at + 16, 1, true) // number of polygons
  view.setInt32(at + 20, 0, true) // number of anchors
  view.setInt32(at + 48, 0, true) // number of portals
  view.setInt32(at + 52, 0, true) // number of rooms (the empty room #0 is the one record)

  at = at + SCENE_HEADER_SIZE

  // the cells: the first one has the polygon, the rest are empty
  view.setInt32(at, 1, true)
  view.setInt32(at + 4, 0, true)

  at = at + SCENE_INFO_SIZE
  bytes.set(new Uint8Array(polygon), at)
  at = at + polygon.byteLength

  for (let cell = 1; cell < NUMBER_OF_CELLS; cell++) {
    view.setInt32(at, 0, true)
    view.setInt32(at + 4, 0, true)
    at = at + SCENE_INFO_SIZE
  }

  // the empty room #0: no portals, no polygons, and the padding stays zero
  for (let word = 0; word < ROOM_DATA_SIZE / 4; word++) {
    view.setInt32(at + word * 4, 0, true)
  }
  // the room distance of that one room: a float and two vectors, all zero

  return buffer
}

void test('a polygon of the format before 0.141 is read with world coordinates', () => {
  const json = FTS.load(legacyFtsOf(legacyPolygonOf({ flags: 65 })))
  const parsed = json.polygons[0]

  assert.equal(json.header.levelIdx, 12)
  assert.equal(json.cells.length, NUMBER_OF_CELLS)
  assert.equal(json.polygons.length, 1)
  assert.notStrictEqual(parsed, undefined)

  assert.deepEqual(parsed.vertices, [
    { x: 1.5, y: 100, z: 2.5, u: 0.5, v: 1, llfColorIdx: 0 },
    { x: 3.5, y: 110, z: 4.5, u: 0.25, v: 0, llfColorIdx: 1 },
    { x: 5.5, y: 120, z: 6.5, u: 0, v: 0.5, llfColorIdx: 2 },
    { x: 7.5, y: 130, z: 8.5, u: 0.75, v: 1, llfColorIdx: 3 },
  ])
  assert.equal(parsed.textureContainerId, 7)
  assert.equal(parsed.flags, 65)
  assert.equal(parsed.room, 3)
  assert.equal(parsed.area, 100)
})

void test('the unused fourth vertex of a triangle is zeroed', () => {
  const json = FTS.load(legacyFtsOf(legacyPolygonOf({ flags: 1 })))
  const parsed = json.polygons[0]

  assert.notStrictEqual(parsed, undefined)
  assert.deepEqual(parsed.vertices[3], { x: 0, y: 0, z: 0, u: 0, v: 0 })
})
