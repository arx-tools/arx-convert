const { BinaryIO } = require('../binary/BinaryIO.js')
const { Buffer } = require('buffer')
const { KEEP_ZERO_BYTES } = require('../binary/BinaryIO.js')

class NewKeyframe {
  static readFrom(binary) {
    const data = {
      num_frame: binary.readInt32(),
      flag_frame: binary.readInt32(),
      info_frame: binary.readString(256, KEEP_ZERO_BYTES),
      master_key_frame: binary.readInt32() !== 0,
      key_frame: binary.readInt32() !== 0,
      key_move: binary.readInt32() !== 0, // is there a global translation?
      key_orient: binary.readInt32() !== 0, // is there a global rotation?
      key_morph: binary.readInt32() !== 0, // is there a global morph? (ignored)
      time_frame: binary.readInt32(),
    }

    return data
  }

  static accumulateFrom(json) {
    const buffer = Buffer.alloc(NewKeyframe.sizeOf(), 0)
    const binary = new BinaryIO(buffer.buffer)

    // TODO

    return buffer
  }

  static sizeOf() {
    return 0
  }
}

module.exports = NewKeyframe
