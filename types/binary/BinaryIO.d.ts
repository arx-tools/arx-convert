import { TextIO } from './TextIO'

export const LITTLE_ENDIAN = true
export const BIG_ENDIAN = false
export const TRUNCATE_ZERO_BYTES = true
export const KEEP_ZERO_BYTES = false

export type Endianness = typeof LITTLE_ENDIAN | typeof BIG_ENDIAN
export type TruncateZeroBytes = typeof TRUNCATE_ZERO_BYTES | typeof KEEP_ZERO_BYTES

export type Color = {
  r: number
  g: number
  b: number
}

export type Vector3 = {
  x: number
  y: number
  z: number
}

export type Rotation = {
  a: number
  b: number
  g: number
}

export type Quaternion = {
  x: number
  y: number
  z: number
  w: number
}

export declare class BinaryIO extends DataView {
  public position: number // TODO: make this private - this needs to be public because of TEA
  public textIO: TextIO

  constructor(buffer: Buffer, byteOffset: number, byteLength: number)

  readFloat32(endianness: Endianness): number
  readFloat32Array(length: number, endianness: Endianness): number[]

  readInt8(): number
  readInt8Array(length: number): number[]
  readInt16(endianness: Endianness): number
  readInt16Array(length: number, endianness: Endianness): number[]
  readInt32(endianness: Endianness): number
  readInt32Array(length: number, endianness: Endianness): number[]

  readUint8(): number
  readUint8Array(length: number): number[]
  readUint16(endianness: Endianness): number
  readUint16Array(length: number, endianness: Endianness): number[]
  readUint32(endianness: Endianness): number
  readUint32Array(length: number, endianness: Endianness): number[]

  writeFloat32(value: number, endianness: Endianness): void
  writeFloat32Array(values: number[], endianness: Endianness): void

  writeInt8(value: number): void
  writeInt8Array(values: number[]): void
  writeInt16(value: number, endianness: Endianness): void
  writeInt16Array(values: number[], endianness: Endianness): void
  writeInt32(value: number, endianness: Endianness): void
  writeInt32Array(values: number[], endianness: Endianness): void

  writeUint8(value: number): void
  writeUint8Array(values: number[]): void
  writeUint16(value: number, endianness: Endianness): void
  writeUint16Array(values: number[], endianness: Endianness): void
  writeUint32(value: number, endianness: Endianness): void
  writeUint32Array(values: number[], endianness: Endianness): void

  readString(length: number, truncateZeroBytes: TruncateZeroBytes): string
  writeString(str: string, length: number): void

  readVector3(endianness: Endianness): Vector3
  readVector3Array(length: number, endianness: Endianness): Vector3[]
  writeVector3(vec: Vector3, endianness: Endianness): void
  writeVector3Array(values: Vector3[], endianness: Endianness): void

  readRotation(endianness: Endianness): Rotation
  writeRotation(ang: Rotation, endianness: Endianness): void

  readColor(endianness: Endianness): Color
  writeColor({ r, g, b }: Color, endianness: Endianness): void

  readQuat(endianness: Endianness): Quaternion
  writeQuat(quat: Quaternion, endianness: Endianness): void
}
