import { Buffer } from 'node:buffer'
import { BinaryIO } from '../binary/BinaryIO'
import { repeat } from '../common/helpers'

export type ArxScene = {
  name: string
}

export class Scene {
  static readFrom(binary: BinaryIO) {
    const data: ArxScene = {
      name: binary.readString(512),
    }

    binary.readInt32Array(16) // pad
    binary.readFloat32Array(16) // fpad

    return data
  }

  static accumulateFrom(scene: ArxScene) {
    const buffer = Buffer.alloc(Scene.sizeOf())
    const binary = new BinaryIO(buffer.buffer)

    binary.writeString(scene.name, 512)
    binary.writeInt32Array(repeat(0, 16))
    binary.writeFloat32Array(repeat(0, 16))

    return buffer
  }

  static sizeOf() {
    return 512 + 4 * 16 + 4 * 16
  }
}
