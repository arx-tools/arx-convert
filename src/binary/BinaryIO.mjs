import Vector3 from './Vector3.mjs'
import Anglef from './Anglef.mjs'
import Color from './Color.mjs'
import TextIO from './TextIO.mjs'

class BinaryIO extends DataView {
  constructor(buffer, byteOffset, byteLength) {
    super(buffer, byteOffset, byteLength)
    this.position = 0
    this.textIO = new TextIO('iso-8859-1')
  }

  readFloat32(littleEndian = LITTLE_ENDIAN) {
    const val = this.getFloat32(this.position, littleEndian)
    this.position += 4
    return val
  }

  readFloat32Array(length, littleEndian = LITTLE_ENDIAN) {
    const arr = new Array(length)
    for (let i = 0; i < length; i++) {
      arr[i] = this.readFloat32(littleEndian)
    }
    return arr
  }

  readFloat64(littleEndian = LITTLE_ENDIAN) {
    const val = this.getFloat64(this.position, littleEndian)
    this.position += 8
    return val
  }

  readFloat64Array(length, littleEndian = LITTLE_ENDIAN) {
    const arr = new Array(length)
    for (let i = 0; i < length; i++) {
      arr[i] = this.readFloat64(littleEndian)
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

  readInt16(littleEndian = LITTLE_ENDIAN) {
    const val = this.getInt16(this.position, littleEndian)
    this.position += 2
    return val
  }

  readInt16Array(length, littleEndian = LITTLE_ENDIAN) {
    const arr = new Array(length)
    for (let i = 0; i < length; i++) {
      arr[i] = this.readInt16(littleEndian)
    }
    return arr
  }

  readInt32(littleEndian = LITTLE_ENDIAN) {
    const val = this.getInt32(this.position, littleEndian)
    this.position += 4
    return val
  }

  readInt32Array(length, littleEndian = LITTLE_ENDIAN) {
    const arr = new Array(length)
    for (let i = 0; i < length; i++) {
      arr[i] = this.readInt32(littleEndian)
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

  readUint16(littleEndian = LITTLE_ENDIAN) {
    const val = this.getUint16(this.position, littleEndian)
    this.position += 2
    return val
  }

  readUint16Array(length, littleEndian = LITTLE_ENDIAN) {
    const arr = new Array(length)
    for (let i = 0; i < length; i++) {
      arr[i] = this.readUint16(littleEndian)
    }
    return arr
  }

  readUint32(littleEndian = LITTLE_ENDIAN) {
    const val = this.getUint32(this.position, littleEndian)
    this.position += 4
    return val
  }

  readUint32Array(length, littleEndian = LITTLE_ENDIAN) {
    const arr = new Array(length)
    for (let i = 0; i < length; i++) {
      arr[i] = this.readUint32(littleEndian)
    }
    return arr
  }

  writeFloat32(value, littleEndian = LITTLE_ENDIAN) {
    this.setFloat32(this.position, value, littleEndian)
    this.position += 4
  }

  writeFloat32Array(values, littleEndian = LITTLE_ENDIAN) {
    for (let i = 0; i < values.length; i++) {
      this.writeFloat32(values[i], littleEndian)
    }
  }

  writeFloat64(value, littleEndian = LITTLE_ENDIAN) {
    this.setFloat32(this.position, value, littleEndian)
    this.position += 4
  }

  writeFloat64Array(values, littleEndian = LITTLE_ENDIAN) {
    for (let i = 0; i < values.length; i++) {
      this.writeFloat64(values[i], littleEndian)
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

  writeInt16(value, littleEndian = LITTLE_ENDIAN) {
    this.setInt16(this.position, value, littleEndian)
    this.position += 2
  }

  writeInt16Array(values, littleEndian = LITTLE_ENDIAN) {
    for (let i = 0; i < values.length; i++) {
      this.writeInt16(values[i], littleEndian)
    }
  }

  writeInt32(value, littleEndian = LITTLE_ENDIAN) {
    this.setInt32(this.position, value, littleEndian)
    this.position += 4
  }

  writeInt32Array(values, littleEndian = LITTLE_ENDIAN) {
    for (let i = 0; i < values.length; i++) {
      this.writeInt32(values[i], littleEndian)
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

  writeUint16(value, littleEndian = LITTLE_ENDIAN) {
    this.setUint16(this.position, value, littleEndian)
    this.position += 2
  }

  writeUint16Array(values, littleEndian = LITTLE_ENDIAN) {
    for (let i = 0; i < values.length; i++) {
      this.writeUint16(values[i], littleEndian)
    }
  }

  writeUint32(value, littleEndian = LITTLE_ENDIAN) {
    this.setUint32(this.position, value, littleEndian)
    this.position += 4
  }

  writeUint32Array(values, littleEndian = LITTLE_ENDIAN) {
    for (let i = 0; i < values.length; i++) {
      this.writeUint32(values[i], littleEndian)
    }
  }

  readBigInt64(littleEndian = LITTLE_ENDIAN) {
    const val = this.getBigInt64(this.position, littleEndian)
    this.position += 8
    return val
  }

  readBigInt64Array(length, littleEndian = LITTLE_ENDIAN) {
    const arr = new Array(length)
    for (let i = 0; i < length; i++) {
      arr[i] = this.readBigInt64(littleEndian)
    }
    return arr
  }

  readBigUint64(littleEndian = LITTLE_ENDIAN) {
    const val = this.getBigUint64(this.position, littleEndian)
    this.position += 8
    return val
  }

  readBigUint64Array(length, littleEndian = LITTLE_ENDIAN) {
    const arr = new Array(length)
    for (let i = 0; i < length; i++) {
      arr[i] = this.readBigUint64(littleEndian)
    }
    return arr
  }

  writeBigInt64(value, littleEndian = LITTLE_ENDIAN) {
    this.setBigInt64(this.position, value, littleEndian)
    this.position += 8
  }

  writeBigInt64Array(values, littleEndian = LITTLE_ENDIAN) {
    for (let i = 0; i < values.length; i++) {
      this.writeBigInt64(values[i], littleEndian)
    }
  }

  writeBigUint64(value, littleEndian = LITTLE_ENDIAN) {
    this.setBigUint64(this.position, value, littleEndian)
    this.position += 8
  }

  writeBigUint64Array(values, littleEndian = LITTLE_ENDIAN) {
    for (let i = 0; i < values.length; i++) {
      this.writeBigUint64(values[i], littleEndian)
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
      const charCodes = new Array(length)
      charCodes.fill(0)

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

  // vector3
  readVector3(littleEndian = LITTLE_ENDIAN) {
    const x = this.readFloat32(littleEndian)
    const y = this.readFloat32(littleEndian)
    const z = this.readFloat32(littleEndian)
    return new Vector3(x, y, z)
  }

  readVector3Array(length, littleEndian = LITTLE_ENDIAN) {
    const arr = new Array(length)
    for (let i = 0; i < length; i++) {
      arr[i] = this.readVector3(littleEndian)
    }
    return arr
  }

  writeVector3(vec, littleEndian = LITTLE_ENDIAN) {
    this.writeFloat32(vec.x, littleEndian)
    this.writeFloat32(vec.y, littleEndian)
    this.writeFloat32(vec.z, littleEndian)
  }

  writeVector3Array(values, littleEndian = LITTLE_ENDIAN) {
    for (let i = 0; i < values.length; i++) {
      this.writeVector3(values[i], littleEndian)
    }
  }

  // anglef
  readAnglef(littleEndian = LITTLE_ENDIAN) {
    const a = this.readFloat32(littleEndian)
    const b = this.readFloat32(littleEndian)
    const g = this.readFloat32(littleEndian)
    return new Anglef(a, b, g)
  }

  readAnglefArray(length, littleEndian = LITTLE_ENDIAN) {
    const arr = new Array(length)
    for (let i = 0; i < length; i++) {
      arr[i] = this.readAnglef(littleEndian)
    }
    return arr
  }

  writeAnglef(ang, littleEndian = LITTLE_ENDIAN) {
    this.writeFloat32(ang.a, littleEndian)
    this.writeFloat32(ang.b, littleEndian)
    this.writeFloat32(ang.g, littleEndian)
  }

  writeAnglefArray(values, littleEndian = LITTLE_ENDIAN) {
    for (let i = 0; i < values.length; i++) {
      this.writeAnglef(values[i], littleEndian)
    }
  }

  // color
  readColor(littleEndian = LITTLE_ENDIAN) {
    const r = this.readFloat32(littleEndian)
    const g = this.readFloat32(littleEndian)
    const b = this.readFloat32(littleEndian)
    return new Color(r, g, b)
  }

  readColorArray(length, littleEndian = LITTLE_ENDIAN) {
    const arr = new Array(length)
    for (let i = 0; i < length; i++) {
      arr[i] = this.readColor(littleEndian)
    }
    return arr
  }

  writeColor(col, littleEndian = LITTLE_ENDIAN) {
    this.writeFloat32(col.r, littleEndian)
    this.writeFloat32(col.g, littleEndian)
    this.writeFloat32(col.b, littleEndian)
  }

  writeColorArray(values, littleEndian = LITTLE_ENDIAN) {
    for (let i = 0; i < values.length; i++) {
      this.writeColor(values[i], littleEndian)
    }
  }
}

export const LITTLE_ENDIAN = true
export const BIG_ENDIAN = false
export const TRUNCATE_ZERO_BYTES = true
export const KEEP_ZERO_BYTES = false

export default BinaryIO
