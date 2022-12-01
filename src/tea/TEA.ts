import { ArxTeaHeader, TeaHeader } from './TeaHeader'
import { Buffer } from 'node:buffer'
import { BinaryIO } from '../common/BinaryIO'
import { KEEP_ZERO_BYTES } from '../common/constants'
import { ArxNewKeyFrame, NewKeyFrame } from './NewKeyFrame'
import { ArxOldKeyFrame, OldKeyFrame } from './OldKeyFrame'
import { ArxFormat, ArxQuaternion, ArxVector3 } from '../types'

export type ArxTEA = ArxFormat & {
  header: Omit<ArxTeaHeader, 'numberOfKeyFrames' | 'numberOfGroups'>
  keyframes: ArxKeyFrame[]
}

export type ArxTheaSample = {
  name: string
  size: number
}

export type ArxKeyFrame = (ArxNewKeyFrame | ArxOldKeyFrame) & {
  translate?: ArxVector3
  quat?: ArxQuaternion
  sample?: ArxTheaSample
}

export class TEA {
  static load(decompressedFile: Buffer) {
    const file = new BinaryIO(decompressedFile.buffer)

    const { numberOfKeyFrames, numberOfGroups, ...header } = TeaHeader.readFrom(file)

    if (header.version < 2014) {
      throw new Error(`Invalid TEA version ${header.version}`)
    }

    const data: ArxTEA = {
      meta: {
        type: 'tea',
        numberOfLeftoverBytes: 0,
      },
      header: header,
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
        file.position += 8 // theo angle
        keyframe.quat = file.readQuat()
      }

      if (keyframe.key_morph) {
        file.position += 16 // thea morph
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
        file.position += sample.size
      }

      console.log(keyframe)
    }

    file.position += 4 // num_sfx?

    data.meta.numberOfLeftoverBytes = file.byteLength - file.position

    return data
  }

  static save(json: ArxTEA) {
    return Buffer.concat([])
  }
}
