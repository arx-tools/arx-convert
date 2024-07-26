import { type DoubleOf, type QuadrupleOf, type TripleOf } from '@common/types.js'
import { type ArxPolygon, ArxPolygonFlags } from '@fts/Polygon.js'
import { type ArxVertex } from '@fts/Vertex.js'
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
    idx += 3

    if (isQuad(polygon)) {
      polygon.vertices[3].llfColorIdx = idx
      idx += 1
    }

    return polygon
  })
}

function doCoordsNeedToBeRoundedUp(coords: TripleOf<number>): boolean {
  const [a, b, c] = coords.sort((a, b) => a - b)
  return COORDS_THAT_ROUND_UP.some(([x, y, z]) => a === x && b === y && c === z)
}

export function getCellCoords([a, b, c]: QuadrupleOf<ArxVertex>): DoubleOf<number> {
  const x = (a.x + b.x + c.x) / 3
  const z = (a.z + b.z + c.z) / 3

  const cellX = doCoordsNeedToBeRoundedUp([a.x, b.x, c.x]) ? Math.ceil(x / 100) : Math.floor(x / 100)
  const cellY = doCoordsNeedToBeRoundedUp([a.z, b.z, c.z]) ? Math.ceil(z / 100) : Math.floor(z / 100)

  return [cellX, cellY]
}
