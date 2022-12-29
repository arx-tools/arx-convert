import { Buffer } from 'node:buffer'
import { BinaryIO } from '../common/BinaryIO'
import { ArxColor, Color } from '../common/Color'
import { repeat } from '../common/helpers'
import { ArxRotation, ArxVector3 } from '../common/types'

/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/scene/LevelFormat.h#L132
 */
export type ArxFog = {
  pos: ArxVector3
  color: ArxColor
  size: number
  /** either 0 or 1 - ? */
  special: number
  scale: number
  /** a normal vector, all axis are between -1 and 1 */
  move: ArxVector3
  angle: ArxRotation
  speed: number
  rotateSpeed: number
  /** milliseconds */
  toLive: number
  frequency: number
}

export class Fog {
  static readFrom(binary: BinaryIO): ArxFog {
    const dataBlock1 = {
      pos: binary.readVector3(),
      color: Color.readFrom(binary, 'rgb'),
      size: binary.readFloat32(),
      special: binary.readInt32(),
      scale: binary.readFloat32(),
      move: binary.readVector3(),
      angle: binary.readRotation(),
      speed: binary.readFloat32(),
      rotateSpeed: binary.readFloat32(),
      toLive: binary.readInt32(),
    }

    binary.readInt32() // blend - always 0

    const frequency = binary.readFloat32()

    binary.readFloat32Array(32) // fpad - ?
    binary.readInt32Array(32) // lpad - ?
    binary.readString(256) // cpad - ?

    return {
      ...dataBlock1,
      frequency,
    }
  }

  static accumulateFrom(fog: ArxFog) {
    const buffer = Buffer.alloc(Fog.sizeOf())
    const binary = new BinaryIO(buffer.buffer)

    binary.writeVector3(fog.pos)
    binary.writeBuffer(Color.accumulateFrom(fog.color, 'rgb'))
    binary.writeFloat32(fog.size)
    binary.writeInt32(fog.special)
    binary.writeFloat32(fog.scale)
    binary.writeVector3(fog.move)

    binary.writeRotation(fog.angle)
    binary.writeFloat32(fog.speed)
    binary.writeFloat32(fog.rotateSpeed)
    binary.writeInt32(fog.toLive)
    binary.writeInt32(0) // blend
    binary.writeFloat32(fog.frequency)

    binary.writeFloat32Array(repeat(0, 32)) // fpad
    binary.writeInt32Array(repeat(0, 32)) // lpad
    binary.writeString('', 256) // cpad

    return buffer
  }

  static sizeOf() {
    return (
      BinaryIO.sizeOfVector3() +
      Color.sizeOf('rgb') +
      BinaryIO.sizeOfFloat32Array(2) +
      BinaryIO.sizeOfInt32() +
      BinaryIO.sizeOfVector3() +
      BinaryIO.sizeOfRotation() +
      BinaryIO.sizeOfFloat32Array(3) +
      BinaryIO.sizeOfInt32Array(2) +
      BinaryIO.sizeOfFloat32Array(32) +
      BinaryIO.sizeOfInt32Array(32) +
      BinaryIO.sizeOfString(256)
    )
  }
}
