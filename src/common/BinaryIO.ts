import { decodeText, encodeText, repeat } from '@common/helpers.js'
import { LITTLE_ENDIAN, TRUNCATE_ZERO_BYTES, KEEP_ZERO_BYTES, BYTE_OF_AN_UNKNOWN_CHAR } from '@common/constants.js'
import { type ArxQuaternion, type ArxRotation, type ArxVector3 } from '@common/types.js'

export class BinaryIO extends DataView {
  static sizeOfFloat32(): 4 {
    return 4 as const
  }

  static sizeOfFloat32Array(length: number): number {
    return length * BinaryIO.sizeOfFloat32()
  }

  static sizeOfInt8(): 1 {
    return 1 as const
  }

  static sizeOfInt8Array(length: number): number {
    return length * BinaryIO.sizeOfInt8()
  }

  static sizeOfInt16(): 2 {
    return 2 as const
  }

  static sizeOfInt16Array(length: number): number {
    return length * BinaryIO.sizeOfInt16()
  }

  static sizeOfInt32(): 4 {
    return 4 as const
  }

  static sizeOfInt32Array(length: number): number {
    return length * BinaryIO.sizeOfInt32()
  }

  static sizeOfUint8(): 1 {
    return 1 as const
  }

  static sizeOfUint8Array(length: number): number {
    return length * BinaryIO.sizeOfUint8()
  }

  static sizeOfUint16(): 2 {
    return 2 as const
  }

  static sizeOfUint16Array(length: number): number {
    return length * BinaryIO.sizeOfUint16()
  }

  static sizeOfUint32(): 4 {
    return 4 as const
  }

  static sizeOfUint32Array(length: number): number {
    return length * BinaryIO.sizeOfUint32()
  }

  static sizeOfString(length: number): number {
    return length
  }

  static sizeOfNullTerminatedString(str: string): number {
    return str.length + 1
  }

  static sizeOfVector3(): number {
    return BinaryIO.sizeOfFloat32Array(3)
  }

  static sizeOfVector3Array(length: number): number {
    return length * BinaryIO.sizeOfVector3()
  }

  static sizeOfRotation(): number {
    return BinaryIO.sizeOfFloat32Array(3)
  }

  static sizeOfQuat(): number {
    return BinaryIO.sizeOfFloat32Array(4)
  }

  public position: number // TODO: make this private - this needs to be public because of TEA

  constructor(buffer: ArrayBuffer, byteOffset?: number, byteLength?: number) {
    super(buffer, byteOffset, byteLength)
    this.position = 0
  }

  readFloat32(): number {
    const val = this.getFloat32(this.position, LITTLE_ENDIAN)
    this.position = this.position + BinaryIO.sizeOfFloat32()
    return val
  }

  readFloat32Array(length: number): number[] {
    const arr = []
    for (let i = 0; i < length; i++) {
      arr.push(this.readFloat32())
    }

    return arr
  }

  readInt8(): number {
    const val = this.getInt8(this.position)
    this.position = this.position + BinaryIO.sizeOfInt8()
    return val
  }

  readInt8Array(length: number): number[] {
    const arr = []
    for (let i = 0; i < length; i++) {
      arr.push(this.readInt8())
    }

    return arr
  }

  readInt16(): number {
    const val = this.getInt16(this.position, LITTLE_ENDIAN)
    this.position = this.position + BinaryIO.sizeOfInt16()
    return val
  }

  readInt16Array(length: number): number[] {
    const arr = []
    for (let i = 0; i < length; i++) {
      arr.push(this.readInt16())
    }

    return arr
  }

  readInt32(): number {
    const val = this.getInt32(this.position, LITTLE_ENDIAN)
    this.position = this.position + BinaryIO.sizeOfInt32()
    return val
  }

  readInt32Array(length: number): number[] {
    const arr = []
    for (let i = 0; i < length; i++) {
      arr.push(this.readInt32())
    }

    return arr
  }

  readUint8(): number {
    const val = this.getUint8(this.position)
    this.position = this.position + BinaryIO.sizeOfUint8()
    return val
  }

  readUint8Array(length: number): number[] {
    const arr = []
    for (let i = 0; i < length; i++) {
      arr.push(this.readUint8())
    }

    return arr
  }

  readUint16(): number {
    const val = this.getUint16(this.position, LITTLE_ENDIAN)
    this.position = this.position + BinaryIO.sizeOfUint16()
    return val
  }

  readUint16Array(length: number): number[] {
    const arr = []
    for (let i = 0; i < length; i++) {
      arr.push(this.readUint16())
    }

    return arr
  }

  readUint32(): number {
    const val = this.getUint32(this.position, LITTLE_ENDIAN)
    this.position = this.position + BinaryIO.sizeOfUint32()
    return val
  }

  readUint32Array(length: number): number[] {
    const arr = []
    for (let i = 0; i < length; i++) {
      arr.push(this.readUint32())
    }

    return arr
  }

  writeFloat32(value: number): void {
    this.setFloat32(this.position, value, LITTLE_ENDIAN)
    this.position = this.position + BinaryIO.sizeOfFloat32()
  }

  writeFloat32Array(values: number[]): void {
    values.forEach((value) => {
      this.writeFloat32(value)
    })
  }

  writeInt8(value: number): void {
    this.setInt8(this.position, value)
    this.position = this.position + BinaryIO.sizeOfInt8()
  }

  writeInt8Array(values: number[]): void {
    values.forEach((value) => {
      this.writeInt8(value)
    })
  }

  writeInt16(value: number): void {
    this.setInt16(this.position, value, LITTLE_ENDIAN)
    this.position = this.position + BinaryIO.sizeOfInt16()
  }

  writeInt16Array(values: number[]): void {
    values.forEach((value) => {
      this.writeInt16(value)
    })
  }

  writeInt32(value: number): void {
    this.setInt32(this.position, value, LITTLE_ENDIAN)
    this.position = this.position + BinaryIO.sizeOfInt32()
  }

  writeInt32Array(values: number[]): void {
    values.forEach((value) => {
      this.writeInt32(value)
    })
  }

  writeUint8(value: number): void {
    this.setUint8(this.position, value)
    this.position = this.position + BinaryIO.sizeOfUint8()
  }

  writeUint8Array(values: number[] | ArrayBuffer): void {
    if (values instanceof ArrayBuffer) {
      new Uint8Array(values).forEach((value) => {
        this.writeUint8(value)
      })
    } else {
      values.forEach((value) => {
        this.writeUint8(value)
      })
    }
  }

  writeUint16(value: number): void {
    this.setUint16(this.position, value, LITTLE_ENDIAN)
    this.position = this.position + BinaryIO.sizeOfUint16()
  }

  writeUint16Array(values: number[]): void {
    values.forEach((value) => {
      this.writeUint16(value)
    })
  }

  writeUint32(value: number): void {
    this.setUint32(this.position, value, LITTLE_ENDIAN)
    this.position = this.position + BinaryIO.sizeOfUint32()
  }

  writeUint32Array(values: number[]): void {
    values.forEach((value) => {
      this.writeUint32(value)
    })
  }

  readString(
    length?: number,
    truncateZeroBytes: typeof TRUNCATE_ZERO_BYTES | typeof KEEP_ZERO_BYTES = TRUNCATE_ZERO_BYTES,
  ): string {
    const codes: number[] = []

    if (length === undefined) {
      let c = this.readUint8()
      while (c !== 0) {
        codes.push(c)
        c = this.readUint8()
      }
    } else {
      let gotNil = false
      for (let i = 0; i < length; i++) {
        const c = this.readUint8()
        if (gotNil && truncateZeroBytes === TRUNCATE_ZERO_BYTES) {
          continue
        }

        if (c === 0) {
          gotNil = true
        }

        if (c !== 0 || truncateZeroBytes === KEEP_ZERO_BYTES) {
          if (c === 0) {
            codes.push(BYTE_OF_AN_UNKNOWN_CHAR)
          } else {
            codes.push(c)
          }
        }
      }
    }

    return decodeText(codes)
  }

  writeString(str: string, length?: number): void {
    // if length is given we assume a fixed length string
    if (length === undefined) {
      // otherwise its a 0 terminated c string
      encodeText(str).forEach((charCode) => {
        this.writeUint8(charCode)
      })
      this.writeUint8(0)
    } else {
      const charCodes = repeat(0, length)

      // replacing 0s in charCodes one by one from left to right
      encodeText(str).forEach((charCode, index) => {
        charCodes[index] = charCode
      })

      charCodes.forEach((charCode) => {
        this.writeUint8(charCode)
      })
    }
  }

  readVector3(): ArxVector3 {
    const [x, y, z] = this.readFloat32Array(3)
    return { x, y, z }
  }

  readVector3Array(length: number): ArxVector3[] {
    const arr = []
    for (let i = 0; i < length; i++) {
      arr.push(this.readVector3())
    }

    return arr
  }

  writeVector3({ x, y, z }: ArxVector3): void {
    this.writeFloat32Array([x, y, z])
  }

  writeVector3Array(values: ArxVector3[]): void {
    values.forEach((value) => {
      this.writeVector3(value)
    })
  }

  readRotation(): ArxRotation {
    const [a, b, g] = this.readFloat32Array(3)
    return { a, b, g }
  }

  writeRotation({ a, b, g }: ArxRotation): void {
    this.writeFloat32Array([a, b, g])
  }

  readQuat(): ArxQuaternion {
    const [w, x, y, z] = this.readFloat32Array(4)
    return { x, y, z, w }
  }

  writeQuat({ x, y, z, w }: ArxQuaternion): void {
    this.writeFloat32Array([w, x, y, z])
  }

  writeBuffer(buffer: ArrayBuffer): void {
    this.writeUint8Array(buffer)
  }
}
