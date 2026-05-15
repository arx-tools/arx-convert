import { BinaryIO } from '@common/BinaryIO.js'
import { repeat, times } from '@common/helpers.js'
import type { ArxQuaternion, ArxVector3 } from '@common/types.js'
import { TEA_VERSION_NEW, TEA_VERSION_OLD } from '@tea/constants.js'
import type { ArxTheaSample } from '@tea/types.js'

/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/animation/Animation.h#L131
 * @see https://github.com/arx/ArxLibertatis/blob/ArxFatalis-1.21/Sources/Include/EERIETypes.h#L667
 */
export enum ArxAnimationPlayingFlags {
  None = 0,
  /**
   * Must be looped at end (indefinitely...)
   */
  Loop = 1 << 0,
  /**
   * Is played in reverse (from end to start)
   */
  Reverse = 1 << 1,
  /**
   * Is paused
   */
  Paused = 1 << 2,
  /**
   * Has just finished
   */
  AnimEnd = 1 << 3,
  /**
   * Is a static Anim (no movement offset returned)
   */
  StaticAnim = 1 << 4,
  /**
   * Must be stopped at end
   */
  StopEnd = 1 << 5,
  /**
   * User controlled... MUST be played...
   */
  ForcePlay = 1 << 6,
  /**
   * ctime externally set, no update
   */
  ExControl = 1 << 7,
}

/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/animation/AnimationFormat.h#L116
 */
export type ArxTheoAnimationGroup = {
  isKey: boolean
  /**
   * if value is missing than it means it's a quaternion with 0/0/0/1 values
   */
  quaternion?: ArxQuaternion
  /**
   * if value is missing than it means it's a vector with 0/0/0 values
   */
  translate?: ArxVector3
  /**
   * if value is missing than it means it's a vector with 0/0/0 values
   */
  zoom?: ArxVector3
}

/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/animation/AnimationFormat.h#L91 - old keyframe format
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/animation/AnimationFormat.h#L102 - new keyframe format
 *
 * The new keyframe format contains an "info_frame" field, but the runtime code doesn't use it, it holds no data or garbage
 *
 * The original data is extended with optional fields that get computed when parsing keyframe data
 */
export type ArxKeyFrame = {
  /**
   * Position of this keyframe on the timeline set between `0` (inclusive) and `ArxTeaHeader.totalNumberOfFrames` (exclusive)
   */
  frame: number
  /**
   * always set to -1 or 9 in tea files, so Arx Libertatis in debug mode expects only those 2 values
   * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/animation/Animation.cpp#L304
   *
   * if ommitted the default value is -1
   */
  flags?: ArxAnimationPlayingFlags
  /**
   * not used by Arx
   */
  isMasterKeyFrame: boolean
  /**
   * not used by Arx
   */
  isKeyFrame: boolean
  // TODO: what is this field for?
  timeFrame: number
  groups: ArxTheoAnimationGroup[]
  /**
   * if value is missing than it means it's a vector with 0/0/0 values
   */
  translate?: ArxVector3
  /**
   * if value is missing than it means it's a quaternion with 0/0/0/1 values
   */
  quaternion?: ArxQuaternion
  sample?: ArxTheaSample
}

export class KeyFrame {
  static readFrom(binary: BinaryIO<ArrayBufferLike>, version: number, numberOfGroups: number): ArxKeyFrame {
    const frame = binary.readInt32()
    const flags = binary.readInt32()

    const isNewerVersion = version >= TEA_VERSION_NEW
    if (isNewerVersion) {
      binary.readString(256) // info_frame - always an empty string
    }

    const isMasterKeyFrame = binary.readInt32() !== 0
    const isKeyFrame = binary.readInt32() !== 0
    const hasTranslateData = binary.readInt32() !== 0 // key_move
    const hasQuaternionData = binary.readInt32() !== 0 // key_orient
    const hasMorphData = binary.readInt32() !== 0 // key_morph - 16 bytes of unknown data - ignored by Arx

    const keyframe: ArxKeyFrame = {
      frame,
      flags,
      isMasterKeyFrame,
      isKeyFrame,
      timeFrame: binary.readInt32(),
      groups: [],
    }

    if (hasTranslateData) {
      const translate = binary.readVector3()

      if (translate.x !== 0 || translate.y !== 0 || translate.z !== 0) {
        keyframe.translate = translate
      }
    }

    if (hasQuaternionData) {
      binary.skipBytes(8) // theo angle - no info on the structure - not used by Arx

      const quaternion = binary.readQuat()
      if (quaternion.x !== 0 || quaternion.y !== 0 || quaternion.z !== 0 || quaternion.w !== 1) {
        keyframe.quaternion = quaternion
      }
    }

    if (hasMorphData) {
      binary.skipBytes(16) // thea morph - no info on the structure - not used by Arx
    }

    keyframe.groups = times(() => {
      const isKey = binary.readInt32() !== 0

      binary.readString(8) // angle - probably not a string as it holds garbage data, like "Ò?x19" when not empty - not used by Arx

      const quaternion = binary.readQuat()
      const translate = binary.readVector3()
      const zoom = binary.readVector3()

      const group: ArxTheoAnimationGroup = {
        isKey,
      }

      if (quaternion.x !== 0 || quaternion.y !== 0 || quaternion.z !== 0 || quaternion.w !== 1) {
        group.quaternion = quaternion
      }

      if (translate.x !== 0 || translate.y !== 0 || translate.z !== 0) {
        group.translate = translate
      }

      if (zoom.x !== 0 || zoom.y !== 0 || zoom.z !== 0) {
        group.zoom = zoom
      }

      return group
    }, numberOfGroups)

    const hasSample = binary.readInt32() !== -1
    if (hasSample) {
      keyframe.sample = {
        name: binary.readString(256),
        sizeInBytes: binary.readInt32(),
      }

      binary.skipBytes(keyframe.sample.sizeInBytes) // contains audio data if sizeInBytes > 0, which is already present in SFX folder of the game * - not used by Arx

      // * Only 4 audios are not present in the SFX folder of the released game:
      // - Bell.wav
      // - porticulis_close.wav
      // - porticulis_open.wav
      // - wooddoorclose.wav (same as sfx/door_wood_close.wav)
      // 2 audios are present in SFX, but sound different:
      // - LEVER.wav
      // - Bow_end.wav
    }

    binary.readInt32() // num_sfx - always -1 - not used by Arx

    return keyframe
  }

  static accumulateFrom(keyframe: ArxKeyFrame): ArrayBuffer {
    const hasTranslateData = keyframe.translate !== undefined
    const hasQuaternionData = keyframe.quaternion !== undefined
    const hasSample = keyframe.sample !== undefined

    const buffer = new ArrayBuffer(
      KeyFrame.sizeOf(
        TEA_VERSION_OLD,
        hasTranslateData,
        hasQuaternionData,
        false,
        keyframe.groups.length,
        hasSample,
        0,
      ),
    )
    const binary = new BinaryIO(buffer)

    binary.writeInt32(keyframe.frame)
    binary.writeInt32(keyframe.flags ?? -1)

    if (keyframe.isMasterKeyFrame) {
      binary.writeInt32(1)
    } else {
      binary.writeInt32(0)
    }

    if (keyframe.isKeyFrame) {
      binary.writeInt32(1)
    } else {
      binary.writeInt32(0)
    }

    // key_move
    if (hasTranslateData) {
      binary.writeInt32(1)
    } else {
      binary.writeInt32(0)
    }

    // key_orient
    if (hasQuaternionData) {
      binary.writeInt32(1)
    } else {
      binary.writeInt32(0)
    }

    binary.writeInt32(0) // key_morph - ignored by Arx

    binary.writeInt32(keyframe.timeFrame)

    if (keyframe.translate) {
      binary.writeVector3(keyframe.translate)
    }

    if (keyframe.quaternion) {
      binary.writeUint8Array(repeat(0, 8)) // theo angle - no info on the structure
      binary.writeQuat(keyframe.quaternion)
    }

    keyframe.groups.forEach(
      ({
        isKey,
        quaternion = { x: 0, y: 0, z: 0, w: 1 },
        translate = { x: 0, y: 0, z: 0 },
        zoom = { x: 0, y: 0, z: 0 },
      }) => {
        if (isKey) {
          binary.writeInt32(1)
        } else {
          binary.writeInt32(0)
        }

        binary.writeString('', 8) // angle

        binary.writeQuat(quaternion)
        binary.writeVector3(translate)
        binary.writeVector3(zoom)
      },
    )

    if (keyframe.sample === undefined) {
      binary.writeInt32(-1) // num_sample
    } else {
      binary.writeInt32(1) // num_sample
      binary.writeString(keyframe.sample.name, 256) // sample_name
      binary.writeInt32(0) // sample_size
    }

    binary.writeInt32(-1) // num_sfx

    return buffer
  }

  static sizeOf(
    version: number,
    hasTranslateData: boolean,
    hasQuaternionData: boolean,
    hasMorphData: boolean,
    numberOfGroups: number,
    hasSample: boolean,
    sampleSize: number = 0,
  ): number {
    let numberOfBytes = BinaryIO.sizeOfInt32() * 8

    const isNewerVersion = version >= TEA_VERSION_NEW
    if (isNewerVersion) {
      numberOfBytes = numberOfBytes + BinaryIO.sizeOfString(256)
    }

    if (hasTranslateData) {
      numberOfBytes = numberOfBytes + BinaryIO.sizeOfVector3()
    }

    if (hasQuaternionData) {
      numberOfBytes = numberOfBytes + 8 * BinaryIO.sizeOfUint8() + BinaryIO.sizeOfQuat()
    }

    if (hasMorphData) {
      numberOfBytes = numberOfBytes + 16 * BinaryIO.sizeOfUint8()
    }

    const sizeOfGroup =
      BinaryIO.sizeOfInt32() + BinaryIO.sizeOfString(8) + BinaryIO.sizeOfQuat() + 2 * BinaryIO.sizeOfVector3()

    numberOfBytes = numberOfBytes + numberOfGroups * sizeOfGroup

    numberOfBytes = numberOfBytes + BinaryIO.sizeOfInt32()
    if (hasSample) {
      const sizeOfSample = BinaryIO.sizeOfString(256) + BinaryIO.sizeOfInt32() + sampleSize * BinaryIO.sizeOfUint8()
      numberOfBytes = numberOfBytes + sizeOfSample
    }

    numberOfBytes = numberOfBytes + BinaryIO.sizeOfInt32()

    return numberOfBytes
  }
}
