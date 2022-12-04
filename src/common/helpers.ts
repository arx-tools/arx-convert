import { ArxPolygon } from '../fts/Polygon'
import { ArxVertex } from '../fts/Vertex'
import { COORDS_THAT_ROUND_UP } from './constants'

export const maxAll = (arr: number[]) => {
  let i = arr.length
  let max = -Infinity

  while (i-- > 0) {
    max = arr[i] > max ? arr[i] : max
  }

  return max
}

export const isZeroVertex = ({ x, y, z }: { x: number; y: number; z: number }) => {
  return Math.abs(x) < Number.EPSILON && Math.abs(y) < Number.EPSILON && Math.abs(z) < Number.EPSILON
}

/** @see https://stackoverflow.com/a/14438954/1806628 */
export const uniq = <T>(values: T[]) => {
  return values.filter((value, index, self) => {
    return self.indexOf(value) === index
  })
}

export const times = <T>(fn: (index: number) => T, repetitions: number): T[] => {
  return [...Array(repetitions)].map((value, index) => fn(index))
}

export const repeat = <T>(value: T, repetitions: number): T[] => {
  return Array(repetitions).fill(value)
}

export const doCoordsNeedToBeRoundedUp = (coords: [number, number, number]) => {
  const [a, b, c] = coords.sort((a, b) => a - b)
  return COORDS_THAT_ROUND_UP.find(([x, y, z]) => a === x && b === y && c === z) !== undefined
}

export const addLightIndex = (polygons: ArxPolygon[]) => {
  let idx = 0

  return polygons.map((polygon) => {
    const isQuad = !isZeroVertex(polygon.vertices[3])

    polygon.vertices[0].llfColorIdx = idx++
    polygon.vertices[1].llfColorIdx = idx++
    polygon.vertices[2].llfColorIdx = idx++
    if (isQuad) {
      polygon.vertices[3].llfColorIdx = idx++
    }

    return polygon
  })
}

export const getCellCoords = ([a, b, c]: [ArxVertex, ArxVertex, ArxVertex, ArxVertex]) => {
  const x = (a.x + b.x + c.x) / 3
  const z = (a.z + b.z + c.z) / 3

  let cellX = doCoordsNeedToBeRoundedUp([a.x, b.x, c.x]) ? Math.ceil(x / 100) : Math.floor(x / 100)
  let cellY = doCoordsNeedToBeRoundedUp([a.z, b.z, c.z]) ? Math.ceil(z / 100) : Math.floor(z / 100)

  return [cellX, cellY]
}
