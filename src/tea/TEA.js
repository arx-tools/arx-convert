const BinaryIO = require('../binary/BinaryIO.js')
const { Buffer } = require('buffer')
const TeaHeader = require('./TeaHeader')
const NewKeyframe = require('./NewKeyframe.js')
const OldKeyframe = require('./OldKeyframe.js')
const { KEEP_ZERO_BYTES } = require('../binary/BinaryIO.js')

class TEA {
  static load(decompressedFile) {
    const file = new BinaryIO(decompressedFile.buffer)

    const header = TeaHeader.readFrom(file)

    if (header.version < 2014) {
      throw new Error(`Invalid TEA version ${header.version}`)
    }

    const data = {
      meta: {
        type: 'tea',
        numberOfLeftoverBytes: 0,
      },
      header: header,
      keyframes: [],
    }
    console.log(header)

    for (let i = 0; i < header.numberOfKeyFrames; i++) {
      console.log(i, file.position)
      let keyframe
      if (header.version >= 2015) {
        keyframe = NewKeyframe.readFrom(file)
      } else {
        keyframe = OldKeyframe.readFrom(file)
      }
      data.keyframes.push(keyframe)

      if (keyframe.key_move) {
        keyframe.translate = file.readVector3()
      }

      if (keyframe.key_orient) {
        file.position += 8 // theo angle
        keyframe.quat = file.readQuat()
      }

      if (keyframe.key_morph) {
        file.position += 16 // thea morph
      }

      for (let j = 0; j < header.numberOfGroups; j++) {
        // theo groupanim
        const group = {
          key: file.readInt32() !== 0,
          angle: file.readString(8, KEEP_ZERO_BYTES), // ignored
          quat: file.readQuat(),
          translate: file.readVector3(),
          zoom: file.readVector3(),
        }
        // TODO: create groups and fill it in with group data
      }

      const numberOfSamples = file.readInt32()

      if (numberOfSamples !== -1) {
        // thea sample
        const sample = {
          name: file.readString(256, KEEP_ZERO_BYTES),
          size: file.readInt32(),
        }
        file.position += sample.size
        keyframe.sample = sample
      }

      console.log(keyframe)
    }

    file.position += 4 // num_sfx?

    return data
  }

  static save(json) {
    return Buffer.concat([])
  }
}

module.exports = TEA
