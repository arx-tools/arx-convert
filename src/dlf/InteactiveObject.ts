import { Buffer } from 'node:buffer'
import { BinaryIO } from '../common/BinaryIO'
import { repeat } from '../common/helpers'
import { ArxRotation, ArxVector3 } from '../types'

export type ArxInteractiveObject = {
  name: string
  pos: ArxVector3
  angle: ArxRotation
  identifier: number
  flags: number
}

export class InteractiveObject {
  static readFrom(binary: BinaryIO) {
    const data: ArxInteractiveObject = {
      name: binary.readString(512),
      pos: binary.readVector3(),
      angle: binary.readRotation(),
      identifier: binary.readInt32(), // could also be a 4 byte string?
      flags: binary.readInt32(),
    }

    binary.readInt32Array(14) // pad
    binary.readFloat32Array(16) // fpad

    return data
  }

  static accumulateFrom(interactiveObject: ArxInteractiveObject) {
    const buffer = Buffer.alloc(InteractiveObject.sizeOf())
    const binary = new BinaryIO(buffer.buffer)

    binary.writeString(interactiveObject.name, 512)
    binary.writeVector3(interactiveObject.pos)
    binary.writeRotation(interactiveObject.angle)
    binary.writeInt32(interactiveObject.identifier)
    binary.writeInt32(interactiveObject.flags)

    binary.writeInt32Array(repeat(0, 14))
    binary.writeFloat32Array(repeat(0, 16))

    return buffer
  }

  static sizeOf() {
    return (
      BinaryIO.sizeOfString(512) +
      BinaryIO.sizeOfVector3() +
      BinaryIO.sizeOfRotation() +
      BinaryIO.sizeOfInt32Array(16) +
      BinaryIO.sizeOfFloat32Array(16)
    )
  }
}
