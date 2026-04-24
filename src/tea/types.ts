import type { ArxQuaternion, ArxVector3 } from '@common/types.js'

/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/animation/AnimationFormat.h#L124
 */
export type TheaSample = {
  name: string
  size: number
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
   * Position of this frame on the timeline set between `0` and `ArxTeaHeader.numberOfFrames`
   */
  frame: number
  /**
   * always set to -1 or 9 in tea files, so Arx Libertatis in debug mode expects only those 2 values
   * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/animation/Animation.cpp#L304
   */
  flags: ArxAnimationPlayingFlags
  /**
   * not used by Arx
   */
  isMasterKeyFrame: boolean
  /**
   * not used by Arx
   */
  isKeyFrame: boolean
  // TODO: remove this as it's the same as ArxKeyFrame.translate !== undefined
  hasTranslate: boolean
  // TODO: remove this as it's the same as ArxKeyFrame.quaternion !== undefined
  hasQuaternion: boolean
  /**
   * 16 byte data of unknown type and ignored by Arx
   */
  hasMorphData: boolean
  time_frame: number

  translate?: ArxVector3
  quaternion?: ArxQuaternion
  sample?: TheaSample
}

/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/animation/AnimationFormat.h#L116
 */
export type TheoGroupAnim = {
  isKey: boolean
  quaternion: ArxQuaternion
  translate: ArxVector3
  zoom: ArxVector3
}

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
