import { BinaryIO } from '@common/BinaryIO.js'
import { type ArxColor, Color } from '@common/Color.js'
import { clamp, repeat } from '@common/helpers.js'
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
   * Unused
   *
   * Not used by any of the lights on the existing arx levels, nor is it used in Danae, AF or AL.
   */
  Off = 1 << 5,
  /**
   * If set then the fire/smoke particles will take on the color from `ArxLight.color`, otherwise
   * they are white.
   * If `SpawnFire` is set, then the flames will take on the colors, but the smoke particles will
   * remain white.
   */
  ColorLegacy = 1 << 6,
  /**
   * Only used by DANAE. Arx Fatalis 1.21 and Arx Libertatis ignores it.
   *
   * It supposed to have been used to control whether a shadow casting should be taken into consideration
   * when calculating vertex lighting.
   *
   * @see https://github.com/arx/ArxLibertatis/blob/ArxFatalis-1.21/Sources/EERIE/EERIELight.cpp#L504
   */
  NoCasted = 1 << 7,
  /**
   * Normally the flare will keep its size relative to the game's window.
   * This flag allows to break from that and have the flare size be tied to the world.
   */
  FixFlareSize = 1 << 8,
  /**
   * When the halo/flare size is automatically set then this flag makes it slightly larger.
   *
   * Unless `Flare` is explicitly set the halo's size is 80, but if `Fireplace` is also set,
   * then it becomes 95.
   *
   * @see https://github.com/arx/ArxLibertatis/blob/ArxFatalis-1.21/Sources/DANAE/DanaeSaveLoad.cpp#L1618
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
   * This makes that a light source has a halo around it. If `SpawnFire` is set, then this
   * flag automatically/implicitly gets set as you can't have fire without a flare.
   *
   * When this flag is explicitly set the size of the halo can be changed with `ArxLight.exFlareSize`.
   * Otherwise the halo's size is 80, but if `Fireplace` flag is set, then it's 95.
   *
   * @see https://github.com/arx/ArxLibertatis/blob/ArxFatalis-1.21/Sources/DANAE/DanaeSaveLoad.cpp#L1618
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
  /**
   * How bright the light is.
   */
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
  /**
   * Determines the spread of the smoke and fire particles: creates a circle around the center of the
   * light with a radius of `exRadius`.
   *
   * When `SpawnFire` is set, then it also sets the radius of the spheare around the light's center which
   * harms the NPCs and the player with fire damage when getting in contact.
   *
   * BUG: Surprisingly the spread is not even, particles to the left of the light (negative on the X axis)
   * don't spawn, only to the right.
   *
   * @see https://imgur.com/a/cN3if0A
   */
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
   * The radius of the flare/halo when `ArxLightFlags.Flare` is set.
   * The value of exFlareSize is ignored when `ArxLightFlags.FixFlareSize` is set.
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
    binary.writeFloat32(clamp(0, Number.MAX_SAFE_INTEGER, light.exSpeed))
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
