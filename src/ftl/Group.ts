import { Buffer } from 'node:buffer'
import { BinaryIO } from '@common/BinaryIO'

/** @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/graphics/data/FTLFormat.h#L122 */
export type ArxGroup = {
  name: string
  origin: number
  numberOfIndices: number
  blobShadowSize: number
}

export class Group {
  static readFrom(binary: BinaryIO): ArxGroup {
    const data = {
      name: binary.readString(256),
      origin: binary.readUint32(),
      numberOfIndices: binary.readInt32(),
    }

    binary.readInt32() // indexes - not read by Arx

    return {
      ...data,
      blobShadowSize: binary.readFloat32(),
    }
  }

  static accumulateFrom(group: ArxGroup) {
    const buffer = Buffer.alloc(Group.sizeOf())
    const binary = new BinaryIO(buffer)

    binary.writeString(group.name, 256)
    binary.writeUint32(group.origin)
    binary.writeInt32(group.numberOfIndices)
    binary.writeInt32(0) // indexes
    binary.writeFloat32(group.blobShadowSize)

    return buffer
  }

  static sizeOf() {
    return BinaryIO.sizeOfString(256) + BinaryIO.sizeOfUint32() + 2 * BinaryIO.sizeOfInt32() + BinaryIO.sizeOfFloat32()
  }
}
