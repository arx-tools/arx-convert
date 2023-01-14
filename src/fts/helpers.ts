import { any } from '@common/helpers'
import { QuadrupleOf } from '@common/types'
import { ArxPolygon, ArxPolygonFlags } from '@fts/Polygon'
import { ArxVertex } from '@fts/Vertex'
import { COORDS_THAT_ROUND_UP } from '@fts/constants'

const isQuad = (polygon: ArxPolygon) => {
  return (polygon.flags & ArxPolygonFlags.Quad) !== 0
}

export const addLightIndex = (polygons: ArxPolygon[]) => {
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

const doCoordsNeedToBeRoundedUp = (coords: [number, number, number]) => {
  const [a, b, c] = coords.sort((a, b) => a - b)
  return any(([x, y, z]) => a === x && b === y && c === z, COORDS_THAT_ROUND_UP)
}

export const getCellCoords = ([a, b, c]: QuadrupleOf<ArxVertex>): [number, number] => {
  const x = (a.x + b.x + c.x) / 3
  const z = (a.z + b.z + c.z) / 3

  const cellX = doCoordsNeedToBeRoundedUp([a.x, b.x, c.x]) ? Math.ceil(x / 100) : Math.floor(x / 100)
  const cellY = doCoordsNeedToBeRoundedUp([a.z, b.z, c.z]) ? Math.ceil(z / 100) : Math.floor(z / 100)

  return [cellX, cellY]
}
