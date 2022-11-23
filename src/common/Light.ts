import { BinaryIO } from '../binary/BinaryIO'
import { ArxColor, Color } from './Color'
import { repeat } from './helpers'
import { ArxVector3 } from './types'

export enum ArxLightFlags {
  None = 0,
  SemiDynamic = 1 << 0,
  Extinguishable = 1 << 1,
  StartExtinguished = 1 << 2,
  SpawnFire = 1 << 3,
  SpawnSmoke = 1 << 4,
  Off = 1 << 5,
  ColorLegacy = 1 << 6,
  NoCasted = 1 << 7, // unused
  FixFlareSize = 1 << 8,
  Fireplace = 1 << 9,
  NoIgnit = 1 << 10, // it will not react to player casting ignite spell, but douse will still work!
  Flare = 1 << 11,
}

export type ArxLight = {
  pos: ArxVector3
  rgb: ArxColor
  fallstart: number
  fallend: number
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
  static readFrom(binary: BinaryIO) {
    const data: ArxLight = {
      pos: binary.readVector3(),
      rgb: Color.readFrom(binary, 'rgb'),
      fallstart: binary.readFloat32(),
      fallend: binary.readFloat32(),
      intensity: binary.readFloat32(),
      i: binary.readFloat32(),
      exFlicker: Color.readFrom(binary, 'rgb'),
      exRadius: binary.readFloat32(),
      exFrequency: binary.readFloat32(),
      exSize: binary.readFloat32(),
      exSpeed: binary.readFloat32(),
      exFlareSize: binary.readFloat32(),
      flags: ArxLightFlags.None,
    }

    binary.readFloat32Array(24) // fpad

    data.flags = binary.readInt32()

    binary.readInt32Array(31) // lpad

    return data
  }

  static accumulateFrom(light: ArxLight) {
    const buffer = Buffer.alloc(Light.sizeOf())
    const binary = new BinaryIO(buffer.buffer)

    binary.writeVector3(light.pos)
    binary.writeBuffer(Color.accumulateFrom(light.rgb, 'rgb'))
    binary.writeFloat32(light.fallstart)
    binary.writeFloat32(light.fallend)
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
    return 296
  }
}
