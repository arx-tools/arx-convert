import { BinaryIO } from '@common/BinaryIO.js'
import { repeat } from '@common/helpers.js'

/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/scene/LevelFormat.h#L88
 */
export type ArxScene = {
  levelIdx: number
}

export class Scene {
  static readFrom(binary: BinaryIO): ArxScene {
    const levelIdx = Scene.pathToLevelIdx(binary.readString(512))

    binary.readInt32Array(16) // pad - ?
    binary.readFloat32Array(16) // fpad - ?

    return {
      levelIdx,
    }
  }

  static accumulateFrom(scene: ArxScene): Uint8Array {
    const buffer = new Uint8Array(Scene.sizeOf())
    const binary = new BinaryIO(buffer)

    binary.writeString(Scene.levelIdxToPath(scene.levelIdx), 512)
    binary.writeInt32Array(repeat(0, 16)) // pad
    binary.writeFloat32Array(repeat(0, 16)) // fpad

    return buffer
  }

  static pathToLevelIdx(path: string): number {
    return Number.parseInt(path.toLowerCase().replace('graph\\levels\\level', '').replace('\\', ''), 10)
  }

  static levelIdxToPath(levelIdx: number): string {
    return `Graph\\Levels\\level${levelIdx}\\`
  }

  static sizeOf(): number {
    return BinaryIO.sizeOfString(512) + BinaryIO.sizeOfInt32Array(16) + BinaryIO.sizeOfFloat32Array(16)
  }
}
