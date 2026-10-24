import { BinaryIO } from '../common/BinaryIO.ts'
import { concatArrayBuffers, times } from '../common/helpers.ts'
import { type ArxKey, Key } from './Key.ts'
import { AMB_VERSION_1002, AMB_VERSION_1003, type AMB_VERSIONS } from './constants.ts'

/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/audio/Ambiance.cpp#L230
 */
export const ArxTrackFlags = {
  None: 0,
  Position: 1 << 0,
  // ?: 1 << 1,
  Master: 1 << 2,
  // ?: 1 << 3,
  Paused: 1 << 4,
  Prefetched: 1 << 5,
} as const

/**
 * A combination of the {@link ArxTrackFlags} bits.
 */
export type ArxTrackFlags = number

export type ArxTrack = {
  filename: string
  flags: ArxTrackFlags
  keys: ArxKey[]
}

export class Track {
  /**
   * Reads one track of an ambience file, which is a sound and the keys it reacts to.
   *
   * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/audio/Ambiance.cpp#L531
   */
  static readFrom(binary: BinaryIO<ArrayBufferLike>, ambVersion: AMB_VERSIONS): ArxTrack {
    const filename = Track.toRelativePath(binary.readString())

    if (ambVersion === AMB_VERSION_1002 || ambVersion === AMB_VERSION_1003) {
      binary.readString() // name - always ""
    }

    const flags = binary.readUint32()
    const numberOfKeys = binary.readUint32()

    const keys = times(() => {
      return Key.readFrom(binary)
    }, numberOfKeys)

    if (ambVersion === AMB_VERSION_1003) {
      keys.reverse()
    }

    return {
      filename,
      flags,
      keys,
    }
  }

  static accumulateFrom(track: ArxTrack): ArrayBuffer {
    const buffer = new ArrayBuffer(Track.sizeOf(track))
    const binary = new BinaryIO(buffer)

    binary.writeString(Track.toAbsolutePath(track.filename))
    binary.writeString('') // name
    binary.writeUint32(track.flags)
    binary.writeUint32(track.keys.length)
    binary.writeBuffer(concatArrayBuffers([...track.keys].toReversed().map(Key.accumulateFrom))) // .reverse() is needed as arx-convert outputs AMB_VERSION_1003 format

    return buffer
  }

  /**
   * Converts the absolute path of a sound to the relative one the AMB file stores.
   *
   * @example
   * from: SFX\\AMBIANCE\\LOOP_GOBLIN_MAIN.WAV
   *   to: sfx/ambiance/loop_goblin_main.wav
   *
   * from: SFX\\AMBIANCE\\FX_ADDON\\SCREAM3.WAV
   *   to: sfx/ambiance/fx_addon/scream3.wav
   *
   * from: Sfx\Strange_noise10c.wav
   *   to: sfc/strange_noise10c.wav
   */
  static toRelativePath(filename: string): string {
    return filename.toLowerCase().replaceAll('\\', '/')
  }

  /**
   * Converts the relative path of a sound back to the absolute path the game reads.
   *
   * @example
   * from: srx/ambiance/loop_goblin_main.wav
   *   to: sfx\\ambiance\\loop_goblin_main.wav
   */
  static toAbsolutePath(filename: string): string {
    return filename.toLowerCase().replaceAll('/', '\\')
  }

  static sizeOf(track: ArxTrack): number {
    return (
      BinaryIO.sizeOfNullTerminatedString(track.filename) +
      BinaryIO.sizeOfNullTerminatedString('') +
      BinaryIO.sizeOfUint32() * 2 +
      Key.sizeOf() * track.keys.length
    )
  }
}
