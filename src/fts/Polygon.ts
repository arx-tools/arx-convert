import { BinaryIO } from '@common/BinaryIO.js'
import { MAP_DEPTH_IN_CELLS, MAP_WIDTH_IN_CELLS } from '@common/constants.js'
import { concatArrayBuffers, times } from '@common/helpers.js'
import type { ArxVector3, QuadrupleOf } from '@common/types.js'
// eslint-disable-next-line unused-imports/no-unused-imports -- it is used in jsdoc block
import { ArxTextureContainer } from '@fts/TextureContainer.js'
import { type ArxVertex, Vertex } from '@fts/Vertex.js'
import { isBetween, isQuad } from './helpers.js'

/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/graphics/GraphicsTypes.h#L88
 */
export enum ArxPolygonFlags {
  None = 0,
  NoShadow = 1 << 0,
  DoubleSided = 1 << 1,
  Transparent = 1 << 2,
  Water = 1 << 3,
  Glow = 1 << 4,
  Ignore = 1 << 5,
  Quad = 1 << 6,
  /** unused by arx */
  Tiled = 1 << 7,
  Metal = 1 << 8,
  Hide = 1 << 9,
  Stone = 1 << 10,
  Wood = 1 << 11,
  Gravel = 1 << 12,
  Earth = 1 << 13,
  NoCollision = 1 << 14,
  Lava = 1 << 15,
  Climbable = 1 << 16,
  Falling = 1 << 17,
  NoPath = 1 << 18,
  NoDraw = 1 << 19,
  PrecisePath = 1 << 20,
  // NoClimb = 1 << 21, // unused
  // Angular = 1 << 22, // unused
  // AngularIdx0 = 1 << 23, // unused
  // AngularIdx1 = 1 << 24, // unused
  // AngularIdx2 = 1 << 25, // unused
  // AngularIdx3 = 1 << 26, // unused
  LateMip = 1 << 27,
}

/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/graphics/data/FastSceneFormat.h#L81
 */
export type ArxPolygon = {
  vertices: QuadrupleOf<ArxVertex>
  /**
   * reference to {@link ArxTextureContainer.id}
   */
  textureContainerId: number
  norm: ArxVector3
  norm2: ArxVector3
  normals?: QuadrupleOf<ArxVector3>
  /**
   * Opacity type and amount when {@link ArxPolygon.flags} & {@link ArxPolygonFlags.Transparent}:
   *
   *   -  2 or more = multiplicative
   *   -  1         = additive
   *   -  0         = normal
   *   - -1 or less = subtractive
   *
   * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/graphics/data/Mesh.cpp#L1102
   */
  transval: number
  area: number
  flags: ArxPolygonFlags
  room: number
}

export class Polygon {
  static readFrom(binary: BinaryIO<ArrayBufferLike>): ArxPolygon {
    const data = {
      vertices: times(() => {
        return Vertex.readFrom(binary)
      }, 4) as QuadrupleOf<ArxVertex>,
      textureContainerId: binary.readInt32(),
      norm: binary.readVector3(),
      norm2: binary.readVector3(),
      normals: binary.readVector3Array(4) as QuadrupleOf<ArxVector3>,
      transval: binary.readFloat32(),
      area: binary.readFloat32(),
      flags: binary.readInt32(),
      room: binary.readInt16(),
    }

    binary.readInt16() // paddy - unused by Arx, always 0

    return data
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
   * A polygon is considered out of bounds when any of its vertices are not 0 <= x < 16000 or 0 <= z < 16000
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
