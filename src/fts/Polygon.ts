import { BinaryIO } from '../common/BinaryIO.ts'
import { MAP_DEPTH_IN_CELLS, MAP_WIDTH_IN_CELLS } from '../common/constants.ts'
import { concatArrayBuffers, times } from '../common/helpers.ts'
import type { ArxVector3, Float32, QuadrupleOf } from '../common/types.ts'
import type { ArxTextureContainer } from './TextureContainer.ts'
import { type ArxVertex, Vertex } from './Vertex.ts'
import { isBetween, isQuad } from './helpers.ts'

/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/graphics/GraphicsTypes.h#L88
 */
export const ArxPolygonFlags = {
  None: 0,
  NoShadow: 1 << 0,
  DoubleSided: 1 << 1,
  Transparent: 1 << 2,
  Water: 1 << 3,
  Glow: 1 << 4,
  Ignore: 1 << 5,
  Quad: 1 << 6,
  /**
   * Unused by arx.
   */
  Tiled: 1 << 7,
  Metal: 1 << 8,
  Hide: 1 << 9,
  Stone: 1 << 10,
  Wood: 1 << 11,
  Gravel: 1 << 12,
  Earth: 1 << 13,
  NoCollision: 1 << 14,
  Lava: 1 << 15,
  Climbable: 1 << 16,
  Falling: 1 << 17,
  NoPath: 1 << 18,
  NoDraw: 1 << 19,
  PrecisePath: 1 << 20,
  // NoClimb: 1 << 21, // unused
  // Angular: 1 << 22, // unused
  // AngularIdx0: 1 << 23, // unused
  // AngularIdx1: 1 << 24, // unused
  // AngularIdx2: 1 << 25, // unused
  // AngularIdx3: 1 << 26, // unused
  LateMip: 1 << 27,
} as const

/**
 * A combination of the {@link ArxPolygonFlags} bits.
 */
export type ArxPolygonFlags = number

/**
 * How a polygon is read: the format before 0.141 has a narrower vertex, and its floor coordinates are relative to the
 * cell the polygon is in.
 */
export type PolygonReadOptions = {
  /**
   * Whether the file is of the format before 0.141.
   */
  readonly isLegacy: boolean
  /**
   * The column of the cell the polygon is in.
   */
  readonly cellX: number
  /**
   * The row of the cell the polygon is in.
   */
  readonly cellZ: number
}

/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/graphics/data/FastSceneFormat.h#L81
 */
export type ArxPolygon = {
  vertices: QuadrupleOf<ArxVertex>
  /**
   * Reference to {@link ArxTextureContainer.id}.
   */
  textureContainerId: number
  norm: ArxVector3
  norm2: ArxVector3
  normals?: QuadrupleOf<ArxVector3>
  /**
   * Opacity type and amount when {@link ArxPolygon.flags} & {@link ArxPolygonFlags.Transparent}.
   *
   * @remarks
   * -  2 or more = multiplicative
   * -  1         = additive
   * -  0         = normal
   * - -1 or less = subtractive
   *
   * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/graphics/data/Mesh.cpp#L1102
   */
  transval: number
  area: Float32
  flags: ArxPolygonFlags
  room: number
}

export class Polygon {
  static readFrom(binary: BinaryIO<ArrayBufferLike>, options?: PolygonReadOptions): ArxPolygon {
    const legacy = options?.isLegacy === true
    const cellX = options?.cellX ?? 0
    const cellZ = options?.cellZ ?? 0

    const vertices = times(() => {
      if (legacy) {
        return Vertex.readFromLegacy(binary, cellX, cellZ)
      }

      return Vertex.readFrom(binary)
    }, 4) as QuadrupleOf<ArxVertex>
    const textureContainerId = binary.readInt32()
    const norm = binary.readVector3()
    const norm2 = binary.readVector3()
    const normals = binary.readVector3Array(4) as QuadrupleOf<ArxVector3>
    const transval = binary.readFloat32()
    const area = binary.readFloat32()
    const flags = binary.readInt32()
    const room = binary.readInt16()

    binary.readInt16() // paddy - unused by Arx, always 0

    // the fourth vertex of a triangle is not part of the shape: the old files leave it uninitialized, the newer ones
    // carry zeros there
    if (legacy && !isQuad({ flags })) {
      vertices[3] = { x: 0, y: 0, z: 0, u: 0, v: 0 }
    }

    return { vertices, textureContainerId, norm, norm2, normals, transval, area, flags, room }
  }

  static accumulateFrom(polygon: ArxPolygon): ArrayBuffer {
    const buffer = new ArrayBuffer(Polygon.sizeOf())
    const binary = new BinaryIO(buffer)

    binary.writeBuffer(concatArrayBuffers(polygon.vertices.map(Vertex.accumulateFrom)))
    binary.writeInt32(polygon.textureContainerId)
    binary.writeVector3(polygon.norm)
    binary.writeVector3(polygon.norm2)
    binary.writeVector3Array(polygon.normals ?? [polygon.norm, polygon.norm, polygon.norm, polygon.norm2])
    binary.writeFloat32(polygon.transval)
    binary.writeFloat32(polygon.area)
    binary.writeInt32(polygon.flags)
    binary.writeInt16(polygon.room)
    binary.writeInt16(0) // paddy

    return buffer
  }

  static sizeOf(): number {
    return (
      Vertex.sizeOf() * 4 +
      BinaryIO.sizeOfInt32() * 2 +
      BinaryIO.sizeOfVector3Array(1 + 1 + 4) +
      BinaryIO.sizeOfFloat32() * 2 +
      BinaryIO.sizeOfInt16() * 2
    )
  }

  /**
   * A polygon is considered out of bounds when any of its vertices are not 0 <= x < 16_000 or 0 <= z < 16_000.
   */
  static isOutOfBounds(polygon: ArxPolygon): boolean {
    let numberOfPolygons = 3
    if (isQuad(polygon)) {
      numberOfPolygons = 4
    }

    return polygon.vertices.slice(0, numberOfPolygons).some(({ x, z }) => {
      const fitsX = isBetween(0, MAP_WIDTH_IN_CELLS * 100 - 1, x)
      const fitsZ = isBetween(0, MAP_DEPTH_IN_CELLS * 100 - 1, z)
      return !fitsX || !fitsZ
    })
  }
}
