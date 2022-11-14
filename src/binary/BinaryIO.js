const { TextIO } = require('./TextIO.js')
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

  readFloat32() {
    const val = this.getFloat32(this.position, LITTLE_ENDIAN)
    this.position += 4
    return val
  }

  readFloat32Array(length) {
    const arr = new Array(length)
    for (let i = 0; i < length; i++) {
      arr[i] = this.readFloat32()
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

  readInt16() {
    const val = this.getInt16(this.position, LITTLE_ENDIAN)
    this.position += 2
    return val
  }

  readInt16Array(length) {
    const arr = new Array(length)
    for (let i = 0; i < length; i++) {
      arr[i] = this.readInt16()
    }
    return arr
  }

  readInt32() {
    const val = this.getInt32(this.position, LITTLE_ENDIAN)
    this.position += 4
    return val
  }

  readInt32Array(length) {
    const arr = new Array(length)
    for (let i = 0; i < length; i++) {
      arr[i] = this.readInt32()
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

  readUint16() {
    const val = this.getUint16(this.position, LITTLE_ENDIAN)
    this.position += 2
    return val
  }

  readUint16Array(length) {
    const arr = new Array(length)
    for (let i = 0; i < length; i++) {
      arr[i] = this.readUint16()
    }
    return arr
  }

  readUint32() {
    const val = this.getUint32(this.position, LITTLE_ENDIAN)
    this.position += 4
    return val
  }

  readUint32Array(length) {
    const arr = new Array(length)
    for (let i = 0; i < length; i++) {
      arr[i] = this.readUint32()
    }
    return arr
  }

  writeFloat32(value) {
    this.setFloat32(this.position, value, LITTLE_ENDIAN)
    this.position += 4
  }

  writeFloat32Array(values) {
    for (let i = 0; i < values.length; i++) {
      this.writeFloat32(values[i])
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

  writeInt16(value) {
    this.setInt16(this.position, value, LITTLE_ENDIAN)
    this.position += 2
  }

  writeInt16Array(values) {
    for (let i = 0; i < values.length; i++) {
      this.writeInt16(values[i])
    }
  }

  writeInt32(value) {
    this.setInt32(this.position, value, LITTLE_ENDIAN)
    this.position += 4
  }

  writeInt32Array(values) {
    for (let i = 0; i < values.length; i++) {
      this.writeInt32(values[i])
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

  writeUint16(value) {
    this.setUint16(this.position, value, LITTLE_ENDIAN)
    this.position += 2
  }

  writeUint16Array(values) {
    for (let i = 0; i < values.length; i++) {
      this.writeUint16(values[i])
    }
  }

  writeUint32(value) {
    this.setUint32(this.position, value, LITTLE_ENDIAN)
    this.position += 4
  }

  writeUint32Array(values) {
    for (let i = 0; i < values.length; i++) {
      this.writeUint32(values[i])
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

      charCodes.forEach((charCode) => {
        this.writeUint8(charCode)
      })
    } else {
      // otherwise its a 0 terminated c string
      this.textIO.encode(str).forEach((charCode) => {
        this.writeUint8(charCode)
      })
      this.writeUint8(0)
    }
  }

  readVector3() {
    const x = this.readFloat32()
    const y = this.readFloat32()
    const z = this.readFloat32()
    return { x, y, z }
  }

  readVector3Array(length) {
    const arr = new Array(length)
    for (let i = 0; i < length; i++) {
      arr[i] = this.readVector3()
    }
    return arr
  }

  writeVector3({ x, y, z }) {
    this.writeFloat32(x)
    this.writeFloat32(y)
    this.writeFloat32(z)
  }

  writeVector3Array(values) {
    for (let i = 0; i < values.length; i++) {
      this.writeVector3(values[i])
    }
  }

  readRotation() {
    const a = this.readFloat32()
    const b = this.readFloat32()
    const g = this.readFloat32()
    return { a, b, g }
  }

  writeRotation({ a, b, g }) {
    this.writeFloat32(a)
    this.writeFloat32(b)
    this.writeFloat32(g)
  }

  readColor() {
    const r = this.readFloat32()
    const g = this.readFloat32()
    const b = this.readFloat32()
    return { r, g, b }
  }

  writeColor({ r, g, b }) {
    this.writeFloat32(r)
    this.writeFloat32(g)
    this.writeFloat32(b)
  }

  readQuat() {
    const w = this.readFloat32()
    const x = this.readFloat32()
    const y = this.readFloat32()
    const z = this.readFloat32()
    return { x, y, z, w }
  }

  writeQuat({ x, y, z, w }) {
    this.writeFloat32(w)
    this.writeFloat32(x)
    this.writeFloat32(y)
    this.writeFloat32(z)
  }
}

module.exports = {
  BinaryIO,
  TRUNCATE_ZERO_BYTES,
  KEEP_ZERO_BYTES,
}
