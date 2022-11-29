import { Buffer } from 'node:buffer'
import { BinaryIO } from '../binary/BinaryIO'
import { ArxColor, Color } from '../common/Color'
import { repeat } from '../common/helpers'
import { ArxRotation, ArxVector3 } from '../types'

export type ArxFog = {
  pos: ArxVector3
  rgb: ArxColor
  size: number
  special: number
  scale: number
  move: ArxVector3
  angle: ArxRotation
  speed: number
  rotateSpeed: number
  toLive: number
  blend: number
  frequency: number
}

export class Fog {
  static readFrom(binary: BinaryIO) {
    const data: ArxFog = {
      pos: binary.readVector3(),
      rgb: Color.readFrom(binary, 'rgb'),
      size: binary.readFloat32(),
      special: binary.readInt32(),
      scale: binary.readFloat32(),
      move: binary.readVector3(),
      angle: binary.readRotation(),
      speed: binary.readFloat32(),
      rotateSpeed: binary.readFloat32(),
      toLive: binary.readInt32(),
      blend: binary.readInt32(),
      frequency: binary.readFloat32(),
    }

    binary.readFloat32Array(32) // fpad
    binary.readInt32Array(32) // lpad
    binary.readString(256) // cpad

    return data
  }

  static accumulateFrom(fog: ArxFog) {
    const buffer = Buffer.alloc(Fog.sizeOf())
    const binary = new BinaryIO(buffer.buffer)

    binary.writeVector3(fog.pos)
    binary.writeBuffer(Color.accumulateFrom(fog.rgb, 'rgb'))
    binary.writeFloat32(fog.size)
    binary.writeInt32(fog.special)
    binary.writeFloat32(fog.scale)
    binary.writeVector3(fog.move)
    binary.writeRotation(fog.angle)
    binary.writeFloat32(fog.speed)
    binary.writeFloat32(fog.rotateSpeed)
    binary.writeInt32(fog.toLive)
    binary.writeInt32(fog.blend)
    binary.writeFloat32(fog.frequency)

    binary.writeFloat32Array(repeat(0, 32))
    binary.writeInt32Array(repeat(0, 32))
    binary.writeString('', 256)

    return buffer
  }

  static sizeOf() {
    return 3 * 4 + 3 * 4 + 4 + 4 + 4 + 3 * 4 + 3 * 4 + 4 + 4 + 4 + 4 + 4 + 32 * 4 + 32 * 4 + 256
  }
}
