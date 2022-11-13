const { Vector3 } = require('three')
const Anglef = require('./Anglef.js')
const Color = require('./Color.js')
const TextIO = require('./TextIO.js')
const { repeat } = require('../common/helpers.js')

const LITTLE_ENDIAN = true
const BIG_ENDIAN = false
const TRUNCATE_ZERO_BYTES = true
const KEEP_ZERO_BYTES = false

class BinaryIO extends DataView {
  constructor(buffer, byteOffset, byteLength) {
    super(buffer, byteOffset, byteLength)
    this.position = 0
    this.textIO = new TextIO('iso-8859-1')
  }

  readFloat32(endianness = LITTLE_ENDIAN) {
    const val = this.getFloat32(this.position, endianness)
    this.position += 4
    return val
  }

  readFloat32Array(length, endianness = LITTLE_ENDIAN) {
    const arr = new Array(length)
    for (let i = 0; i < length; i++) {
      arr[i] = this.readFloat32(endianness)
    }
    return arr
  }

  readFloat64(endianness = LITTLE_ENDIAN) {
    const val = this.getFloat64(this.position, endianness)
    this.position += 8
    return val
  }

  readFloat64Array(length, endianness = LITTLE_ENDIAN) {
    const arr = new Array(length)
    for (let i = 0; i < length; i++) {
      arr[i] = this.readFloat64(endianness)
    }
    return arr
  }

  readInt8() {
    const val = this.getInt8(this.position)
    this.position += 1
    return val
  }

  readInt8Array(length) {
    const arr = new Array(length)
    for (let i = 0; i < length; i++) {
      arr[i] = this.readInt8()
    }
    return arr
  }

  readInt16(endianness = LITTLE_ENDIAN) {
    const val = this.getInt16(this.position, endianness)
    this.position += 2
    return val
  }

  readInt16Array(length, endianness = LITTLE_ENDIAN) {
    const arr = new Array(length)
    for (let i = 0; i < length; i++) {
      arr[i] = this.readInt16(endianness)
    }
    return arr
  }

  readInt32(endianness = LITTLE_ENDIAN) {
    const val = this.getInt32(this.position, endianness)
    this.position += 4
    return val
  }

  readInt32Array(length, endianness = LITTLE_ENDIAN) {
    const arr = new Array(length)
    for (let i = 0; i < length; i++) {
      arr[i] = this.readInt32(endianness)
    }
    return arr
  }

  readUint8() {
    const val = this.getUint8(this.position)
    this.position += 1
    return val
  }

  readUint8Array(length) {
    const arr = new Array(length)
    for (let i = 0; i < length; i++) {
      arr[i] = this.readUint8()
    }
    return arr
  }

  readUint16(endianness = LITTLE_ENDIAN) {
    const val = this.getUint16(this.position, endianness)
    this.position += 2
    return val
  }

  readUint16Array(length, endianness = LITTLE_ENDIAN) {
    const arr = new Array(length)
    for (let i = 0; i < length; i++) {
      arr[i] = this.readUint16(endianness)
    }
    return arr
  }

  readUint32(endianness = LITTLE_ENDIAN) {
    const val = this.getUint32(this.position, endianness)
    this.position += 4
    return val
  }

  readUint32Array(length, endianness = LITTLE_ENDIAN) {
    const arr = new Array(length)
    for (let i = 0; i < length; i++) {
      arr[i] = this.readUint32(endianness)
    }
    return arr
  }

  writeFloat32(value, endianness = LITTLE_ENDIAN) {
    this.setFloat32(this.position, value, endianness)
    this.position += 4
  }

  writeFloat32Array(values, endianness = LITTLE_ENDIAN) {
    for (let i = 0; i < values.length; i++) {
      this.writeFloat32(values[i], endianness)
    }
  }

  writeFloat64(value, endianness = LITTLE_ENDIAN) {
    this.setFloat32(this.position, value, endianness)
    this.position += 4
  }

  writeFloat64Array(values, endianness = LITTLE_ENDIAN) {
    for (let i = 0; i < values.length; i++) {
      this.writeFloat64(values[i], endianness)
    }
  }

  writeInt8(value) {
    this.setInt8(this.position, value)
    this.position += 1
  }

  writeInt8Array(values) {
    for (let i = 0; i < values.length; i++) {
      this.writeInt8(values[i])
    }
  }

  writeInt16(value, endianness = LITTLE_ENDIAN) {
    this.setInt16(this.position, value, endianness)
    this.position += 2
  }

  writeInt16Array(values, endianness = LITTLE_ENDIAN) {
    for (let i = 0; i < values.length; i++) {
      this.writeInt16(values[i], endianness)
    }
  }

  writeInt32(value, endianness = LITTLE_ENDIAN) {
    this.setInt32(this.position, value, endianness)
    this.position += 4
  }

  writeInt32Array(values, endianness = LITTLE_ENDIAN) {
    for (let i = 0; i < values.length; i++) {
      this.writeInt32(values[i], endianness)
    }
  }

  writeUint8(value) {
    this.setUint8(this.position, value)
    this.position += 1
  }

  writeUint8Array(values) {
    for (let i = 0; i < values.length; i++) {
      this.writeUint8(values[i])
    }
  }

  writeUint16(value, endianness = LITTLE_ENDIAN) {
    this.setUint16(this.position, value, endianness)
    this.position += 2
  }

  writeUint16Array(values, endianness = LITTLE_ENDIAN) {
    for (let i = 0; i < values.length; i++) {
      this.writeUint16(values[i], endianness)
    }
  }

  writeUint32(value, endianness = LITTLE_ENDIAN) {
    this.setUint32(this.position, value, endianness)
    this.position += 4
  }

  writeUint32Array(values, endianness = LITTLE_ENDIAN) {
    for (let i = 0; i < values.length; i++) {
      this.writeUint32(values[i], endianness)
    }
  }

  readString(length, truncateZeroBytes = TRUNCATE_ZERO_BYTES) {
    const codes = []
    let c = 0
    if (length !== undefined) {
      for (let i = 0; i < length; i++) {
        c = this.readUint8()
        if (c !== 0 || truncateZeroBytes === KEEP_ZERO_BYTES) {
          codes.push(c === 0 ? ' ' : c)
        }
      }
    } else {
      while (true) {
        c = this.readUint8()
        if (c === 0) {
          break
        }
        codes.push(c)
      }
    }

    return this.textIO.decode(codes)
  }

  writeString(str, length) {
    // if length is given we assume a fixed length string
    if (length !== undefined) {
      const charCodes = repeat(0, length)

      // replacing 0s in charCodes one by one from left to right
      this.textIO.encode(str).forEach((charCode, index) => {
        charCodes[index] = charCode
      })

      charCodes.forEach(this.writeUint8.bind(this))
    } else {
      // otherwise its a 0 terminated c string
      this.textIO.encode(str).forEach(this.writeUint8.bind(this))
      this.writeUint8(0)
    }
  }

  readVector3(endianness = LITTLE_ENDIAN) {
    const x = this.readFloat32(endianness)
    const y = this.readFloat32(endianness)
    const z = this.readFloat32(endianness)
    return new Vector3(x, y, z)
  }

  readVector3Array(length, endianness = LITTLE_ENDIAN) {
    const arr = new Array(length)
    for (let i = 0; i < length; i++) {
      arr[i] = this.readVector3(endianness)
    }
    return arr
  }

  writeVector3(vec, endianness = LITTLE_ENDIAN) {
    this.writeFloat32(vec.x, endianness)
    this.writeFloat32(vec.y, endianness)
    this.writeFloat32(vec.z, endianness)
  }

  writeVector3Array(values, endianness = LITTLE_ENDIAN) {
    for (let i = 0; i < values.length; i++) {
      this.writeVector3(values[i], endianness)
    }
  }

  readAnglef(endianness = LITTLE_ENDIAN) {
    const a = this.readFloat32(endianness)
    const b = this.readFloat32(endianness)
    const g = this.readFloat32(endianness)
    return new Anglef(a, b, g)
  }

  readAnglefArray(length, endianness = LITTLE_ENDIAN) {
    const arr = new Array(length)
    for (let i = 0; i < length; i++) {
      arr[i] = this.readAnglef(endianness)
    }
    return arr
  }

  writeAnglef(ang, endianness = LITTLE_ENDIAN) {
    this.writeFloat32(ang.a, endianness)
    this.writeFloat32(ang.b, endianness)
    this.writeFloat32(ang.g, endianness)
  }

  writeAnglefArray(values, endianness = LITTLE_ENDIAN) {
    for (let i = 0; i < values.length; i++) {
      this.writeAnglef(values[i], endianness)
    }
  }

  readColor(endianness = LITTLE_ENDIAN) {
    const r = this.readFloat32(endianness)
    const g = this.readFloat32(endianness)
    const b = this.readFloat32(endianness)
    return new Color(r, g, b)
  }

  readColorArray(length, endianness = LITTLE_ENDIAN) {
    const arr = new Array(length)
    for (let i = 0; i < length; i++) {
      arr[i] = this.readColor(endianness)
    }
    return arr
  }

  writeColor(col, endianness = LITTLE_ENDIAN) {
    this.writeFloat32(col.r, endianness)
    this.writeFloat32(col.g, endianness)
    this.writeFloat32(col.b, endianness)
  }

  writeColorArray(values, endianness = LITTLE_ENDIAN) {
    for (let i = 0; i < values.length; i++) {
      this.writeColor(values[i], endianness)
    }
  }

  readQuat(endianness = LITTLE_ENDIAN) {
    return {
      w: this.readFloat32(endianness),
      x: this.readFloat32(endianness),
      y: this.readFloat32(endianness),
      z: this.readFloat32(endianness),
    }
  }

  writeQuat(quat, endianness = LITTLE_ENDIAN) {
    this.writeFloat32(quat.w, endianness)
    this.writeFloat32(quat.x, endianness)
    this.writeFloat32(quat.y, endianness)
    this.writeFloat32(quat.z, endianness)
  }
}

BinaryIO.LITTLE_ENDIAN = LITTLE_ENDIAN
BinaryIO.BIG_ENDIAN = BIG_ENDIAN
BinaryIO.TRUNCATE_ZERO_BYTES = TRUNCATE_ZERO_BYTES
BinaryIO.KEEP_ZERO_BYTES = KEEP_ZERO_BYTES
module.exports = BinaryIO
