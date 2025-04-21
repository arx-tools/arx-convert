import type { ArxAMB } from '@amb/AMB.js'
import { VERSION_1003, VERSION_1002 } from '@amb/constants.js'
import { BinaryIO } from '@common/BinaryIO.js'

export type ArxAmbHeader = {
  isNewerVersion: boolean
  numberOfTracks: number
}

export class AmbHeader {
  /**
   * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/audio/Ambiance.cpp#L627
   */
  static readFrom(binary: BinaryIO<ArrayBufferLike>): ArxAmbHeader {
    binary.readString(4) // identifier - always "GAMB"

    const version = binary.readUint32()

    return {
      isNewerVersion: version >= VERSION_1002,
      numberOfTracks: binary.readUint32(),
    }
  }

  static accumulateFrom(json: ArxAMB): ArrayBuffer {
    const buffer = new ArrayBuffer(AmbHeader.sizeOf())
    const binary = new BinaryIO(buffer)

    binary.writeString('GAMB', 4)
    binary.writeInt32(VERSION_1003)
    binary.writeInt32(json.tracks.length)

    return buffer
  }

  static sizeOf(): number {
    return BinaryIO.sizeOfString(4) + BinaryIO.sizeOfInt32() * 2
  }
}
