import { BinaryIO } from '@common/BinaryIO.js'
import { type ArxSetting, Setting } from '@amb/Setting.js'

/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/audio/Ambiance.cpp#L168
 */
export type ArxKey = {
  /** milliseconds */
  start: number
  loop: number
  /** milliseconds */
  delayMin: number
  /** milliseconds */
  delayMax: number
  volume: ArxSetting
  pitch: ArxSetting
  pan: ArxSetting
  x: ArxSetting
  y: ArxSetting
  z: ArxSetting
}

export class Key {
  /**
   * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/audio/Ambiance.cpp#L187
   */
  static readFrom(binary: BinaryIO<ArrayBufferLike>): ArxKey {
    binary.readUint32() // flags - always 0

    return {
      start: binary.readUint32(),
      loop: binary.readUint32() + 1,
      delayMin: binary.readUint32(),
      delayMax: binary.readUint32(),

      volume: Setting.readFrom(binary),
      pitch: Setting.readFrom(binary),
      pan: Setting.readFrom(binary),
      x: Setting.readFrom(binary),
      y: Setting.readFrom(binary),
      z: Setting.readFrom(binary),
    }
  }

  static accumulateFrom(key: ArxKey): ArrayBuffer {
    const buffer = new ArrayBuffer(Key.sizeOf())
    const binary = new BinaryIO(buffer)

    binary.writeUint32(0) // flags
    binary.writeUint32(key.start)
    binary.writeUint32(key.loop - 1)
    binary.writeUint32(key.delayMin)
    binary.writeUint32(key.delayMax)

    binary.writeBuffer(Setting.accumulateFrom(key.volume))
    binary.writeBuffer(Setting.accumulateFrom(key.pitch))
    binary.writeBuffer(Setting.accumulateFrom(key.pan))
    binary.writeBuffer(Setting.accumulateFrom(key.x))
    binary.writeBuffer(Setting.accumulateFrom(key.y))
    binary.writeBuffer(Setting.accumulateFrom(key.z))

    return buffer
  }

  static sizeOf(): number {
    return BinaryIO.sizeOfInt32() * 5 + Setting.sizeOf() * 6
  }
}
