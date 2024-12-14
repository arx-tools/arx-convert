import { Buffer } from 'node:buffer'
import { BinaryIO } from '@common/BinaryIO.js'

/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/audio/Ambiance.cpp#L84
 */
export enum ArxSettingFlag {
  None = 0,
  Random = 1 << 0,
  Interpolate = 1 << 1,
}

/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/audio/Ambiance.cpp#L90
 */
export type ArxSetting = {
  min: number
  max: number
  /** milliseconds */
  interval: number
  flags: ArxSettingFlag
}

export class Setting {
  /**
   * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/audio/Ambiance.cpp#L107
   */
  static readFrom(binary: BinaryIO): ArxSetting {
    return {
      min: binary.readFloat32(),
      max: binary.readFloat32(),
      interval: binary.readUint32(),
      flags: binary.readUint32(),
    }
  }

  static accumulateFrom(setting: ArxSetting): Buffer {
    const buffer = Buffer.alloc(Setting.sizeOf())
    const binary = new BinaryIO(buffer)

    binary.writeFloat32(setting.min)
    binary.writeFloat32(setting.max)
    binary.writeUint32(setting.interval)
    binary.writeUint32(setting.flags)

    return buffer
  }

  static sizeOf(): number {
    return BinaryIO.sizeOfFloat32() * 2 + BinaryIO.sizeOfInt32() * 2
  }
}
