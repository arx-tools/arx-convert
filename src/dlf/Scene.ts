import { Buffer } from 'node:buffer'
import { BinaryIO } from '../common/BinaryIO'
import { repeat } from '../common/helpers'

/** @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/scene/LevelFormat.h#L88 */
export type ArxScene = {
  levelIdx: number
}

export class Scene {
  static readFrom(binary: BinaryIO) {
    const name = binary.readString(512)

    const data: ArxScene = {
      levelIdx: Scene.pathToLevelIdx(name),
    }

    binary.readInt32Array(16) // pad
    binary.readFloat32Array(16) // fpad

    return data
  }

  static accumulateFrom(scene: ArxScene) {
    const buffer = Buffer.alloc(Scene.sizeOf())
    const binary = new BinaryIO(buffer.buffer)

    binary.writeString(Scene.levelIdxToPath(scene.levelIdx), 512)
    binary.writeInt32Array(repeat(0, 16))
    binary.writeFloat32Array(repeat(0, 16))

    return buffer
  }

  static pathToLevelIdx(path: string) {
    return parseInt(path.replace('Graph\\Levels\\Level', '').replace('\\', ''))
  }

  static levelIdxToPath(levelIdx: number) {
    return `Graph\\Levels\\Level${levelIdx}\\`
  }

  static sizeOf() {
    return BinaryIO.sizeOfString(512) + BinaryIO.sizeOfInt32Array(16) + BinaryIO.sizeOfFloat32Array(16)
  }
}
