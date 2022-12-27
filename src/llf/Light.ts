import { BinaryIO } from '../common/BinaryIO'
import { ArxColor, Color } from '../common/Color'
import { repeat } from '../common/helpers'
import { ArxVector3 } from '../common/types'

/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/scene/Light.h#L80
 */
export enum ArxLightFlags {
  None = 0,
  SemiDynamic = 1 << 0,
  Extinguishable = 1 << 1,
  StartExtinguished = 1 << 2,
  SpawnFire = 1 << 3,
  SpawnSmoke = 1 << 4,
  Off = 1 << 5,
  ColorLegacy = 1 << 6,
  // NoCasted = 1 << 7, // unused
  FixFlareSize = 1 << 8,
  Fireplace = 1 << 9,
  /** blocks reacting to the player casting ignite spell, but douse will still work! */
  NoIgnit = 1 << 10,
  Flare = 1 << 11,
}

/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/scene/LevelFormat.h#L114
 */
export type ArxLight = {
  pos: ArxVector3
  color: ArxColor
  fallStart: number
  fallEnd: number
  intensity: number
  i: number
  exFlicker: ArxColor
  exRadius: number
  exFrequency: number
  exSize: number
  exSpeed: number
  exFlareSize: number
  flags: ArxLightFlags
}

export class Light {
  static readFrom(binary: BinaryIO): ArxLight {
    const dataBlock1 = {
      pos: binary.readVector3(),
      color: Color.readFrom(binary, 'rgb'),
      fallStart: binary.readFloat32(),
      fallEnd: binary.readFloat32(),
      intensity: binary.readFloat32(),
      i: binary.readFloat32(),
      exFlicker: Color.readFrom(binary, 'rgb'),
      exRadius: binary.readFloat32(),
      exFrequency: binary.readFloat32(),
      exSize: binary.readFloat32(),
      exSpeed: binary.readFloat32(),
      exFlareSize: binary.readFloat32(),
    }

    binary.readFloat32Array(24) // fpad - ?

    const dataBlock2 = {
      flags: binary.readInt32(),
    }

    binary.readInt32Array(31) // lpad - ?

    return {
      ...dataBlock1,
      ...dataBlock2,
    }
  }

  static accumulateFrom(light: ArxLight) {
    const buffer = Buffer.alloc(Light.sizeOf())
    const binary = new BinaryIO(buffer.buffer)

    binary.writeVector3(light.pos)
    binary.writeBuffer(Color.accumulateFrom(light.color, 'rgb'))
    binary.writeFloat32(light.fallStart)
    binary.writeFloat32(light.fallEnd)
    binary.writeFloat32(light.intensity)
    binary.writeFloat32(light.i)
    binary.writeBuffer(Color.accumulateFrom(light.exFlicker, 'rgb'))
    binary.writeFloat32(light.exRadius)
    binary.writeFloat32(light.exFrequency)
    binary.writeFloat32(light.exSize)
    binary.writeFloat32(light.exSpeed)
    binary.writeFloat32(light.exFlareSize)

    binary.writeFloat32Array(repeat(0, 24))

    binary.writeInt32(light.flags)

    binary.writeInt32Array(repeat(0, 31))

    return buffer
  }

  static sizeOf() {
    return (
      BinaryIO.sizeOfVector3() +
      Color.sizeOf('rgb') * 2 +
      BinaryIO.sizeOfFloat32Array(9 + 24) +
      BinaryIO.sizeOfInt32Array(32)
    )
  }
}
