import { Buffer } from 'node:buffer'
import { BinaryIO } from '../common/BinaryIO'
import { ArxVector3 } from '../types'
import { ArxAnchor } from './Anchor'

export type ArxAnchorData = {
  pos: ArxVector3
  radius: number
  height: number
  numberOfLinkedAnchors: number
  flags: number
}

export class AnchorData {
  static readFrom(binary: BinaryIO): ArxAnchorData {
    return {
      pos: binary.readVector3(),
      radius: binary.readFloat32(),
      height: binary.readFloat32(),
      numberOfLinkedAnchors: binary.readInt16(),
      flags: binary.readInt16(),
    }
  }

  static accumulateFrom(anchor: ArxAnchor) {
    const buffer = Buffer.alloc(AnchorData.sizeOf())
    const binary = new BinaryIO(buffer.buffer)

    binary.writeVector3(anchor.data.pos)
    binary.writeFloat32(anchor.data.radius)
    binary.writeFloat32(anchor.data.height)
    binary.writeInt16(anchor.linkedAnchors.length)
    binary.writeInt16(anchor.data.flags)

    return buffer
  }

  static sizeOf() {
    return BinaryIO.sizeOfVector3() + BinaryIO.sizeOfFloat32Array(2) + BinaryIO.sizeOfInt16Array(2)
  }
}
