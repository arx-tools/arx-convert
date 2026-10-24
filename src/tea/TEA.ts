import type { Simplify } from 'type-fest'
import { BinaryIO } from '../common/BinaryIO.ts'
import { concatArrayBuffers, times } from '../common/helpers.ts'
import { type ArxKeyFrame, KeyFrame } from './KeyFrame.ts'
import { type ArxTeaHeader, TeaHeader } from './TeaHeader.ts'
import { TEA_VERSION_OLD } from './constants.ts'

export type ArxTEA = {
  $schema?: string
  header: Simplify<Omit<ArxTeaHeader, 'numberOfKeyFrames' | 'numberOfGroups' | 'version'>>
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
      $schema: 'https://arx-tools.github.io/schemas/tea.schema.json',
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
