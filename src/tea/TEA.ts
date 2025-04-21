import { BinaryIO } from '@common/BinaryIO.js'
import { KEEP_ZERO_BYTES } from '@common/constants.js'
import { concatArrayBuffers } from '@common/helpers.js'
import type { ArxQuaternion, ArxVector3 } from '@common/types.js'
import { type ArxNewKeyFrame, NewKeyFrame } from '@tea/NewKeyFrame.js'
import { type ArxOldKeyFrame, OldKeyFrame } from '@tea/OldKeyFrame.js'
import { type ArxTeaHeader, TeaHeader } from '@tea/TeaHeader.js'

/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/animation/AnimationFormat.h#L124
 */
export type ArxTheaSample = {
  name: string
  size: number
}

export type ArxKeyFrame = (ArxNewKeyFrame | ArxOldKeyFrame) & {
  translate?: ArxVector3
  quat?: ArxQuaternion
  sample?: ArxTheaSample
}

export type ArxTEA = {
  header: Omit<ArxTeaHeader, 'numberOfKeyFrames' | 'numberOfGroups'>
  keyframes: ArxKeyFrame[]
}

export class TEA {
  static load(decompressedFile: ArrayBufferLike): ArxTEA {
    const file = new BinaryIO(decompressedFile)

    const { numberOfKeyFrames, numberOfGroups, ...header } = TeaHeader.readFrom(file)

    if (header.version < 2014) {
      throw new Error(`Invalid TEA version ${header.version}`)
    }

    const data: ArxTEA = {
      header,
      keyframes: [],
    }

    for (let i = 0; i < numberOfKeyFrames; i++) {
      console.log(i, file.position)
      let keyframe: ArxKeyFrame
      if (header.version >= 2015) {
        keyframe = NewKeyFrame.readFrom(file)
      } else {
        keyframe = OldKeyFrame.readFrom(file)
      }

      data.keyframes.push(keyframe)

      if (keyframe.key_move) {
        keyframe.translate = file.readVector3()
      }

      if (keyframe.key_orient) {
        file.position = file.position + 8 // theo angle
        keyframe.quat = file.readQuat()
      }

      if (keyframe.key_morph) {
        file.position = file.position + 16 // thea morph
      }

      for (let j = 0; j < numberOfGroups; j++) {
        // theo groupanim
        const group = {
          key: file.readInt32() !== 0,
          angle: file.readString(8, KEEP_ZERO_BYTES), // ignored
          quat: file.readQuat(),
          translate: file.readVector3(),
          zoom: file.readVector3(),
        }
        // TODO: create groups and fill it in with group data
      }

      const numberOfSamples = file.readInt32()

      if (numberOfSamples !== -1) {
        const sample: ArxTheaSample = {
          name: file.readString(256, KEEP_ZERO_BYTES),
          size: file.readInt32(),
        }
        keyframe.sample = sample
        file.position = file.position + sample.size
      }

      console.log(keyframe)
    }

    file.position = file.position + 4 // num_sfx?

    return data
  }

  static save(json: ArxTEA): ArrayBuffer {
    return concatArrayBuffers([])
  }
}
