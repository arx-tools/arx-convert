import type { DoubleOf, QuadrupleOf, TripleOf } from '@common/types.js'
import { type ArxPolygon, ArxPolygonFlags } from '@fts/Polygon.js'
import type { ArxVertex } from '@fts/Vertex.js'
import { COORDS_THAT_ROUND_UP } from '@fts/constants.js'

export function isQuad({ flags }: { flags: ArxPolygonFlags }): boolean {
  return (flags & ArxPolygonFlags.Quad) !== 0
}

export function isTiled({ flags }: { flags: ArxPolygonFlags }): boolean {
  return (flags & ArxPolygonFlags.Tiled) !== 0
}

export function addLightIndex(polygons: ArxPolygon[]): ArxPolygon[] {
  let idx = 0

  return polygons.map((polygon) => {
    polygon.vertices[0].llfColorIdx = idx
    polygon.vertices[1].llfColorIdx = idx + 1
    polygon.vertices[2].llfColorIdx = idx + 2
    idx = idx + 3

    if (isQuad(polygon)) {
      polygon.vertices[3].llfColorIdx = idx
      idx = idx + 1
    }

    return polygon
  })
}

function doCoordsNeedToBeRoundedUp(coords: TripleOf<number>): boolean {
  const [a, b, c] = [...coords].sort((a, b) => {
    return a - b
  })

  return COORDS_THAT_ROUND_UP.some(([x, y, z]) => {
    return a === x && b === y && c === z
  })
}

/**
 * The coordinates of the vertices are float32 values (see `Float32` in `@common/float32.ts`). When they arrive
 * from a JSON file (`FTS.save()` calls this function) they can carry extra precision, because the JSON uses
 * the shortest decimal representation of a float32. Rounding them back to float32 makes the cell calculation
 * independent of that extra precision, so `COORDS_THAT_ROUND_UP` keeps matching and the polygons don't end up
 * in a neighbouring cell.
 */
export function getCellCoords([a, b, c]: QuadrupleOf<ArxVertex>): DoubleOf<number> {
  const xCoords: TripleOf<number> = [Math.fround(a.x), Math.fround(b.x), Math.fround(c.x)]
  const zCoords: TripleOf<number> = [Math.fround(a.z), Math.fround(b.z), Math.fround(c.z)]

  const x = (xCoords[0] + xCoords[1] + xCoords[2]) / 3
  const z = (zCoords[0] + zCoords[1] + zCoords[2]) / 3

  let cellX: number
  if (doCoordsNeedToBeRoundedUp(xCoords)) {
    cellX = Math.ceil(x / 100)
  } else {
    cellX = Math.floor(x / 100)
  }

  let cellY: number
  if (doCoordsNeedToBeRoundedUp(zCoords)) {
    cellY = Math.ceil(z / 100)
  } else {
    cellY = Math.floor(z / 100)
  }

  return [cellX, cellY]
}

/**
 * inclusive: min <= n <= max
 */
export function isBetween(min: number, max: number, n: number): boolean {
  if (min > max) {
    ;[max, min] = [min, max]
  }

  return n >= min && n <= max
}
