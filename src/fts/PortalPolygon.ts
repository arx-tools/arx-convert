import { BinaryIO } from '@common/BinaryIO.js'
import { concatArrayBuffers, times } from '@common/helpers.js'
import { type ArxVector3, type QuadrupleOf } from '@common/types.js'
import { ArxPolygonFlags } from '@fts/Polygon.js'
import { type ArxTextureVertex, TextureVertex } from '@fts/TextureVertex.js'

// found in levels < 10
// prettier-ignore
const HARDCODED_DATA_TYPE1 = [
   56, 242,  22,   1,    40,  22, 105,   0,   231, 255, 255, 255,     0,   0,   0,   0,
  159, 199,  92,   0,   172, 141, 105,   0,    25,   0,   0,   0,   100, 242,  22,   1,
   56, 242,  22,   1,     0,   0,   0,   0,   255, 255, 255, 255,   184, 255, 165,   0,
  255, 255, 255, 255,   144, 242,  22,   1,   126, 200,  92,   0,    92,   0,   0,   0,
  168, 242,  22,   1,   124, 242,  22,   1,    40,  22, 105,   0,   236, 255, 255, 255,
    0,   0,   0,   0,   159, 199,  92,   0,   172,  30, 166,   0,    20,   0,   0,   0,
  168, 242,  22,   1,   124, 242,  22,   1,   253, 243,  22,   1,   193,  30, 166,   0,
  160,  74, 244,   0,     0,   0,   0,   0,     0,   0,   0,   0,     0,   0,   0,   0,
]

// found in levels >= 10
const HARDCODED_DATA_TYPE2 = [...HARDCODED_DATA_TYPE1]
HARDCODED_DATA_TYPE2[0x4c] = HARDCODED_DATA_TYPE2[0x4c] - 1
HARDCODED_DATA_TYPE2[0x5c] = HARDCODED_DATA_TYPE2[0x5c] + 1
HARDCODED_DATA_TYPE2[0x68] = HARDCODED_DATA_TYPE2[0x68] + 1
HARDCODED_DATA_TYPE2[0x6c] = HARDCODED_DATA_TYPE2[0x6c] + 1

/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/graphics/data/FastSceneFormat.h#L136
 */
export type ArxPortalPolygon = {
  min: ArxVector3
  max: ArxVector3
  norm: ArxVector3
  norm2: ArxVector3
  vertices: QuadrupleOf<ArxTextureVertex>
  center: ArxVector3
}

export class PortalPolygon {
  static readFrom(binary: BinaryIO<ArrayBufferLike>): ArxPortalPolygon {
    binary.readInt32() // type - in 2 occasions on level 2 it's 0, all other cases it's 64 (ArxPolygonFlags.Quad)

    const dataBlock = {
      min: binary.readVector3(),
      max: binary.readVector3(),
      norm: binary.readVector3(),
      norm2: binary.readVector3(),
      vertices: times(() => {
        return TextureVertex.readFrom(binary)
      }, 4) as QuadrupleOf<ArxTextureVertex>,
    }

    binary.readUint8Array(32 * 4) // "unused" - can be one of HARDCODED_DATA_TYPE variants
    binary.readVector3Array(4) as QuadrupleOf<ArxVector3> // normals - always 0/0/0 * 4
    binary.readInt32() // texture container id - always 0

    const center = binary.readVector3()

    binary.readFloat32() // transval - always 0
    binary.readFloat32() // area - always 0
    binary.readInt16() // room - always 0
    binary.readInt16() // misc - always 0

    return {
      ...dataBlock,
      center,
    }
  }

  static accumulateFrom(portalPolygon: ArxPortalPolygon, levelIdx: number): ArrayBuffer {
    const buffer = new ArrayBuffer(PortalPolygon.sizeOf())
    const binary = new BinaryIO(buffer)

    binary.writeInt32(ArxPolygonFlags.Quad)
    binary.writeVector3(portalPolygon.min)
    binary.writeVector3(portalPolygon.max)
    binary.writeVector3(portalPolygon.norm)
    binary.writeVector3(portalPolygon.norm2)
    binary.writeBuffer(
      concatArrayBuffers(
        portalPolygon.vertices.map((vertex, idx) => {
          return TextureVertex.accumulateFrom(vertex, idx)
        }),
      ),
    )

    // "unused"
    if (levelIdx < 10) {
      binary.writeUint8Array(HARDCODED_DATA_TYPE1)
    } else {
      binary.writeUint8Array(HARDCODED_DATA_TYPE2)
    }

    binary.writeVector3Array([
      // normals
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 0, z: 0 },
    ])
    binary.writeInt32(0) // textureContainerId
    binary.writeVector3(portalPolygon.center)
    binary.writeFloat32(0) // transval
    binary.writeFloat32(0) // area
    binary.writeInt16(0) // room
    binary.writeInt16(0) // misc

    return buffer
  }

  static sizeOf(): number {
    return (
      BinaryIO.sizeOfInt32() +
      BinaryIO.sizeOfVector3Array(4) +
      TextureVertex.sizeOf() * 4 +
      BinaryIO.sizeOfUint8Array(32 * 4) +
      BinaryIO.sizeOfVector3Array(4) +
      BinaryIO.sizeOfInt32() +
      BinaryIO.sizeOfVector3() +
      BinaryIO.sizeOfFloat32Array(2) +
      BinaryIO.sizeOfInt16Array(2)
    )
  }
}
