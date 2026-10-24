import { BinaryIO } from '../common/BinaryIO.ts'
import { concatArrayBuffers, times } from '../common/helpers.ts'
import { AmbHeader } from './AmbHeader.ts'
import { Track, type ArxTrack } from './Track.ts'

export type ArxAMB = {
  $schema?: string
  tracks: ArxTrack[]
}

export class AMB {
  static load(decompressedFile: ArrayBufferLike): ArxAMB {
    const file = new BinaryIO(decompressedFile)

    const { numberOfTracks, version } = AmbHeader.readFrom(file)

    return {
      $schema: 'https://arx-tools.github.io/schemas/amb.schema.json',
      tracks: times(() => {
        return Track.readFrom(file, version)
      }, numberOfTracks),
    }
  }

  static save(json: ArxAMB): ArrayBuffer {
    const header = AmbHeader.accumulateFrom(json)
    const tracks = concatArrayBuffers(json.tracks.map(Track.accumulateFrom))

    return concatArrayBuffers([header, tracks])
  }
}
