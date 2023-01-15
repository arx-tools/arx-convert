import { Buffer } from 'node:buffer'
import { BinaryIO } from '@common/BinaryIO'
import { times } from '@common/helpers'
import { AmbHeader } from '@amb/AmbHeader'
import { Track, ArxTrack } from '@amb/Track'

export type ArxAMB = {
  tracks: ArxTrack[]
}

export class AMB {
  static load(decompressedFile: Buffer) {
    const file = new BinaryIO(decompressedFile)

    const { numberOfTracks, isNewerVersion } = AmbHeader.readFrom(file)

    const data: ArxAMB = {
      tracks: times(() => Track.readFrom(file, isNewerVersion), numberOfTracks),
    }

    return data
  }

  static save(json: ArxAMB) {
    const header = AmbHeader.accumulateFrom(json)
    const tracks = Buffer.concat(json.tracks.map(Track.accumulateFrom))

    return Buffer.concat([header, tracks])
  }
}
