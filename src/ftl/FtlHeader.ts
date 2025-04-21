import { BinaryIO } from '@common/BinaryIO.js'
import type { ArxFTL } from '@ftl/FTL.js'
import { VERSION } from '@ftl/constants.js'

/** @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/graphics/data/FTLFormat.h#L86 */
export type ArxFtlHeader = {
  numberOfVertices: number
  numberOfFaces: number
  numberOfTextures: number
  numberOfGroups: number
  numberOfActions: number
  numberOfSelections: number
  origin: number
  name: string
}

export class FtlHeader {
  static readFrom(binary: BinaryIO<ArrayBufferLike>): ArxFtlHeader {
    binary.readString(4) // identifier - always "FTL\0"
    binary.readFloat32() // version - always 0.832_570_016_384_124_8
    binary.readString(512) // checksum - contains data, but ArxLibertatis doesn't read it
    binary.readInt32() // 3d data offset - always 544
    binary.readInt32() // cylinder offset - always -1, ignored by arx
    binary.readInt32() // progressive data offset - always -1, ignored by arx
    binary.readInt32() // clothes data offset - mostly -1, ignored by arx
    binary.readInt32() // collision sphere offset - always -1, ignored by arx
    binary.readInt32() // physics box offset - always -1, ignored by arx

    return {
      numberOfVertices: binary.readInt32(),
      numberOfFaces: binary.readInt32(),
      numberOfTextures: binary.readInt32(),
      numberOfGroups: binary.readInt32(),
      numberOfActions: binary.readInt32(),
      numberOfSelections: binary.readInt32(),
      origin: binary.readUint32(),
      name: binary.readString(256),
    }
  }

  static accumulateFrom(json: ArxFTL): ArrayBuffer {
    const buffer = new ArrayBuffer(FtlHeader.sizeOf())
    const binary = new BinaryIO(buffer)

    binary.writeString('FTL', 4)
    binary.writeFloat32(VERSION)
    binary.writeString('', 512) // checksum
    binary.writeInt32(544) // 3d data offset
    binary.writeInt32(-1) // cylinder offset
    binary.writeInt32(-1) // progressive data offset
    binary.writeInt32(-1) // clothes data offset
    binary.writeInt32(-1) // collision sphere offset
    binary.writeInt32(-1) // physics box offset
    binary.writeInt32(json.vertices.length)
    binary.writeInt32(json.faces.length)
    binary.writeInt32(json.textureContainers.length)
    binary.writeInt32(json.groups.length)
    binary.writeInt32(json.actions.length)
    binary.writeInt32(json.selections.length)
    binary.writeUint32(json.header.origin)
    binary.writeString(json.header.name, 256)

    return buffer
  }

  static sizeOf(): number {
    return (
      BinaryIO.sizeOfString(4) +
      BinaryIO.sizeOfFloat32() +
      BinaryIO.sizeOfString(512) +
      12 * BinaryIO.sizeOfInt32() +
      BinaryIO.sizeOfUint32() +
      BinaryIO.sizeOfString(256)
    )
  }
}
