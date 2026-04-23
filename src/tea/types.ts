import type { ArxQuaternion, ArxVector3 } from '@common/types.js'

/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/animation/AnimationFormat.h#L124
 */
export type ArxTheaSample = {
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
  num_frame: number
  flag_frame: number
  master_key_frame: boolean
  key_frame: boolean
  key_move: boolean
  key_orient: boolean
  key_morph: boolean
  time_frame: number

  translate?: ArxVector3
  quat?: ArxQuaternion
  sample?: ArxTheaSample
}
