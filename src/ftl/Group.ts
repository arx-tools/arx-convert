import { BinaryIO } from '@common/BinaryIO.js'

/** @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/graphics/data/FTLFormat.h#L122 */
export type ArxGroup = {
  name: string
  origin: number
  indices: number[]
  blobShadowSize: number
}

export class Group {
  static readFrom(binary: BinaryIO): ArxGroup & { numberOfIndices: number } {
    const data = {
      name: binary.readString(256),
      origin: binary.readUint32(),
      numberOfIndices: binary.readInt32(),
    }

    binary.readInt32() // indexes - ignored by Arx

    return {
      ...data,
      blobShadowSize: binary.readFloat32(),
      indices: [], // will get filled separately
    }
  }

  static accumulateFrom(group: ArxGroup): ArrayBuffer {
    const buffer = new ArrayBuffer(Group.sizeOf())
    const binary = new BinaryIO(buffer)

    binary.writeString(group.name, 256)
    binary.writeUint32(group.origin)
    binary.writeInt32(group.indices.length)
    binary.writeInt32(0) // indexes
    binary.writeFloat32(group.blobShadowSize)

    return buffer
  }

  static sizeOf(): number {
    return BinaryIO.sizeOfString(256) + BinaryIO.sizeOfUint32() + 2 * BinaryIO.sizeOfInt32() + BinaryIO.sizeOfFloat32()
  }
}
