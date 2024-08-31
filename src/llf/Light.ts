import { BinaryIO } from '@common/BinaryIO.js'
import { type ArxColor, Color } from '@common/Color.js'
import { repeat } from '@common/helpers.js'
import { type ArxVector3 } from '@common/types.js'

/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/scene/Light.h#L80
 */
export enum ArxLightFlags {
  None = 0,
  /**
   * Makes the light source dynamic in a way that when combined with other flags it can
   * be manipulated real-time in-game. For example it can be made extinguishable.
   *
   * A non-dynamic light is one that has their effect hardcoded into the polygon's vertex
   * data as vertex lighting.
   */
  SemiDynamic = 1 << 0,
  /**
   * Makes the light source extinguishable with the douse spell (and probably to the arrows too).
   * Also makes it ignitable with the ignite spell.
   *
   * Only works if `SemiDynamic` is also set.
   *
   * @see https://www.youtube.com/watch?v=x8CGx19No4k on how to douse a light source with an arrow
   */
  Extinguishable = 1 << 1,
  /**
   * When `SemiDynamic` is set it makes the light source start turned off.
   * If `Extinguishable` is also set then it can be ignited.
   */
  StartExtinguished = 1 << 2,
  /**
   * On its own it only makes the light source emit fire cracking sounds.
   * When `SemiDynamic` is also set it creates a flare/halo around the light source.
   *
   * The flare's/halo's properties can be controlled by the properties of `ArxLight.ex*` properties
   *
   * Fire only shows if `ArxLight.exFrequency` is > 0
   */
  SpawnFire = 1 << 3,
  /**
   * Similarly to `SpawnFire` this also makes fire cracking sounds on its own.
   * When `SemiDynamic` is set and `ArxLight.exFrequency` is > 0 then it periodically emits
   * smoke particles.
   */
  SpawnSmoke = 1 << 4,
  /**
   * ?
   */
  Off = 1 << 5,
  /**
   * ?
   */
  ColorLegacy = 1 << 6,
  // NoCasted = 1 << 7, // unused
  /**
   * Normally the flare will keep its size relative to the game's window.
   * This flag allows to break from that and have the flare size be tied to the world.
   */
  FixFlareSize = 1 << 8,
  /**
   * ?
   */
  Fireplace = 1 << 9,
  /**
   * Works together with `Extinguishable`.
   * Blocks reacting to the ignite spell cast by the player, the spellcast script command can
   * ignite it though.
   *
   * This doesn't block the light source from reacting to the douse spell.
   */
  NoIgnit = 1 << 10,
  /**
   * ?
   */
  Flare = 1 << 11,
}

/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/scene/LevelFormat.h#L114
 */
export type ArxLight = {
  pos: ArxVector3
  color: ArxColor
  /**
   * The radius of a sphere around `ArxLight.pos` in which the light is at full intensity.
   */
  fallStart: number
  /**
   * The radius of a sphere around `ArxLight.pos` where the light's intensity gradually fades to 0.
   */
  fallEnd: number
  intensity: number
  /**
   * This color periodically overrides `ArxLight.color`. The frequency of the flicker cannot be changed.
   *
   * TODO: what is the frequency?
   *
   * Subtractive color mixing is used, the color will get subtracted from `ArxLight.color` resulting in
   * a negative color.
   */
  exFlicker: ArxColor
  exRadius: number
  /**
   * How frequently should the light source spawn a flame particle when `ArxLight.flags` has `ArxLightFlags.SpawnFire`
   * set, or a smoke particle when `ArxLight.flags` has `ArxLightFlags.SpawnSmoke` set
   *
   * The range is between 0.0 and 1.0 where 0 completely stops fire from spawning.
   */
  exFrequency: number
  /**
   * Size of the fire/smoke particles if `ArxLightFlags.SpawnFire` or `ArxLightFlags.SpawnSmoke` is set.
   *
   * The value is supposed to be set between 0.0 and 1.0, but it can go over 1.0 for extreme effect.
   */
  exSize: number
  /**
   * How far the fire/smoke particles go during the time they are alive. A larger number will make the particles
   * shoot up like a fountain, a smaller number will make all of them stay in one place.
   *
   * The value is supposed to be set between 0.0 and 1.0, but it can go over 1.0 for extreme effect.
   */
  exSpeed: number
  /**
   * The radius of the flare/halo when `ArxLight.flags` has `ArxLightFlags.SpawnFire` set.
   *
   * Danae only allows setting it to a maximum of 200, but there isn't any limitiations in the code
   */
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
    }

    binary.readFloat32() // i - always 0

    const dataBlock2 = {
      exFlicker: Color.readFrom(binary, 'rgb'),
      exRadius: binary.readFloat32(),
      exFrequency: binary.readFloat32(),
      exSize: binary.readFloat32(),
      exSpeed: binary.readFloat32(),
      exFlareSize: binary.readFloat32(),
    }

    binary.readFloat32Array(24) // fpad - ?

    const flags = binary.readInt32()

    binary.readInt32Array(31) // lpad - ?

    return {
      ...dataBlock1,
      ...dataBlock2,
      flags,
    }
  }

  static accumulateFrom(light: ArxLight): Buffer {
    const buffer = Buffer.alloc(Light.sizeOf())
    const binary = new BinaryIO(buffer)

    binary.writeVector3(light.pos)
    binary.writeBuffer(Color.accumulateFrom(light.color, 'rgb'))
    binary.writeFloat32(light.fallStart)
    binary.writeFloat32(light.fallEnd)
    binary.writeFloat32(light.intensity)

    binary.writeFloat32(0) // i

    binary.writeBuffer(Color.accumulateFrom(light.exFlicker, 'rgb'))
    binary.writeFloat32(light.exRadius)
    binary.writeFloat32(light.exFrequency)
    binary.writeFloat32(light.exSize)
    binary.writeFloat32(light.exSpeed)
    binary.writeFloat32(light.exFlareSize)

    binary.writeFloat32Array(repeat(0, 24)) // fpad

    binary.writeInt32(light.flags)

    binary.writeInt32Array(repeat(0, 31)) // lpad

    return buffer
  }

  static sizeOf(): number {
    return (
      BinaryIO.sizeOfVector3() +
      Color.sizeOf('rgb') * 2 +
      BinaryIO.sizeOfFloat32Array(9 + 24) +
      BinaryIO.sizeOfInt32Array(32)
    )
  }
}
