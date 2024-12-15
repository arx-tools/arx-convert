import { BinaryIO } from '@common/BinaryIO.js'
import { concatUint8Arrays, times } from '@common/helpers.js'
import { AmbHeader } from '@amb/AmbHeader.js'
import { Track, type ArxTrack } from '@amb/Track.js'

export type ArxAMB = {
  tracks: ArxTrack[]
}

export class AMB {
  static load(decompressedFile: Uint8Array): ArxAMB {
    const file = new BinaryIO(decompressedFile)

    const { numberOfTracks, isNewerVersion } = AmbHeader.readFrom(file)

    return {
      tracks: times(() => {
        return Track.readFrom(file, isNewerVersion)
      }, numberOfTracks),
    }
  }

  static save(json: ArxAMB): Uint8Array {
    const header = AmbHeader.accumulateFrom(json)
    const tracks = concatUint8Arrays(json.tracks.map(Track.accumulateFrom))

    return concatUint8Arrays([header, tracks])
  }
}
