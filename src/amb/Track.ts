import { BinaryIO } from '@common/BinaryIO'
import { times } from '@common/helpers'
import { ArxKey, Key } from '@amb/Key'

/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/audio/Ambiance.cpp#L230
 */
export enum ArxTrackFlags {
  None = 0,
  Position = 1 << 0,
  // ? = 1 << 1,
  Master = 1 << 2,
  // ? = 1 << 3,
  Paused = 1 << 4,
  Prefetched = 1 << 5,
}

export type ArxTrack = {
  filename: string
  flags: ArxTrackFlags
  keys: ArxKey[]
}

export class Track {
  /**
   * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/audio/Ambiance.cpp#L531
   */
  static readFrom(binary: BinaryIO, isNewerVersion: boolean): ArxTrack {
    const filename = binary.readString()

    if (isNewerVersion) {
      binary.readString() // name - always ""
    }

    const flags = binary.readUint32()
    const numberOfKeys = binary.readUint32()

    const keys = times(() => Key.readFrom(binary), numberOfKeys)
    if (isNewerVersion) {
      keys.reverse()
    }

    return {
      filename,
      flags,
      keys,
    }
  }

  static accumulateFrom(track: ArxTrack) {
    const buffer = Buffer.alloc(Track.sizeOf(track))
    const binary = new BinaryIO(buffer.buffer)

    binary.writeString(track.filename)
    binary.writeString('') // name
    binary.writeUint32(track.flags)
    binary.writeUint32(track.keys.length)
    binary.writeBuffer(Buffer.concat(track.keys.reverse().map(Key.accumulateFrom)))

    return buffer
  }

  static sizeOf(track: ArxTrack) {
    return (
      BinaryIO.sizeOfNullTerminatedString(track.filename) +
      BinaryIO.sizeOfNullTerminatedString('') +
      BinaryIO.sizeOfUint32() * 2 +
      Key.sizeOf() * track.keys.length
    )
  }
}