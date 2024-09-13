import { Buffer } from 'node:buffer'
import { BinaryIO } from '@common/BinaryIO.js'
import { times } from '@common/helpers.js'
import { AmbHeader } from '@amb/AmbHeader.js'
import { Track, type ArxTrack } from '@amb/Track.js'

export type ArxAMB = {
  tracks: ArxTrack[]
}

export class AMB {
  static load(decompressedFile: Buffer): ArxAMB {
    const file = new BinaryIO(decompressedFile)

    const { numberOfTracks, isNewerVersion } = AmbHeader.readFrom(file)

    return {
      tracks: times(() => {
        return Track.readFrom(file, isNewerVersion)
      }, numberOfTracks),
    }
  }

  static save(json: ArxAMB): Buffer {
    const header = AmbHeader.accumulateFrom(json)
    const tracks = Buffer.concat(json.tracks.map(Track.accumulateFrom))

    return Buffer.concat([header, tracks])
  }
}
