import type { ArxAMB } from '@amb/AMB.js'
import { AMB_VERSION_1003, type AMB_VERSIONS } from '@amb/constants.js'
import { BinaryIO } from '@common/BinaryIO.js'

export type ArxAmbHeader = {
  version: AMB_VERSIONS
  numberOfTracks: number
}

export class AmbHeader {
  /**
   * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/audio/Ambiance.cpp#L627
   */
  static readFrom(binary: BinaryIO<ArrayBufferLike>): ArxAmbHeader {
    binary.readString(4) // identifier - always "GAMB"

    // based on the assets of Arx only the ARX_VERSIONS versions are being used (1001, 1002 and 1003)
    // arx-convert doesn't check for other versions, assumes it's one of those 3 versions
    const version = binary.readUint32() as AMB_VERSIONS

    return {
      version,
      numberOfTracks: binary.readUint32(),
    }
  }

  static accumulateFrom(json: ArxAMB): ArrayBuffer {
    const buffer = new ArrayBuffer(AmbHeader.sizeOf())
    const binary = new BinaryIO(buffer)

    binary.writeString('GAMB', 4)
    binary.writeInt32(AMB_VERSION_1003)
    binary.writeInt32(json.tracks.length)

    return buffer
  }

  static sizeOf(): number {
    return BinaryIO.sizeOfString(4) + BinaryIO.sizeOfInt32() * 2
  }
}
