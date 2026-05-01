import { BinaryIO } from '@common/BinaryIO.js'
import { type ArxPortalPolygon, PortalPolygon } from '@fts/PortalPolygon.js'

/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/graphics/GraphicsTypes.h#L268
 */
export type ArxPortal = {
  polygon: ArxPortalPolygon
  room1: number
  room2: number
  // check level2/fast.fts for various values for usePortal (spelled as useportal in Arx Libertatis code)
  // it is mostly 0, the game code only explicitly mentions 0 (inactive - red in debug view), 1 (active, surrounding the room we stand in - green in debug view) and 2 (?)
  // but level2/fast.fts has weird (probably junk) data, like: 19800, 10402, 2241, -1, -13138, 10506, etc...
  usePortal: number
  paddy: number
}

export class Portal {
  static readFrom(binary: BinaryIO<ArrayBufferLike>): ArxPortal {
    return {
      polygon: PortalPolygon.readFrom(binary),
      room1: binary.readInt32(), // facing normal
      room2: binary.readInt32(),
      usePortal: binary.readInt16(),
      paddy: binary.readInt16(),
    }
  }

  static accumulateFrom(portal: ArxPortal, levelIdx: number): ArrayBuffer {
    const buffer = new ArrayBuffer(Portal.sizeOf())
    const binary = new BinaryIO(buffer)

    binary.writeBuffer(PortalPolygon.accumulateFrom(portal.polygon, levelIdx))
    binary.writeInt32(portal.room1)
    binary.writeInt32(portal.room2)
    binary.writeInt16(portal.usePortal)
    binary.writeInt16(portal.paddy)

    return buffer
  }

  static sizeOf(): number {
    return PortalPolygon.sizeOf() + BinaryIO.sizeOfInt32Array(2) + BinaryIO.sizeOfInt16Array(2)
  }
}
