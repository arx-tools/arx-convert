import { BinaryIO } from '@common/BinaryIO.js'
import { concatArrayBuffers } from '@common/helpers.js'
import { KeyFrame } from '@tea/KeyFrame.js'
import { type ArxTeaHeader, TeaHeader } from '@tea/TeaHeader.js'
import type { ArxKeyFrame, TheoGroupAnim } from '@tea/types.js'

export type ArxTEA = {
  header: Omit<ArxTeaHeader, 'numberOfKeyFrames' | 'numberOfGroups' | 'version'>
  keyframes: Array<Omit<ArxKeyFrame, 'hasTranslateData' | 'hasQuaternionData' | 'hasMorphData'>>
}

export class TEA {
  static load(decompressedFile: ArrayBufferLike): ArxTEA {
    const file = new BinaryIO(decompressedFile)

    const { numberOfKeyFrames, numberOfGroups, version, ...header } = TeaHeader.readFrom(file)

    if (version < 2014) {
      throw new Error(`Invalid TEA version ${version}`)
    }

    const data: ArxTEA = {
      header,
      keyframes: [],
    }

    for (let i = 0; i < numberOfKeyFrames; i++) {
      const keyframe = KeyFrame.readFrom(file, version)

      if (keyframe.hasTranslateData) {
        keyframe.translate = file.readVector3()
      }

      if (keyframe.hasQuaternionData) {
        file.skipBytes(8) // theo angle - no info on the structure - not used by Arx

        keyframe.quaternion = file.readQuat()
      }

      if (keyframe.hasMorphData) {
        file.skipBytes(16) // thea morph - no info on the structure - not used by Arx
      }

      for (let j = 0; j < numberOfGroups; j++) {
        const isKey = file.readInt32() !== 0

        file.readString(8) // angle - probably not a string as per Arx source code, because it holds garbage data, like "Ò?x19" when not an empty string - not used by Arx

        const group: TheoGroupAnim = {
          isKey,
          quaternion: file.readQuat(),
          translate: file.readVector3(),
          zoom: file.readVector3(),
        }

        // TODO: create groups and fill it in with group data
      }

      const numberOfSamples = file.readInt32()
      if (numberOfSamples !== -1) {
        keyframe.sample = {
          name: file.readString(256),
          size: file.readInt32(),
        }

        file.skipBytes(keyframe.sample.size) // contains audio data if not empty, which is already present in SFX folder of the game * - not used by Arx

        // * Only 4 audios are not present in the SFX folder of the released game:
        // - Bell.wav
        // - porticulis_close.wav
        // - porticulis_open.wav
        // - wooddoorclose.wav (same as sfx/door_wood_close.wav)
        // 2 audios are present in SFX, but sound different:
        // - LEVER.wav
        // - Bow_end.wav
      }

      file.readInt32() // num_sfx - always -1 - not used by Arx

      data.keyframes.push(keyframe)
    }

    return data
  }

  static save(json: ArxTEA): ArrayBuffer {
    return concatArrayBuffers([])
  }
}
