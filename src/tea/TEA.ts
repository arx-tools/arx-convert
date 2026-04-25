import { BinaryIO } from '@common/BinaryIO.js'
import { concatArrayBuffers, times } from '@common/helpers.js'
import { type ArxKeyFrame, KeyFrame } from '@tea/KeyFrame.js'
import { type ArxTeaHeader, TeaHeader } from '@tea/TeaHeader.js'
import { TEA_VERSION_OLD } from './constants.js'

export type ArxTEA = {
  header: Omit<ArxTeaHeader, 'numberOfKeyFrames' | 'numberOfGroups' | 'version'>
  keyframes: ArxKeyFrame[]
}

export class TEA {
  static load(decompressedFile: ArrayBufferLike): ArxTEA {
    const file = new BinaryIO(decompressedFile)

    const { numberOfKeyFrames, numberOfGroups, version, ...header } = TeaHeader.readFrom(file)

    if (version < TEA_VERSION_OLD) {
      throw new Error(`Invalid TEA version ${version}`)
    }

    const data: ArxTEA = {
      header,
      keyframes: times(() => {
        return KeyFrame.readFrom(file, version, numberOfGroups)
      }, numberOfKeyFrames),
    }

    return data
  }

  static save(json: ArxTEA): ArrayBuffer {
    const header = TeaHeader.accumulateFrom(json)
    const keyframes = concatArrayBuffers(json.keyframes.map(KeyFrame.accumulateFrom))

    return concatArrayBuffers([header, keyframes])
  }
}
