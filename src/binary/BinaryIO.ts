import { TextIO } from './TextIO'
import { repeat } from '../common/helpers'
import { LITTLE_ENDIAN, TRUNCATE_ZERO_BYTES, KEEP_ZERO_BYTES, SPACE } from '../common/constants'
import { ArxQuaternion, ArxRotation, ArxVector3 } from '../common/types'

export class BinaryIO extends DataView {
  public position: number // TODO: make this private - this needs to be public because of TEA

  constructor(buffer: ArrayBufferLike, byteOffset?: number, byteLength?: number) {
    super(buffer, byteOffset, byteLength)
    this.position = 0
  }

  readFloat32() {
    const val = this.getFloat32(this.position, LITTLE_ENDIAN)
    this.position += 4
    return val
  }

  readFloat32Array(length: number) {
    const arr: number[] = []
    for (let i = 0; i < length; i++) {
      arr.push(this.readFloat32())
    }
    return arr
  }

  readInt8() {
    const val = this.getInt8(this.position)
    this.position += 1
    return val
  }

  readInt8Array(length: number) {
    const arr: number[] = []
    for (let i = 0; i < length; i++) {
      arr.push(this.readInt8())
    }
    return arr
  }

  readInt16() {
    const val = this.getInt16(this.position, LITTLE_ENDIAN)
    this.position += 2
    return val
  }

  readInt16Array(length: number) {
    const arr: number[] = []
    for (let i = 0; i < length; i++) {
      arr.push(this.readInt16())
    }
    return arr
  }

  readInt32() {
    const val = this.getInt32(this.position, LITTLE_ENDIAN)
    this.position += 4
    return val
  }

  readInt32Array(length: number) {
    const arr: number[] = []
    for (let i = 0; i < length; i++) {
      arr.push(this.readInt32())
    }
    return arr
  }

  readUint8() {
    const val = this.getUint8(this.position)
    this.position += 1
    return val
  }

  readUint8Array(length: number) {
    const arr: number[] = []
    for (let i = 0; i < length; i++) {
      arr.push(this.readUint8())
    }
    return arr
  }

  readUint16() {
    const val = this.getUint16(this.position, LITTLE_ENDIAN)
    this.position += 2
    return val
  }

  readUint16Array(length: number) {
    const arr: number[] = []
    for (let i = 0; i < length; i++) {
      arr.push(this.readUint16())
    }
    return arr
  }

  readUint32() {
    const val = this.getUint32(this.position, LITTLE_ENDIAN)
    this.position += 4
    return val
  }

  readUint32Array(length: number) {
    const arr: number[] = []
    for (let i = 0; i < length; i++) {
      arr.push(this.readUint32())
    }
    return arr
  }

  writeFloat32(value: number) {
    this.setFloat32(this.position, value, LITTLE_ENDIAN)
    this.position += 4
  }

  writeFloat32Array(values: number[]) {
    values.forEach((value) => {
      this.writeFloat32(value)
    })
  }

  writeInt8(value: number) {
    this.setInt8(this.position, value)
    this.position += 1
  }

  writeInt8Array(values: number[]) {
    values.forEach((value) => {
      this.writeInt8(value)
    })
  }

  writeInt16(value: number) {
    this.setInt16(this.position, value, LITTLE_ENDIAN)
    this.position += 2
  }

  writeInt16Array(values: number[]) {
    values.forEach((value) => {
      this.writeInt16(value)
    })
  }

  writeInt32(value: number) {
    this.setInt32(this.position, value, LITTLE_ENDIAN)
    this.position += 4
  }

  writeInt32Array(values: number[]) {
    values.forEach((value) => {
      this.writeInt32(value)
    })
  }

  writeUint8(value: number) {
    this.setUint8(this.position, value)
    this.position += 1
  }

  writeUint8Array(values: number[] | Uint8Array) {
    values.forEach((value) => {
      this.writeUint8(value)
    })
  }

  writeUint16(value: number) {
    this.setUint16(this.position, value, LITTLE_ENDIAN)
    this.position += 2
  }

  writeUint16Array(values: number[]) {
    values.forEach((value) => {
      this.writeUint16(value)
    })
  }

  writeUint32(value: number) {
    this.setUint32(this.position, value, LITTLE_ENDIAN)
    this.position += 4
  }

  writeUint32Array(values: number[]) {
    values.forEach((value) => {
      this.writeUint32(value)
    })
  }

  readString(length?: number, truncateZeroBytes = TRUNCATE_ZERO_BYTES) {
    const codes: number[] = []

    if (length !== undefined) {
      for (let i = 0; i < length; i++) {
        let c = this.readUint8()
        if (c !== 0 || truncateZeroBytes === KEEP_ZERO_BYTES) {
          codes.push(c === 0 ? SPACE : c)
        }
      }
    } else {
      let c = this.readUint8()
      while (c !== 0) {
        codes.push(c)
        c = this.readUint8()
      }
    }

    return TextIO.decode(codes)
  }

  writeString(str: string, length: number) {
    // if length is given we assume a fixed length string
    if (length !== undefined) {
      const charCodes = repeat(0, length)

      // replacing 0s in charCodes one by one from left to right
      TextIO.encode(str).forEach((charCode, index) => {
        charCodes[index] = charCode
      })

      charCodes.forEach((charCode) => {
        this.writeUint8(charCode)
      })
    } else {
      // otherwise its a 0 terminated c string
      TextIO.encode(str).forEach((charCode) => {
        this.writeUint8(charCode)
      })
      this.writeUint8(0)
    }
  }

  readVector3() {
    const [x, y, z] = this.readFloat32Array(3)
    return { x, y, z } as ArxVector3
  }

  readVector3Array(length: number) {
    const arr: ArxVector3[] = []
    for (let i = 0; i < length; i++) {
      arr.push(this.readVector3())
    }
    return arr
  }

  writeVector3({ x, y, z }: ArxVector3) {
    this.writeFloat32Array([x, y, z])
  }

  writeVector3Array(values: ArxVector3[]) {
    values.forEach((value) => {
      this.writeVector3(value)
    })
  }

  readRotation() {
    const [a, b, g] = this.readFloat32Array(3)
    return { a, b, g } as ArxRotation
  }

  writeRotation({ a, b, g }: ArxRotation) {
    this.writeFloat32Array([a, b, g])
  }

  readQuat() {
    const [w, x, y, z] = this.readFloat32Array(4)
    return { x, y, z, w } as ArxQuaternion
  }

  writeQuat({ x, y, z, w }: ArxQuaternion) {
    this.writeFloat32Array([w, x, y, z])
  }

  writeBuffer(buffer: Buffer) {
    this.writeUint8Array(buffer)
  }
}
