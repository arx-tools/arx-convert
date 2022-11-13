const BinaryIO = require('../binary/BinaryIO.js')
const { Buffer } = require('buffer')

class OldKeyframe {
  static readFrom(binary) {
    const data = {
      num_frame: binary.readInt32(),
      flag_frame: binary.readInt32(),
      master_key_frame: binary.readInt32() !== 0,
      key_frame: binary.readInt32() !== 0,
      key_move: binary.readInt32() !== 0,
      key_orient: binary.readInt32() !== 0,
      key_morph: binary.readInt32() !== 0,
      time_frame: binary.readInt32(),
    }

    return data
  }

  static accumulateFrom(json) {
    const buffer = Buffer.alloc(OldKeyframe.sizeOf(), 0)
    const binary = new BinaryIO(buffer.buffer)

    // TODO

    return buffer
  }

  static sizeOf() {
    return 0
  }
}

module.exports = OldKeyframe
