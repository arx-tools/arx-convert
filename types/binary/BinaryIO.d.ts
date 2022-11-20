import { TextIO } from './TextIO'

export const TRUNCATE_ZERO_BYTES = true
export const KEEP_ZERO_BYTES = false

export type TruncateZeroBytes = typeof TRUNCATE_ZERO_BYTES | typeof KEEP_ZERO_BYTES

export type ArxColor3 = {
  r: number
  g: number
  b: number
}

export type ArxColorRGBA = {
  r: number
  g: number
  b: number
  a: number
}

export type ArxVector3 = {
  x: number
  y: number
  z: number
}

export type ArxRotation = {
  a: number
  b: number
  g: number
}

export type ArxQuaternion = {
  x: number
  y: number
  z: number
  w: number
}

export declare class BinaryIO extends DataView {
  public position: number // TODO: make this private - this needs to be public because of TEA
  private textIO: TextIO

  constructor(buffer: Buffer, byteOffset: number, byteLength: number)

  readFloat32(): number
  readFloat32Array(length: number): number[]

  readInt8(): number
  readInt8Array(length: number): number[]
  readInt16(): number
  readInt16Array(length: number): number[]
  readInt32(): number
  readInt32Array(length: number): number[]

  readUint8(): number
  readUint8Array(length: number): number[]
  readUint16(): number
  readUint16Array(length: number): number[]
  readUint32(): number
  readUint32Array(length: number): number[]

  writeFloat32(value: number): void
  writeFloat32Array(values: number[]): void

  writeInt8(value: number): void
  writeInt8Array(values: number[]): void
  writeInt16(value: number): void
  writeInt16Array(values: number[]): void
  writeInt32(value: number): void
  writeInt32Array(values: number[]): void

  writeUint8(value: number): void
  writeUint8Array(values: number[]): void
  writeUint16(value: number): void
  writeUint16Array(values: number[]): void
  writeUint32(value: number): void
  writeUint32Array(values: number[]): void

  readString(length: number, truncateZeroBytes: TruncateZeroBytes): string
  writeString(str: string, length: number): void

  readVector3(): ArxVector3
  readVector3Array(length: number): ArxVector3[]
  writeVector3(vec: ArxVector3): void
  writeVector3Array(values: ArxVector3[]): void

  readRotation(): ArxRotation
  writeRotation(ang: ArxRotation): void

  readColor3(): ArxColor3
  writeColor3(color: ArxColor3): void

  readColorRGBA(): ArxColorRGBA
  writeColorRGBA(color: ArxColorRGBA): void

  readQuat(): ArxQuaternion
  writeQuat(quat: ArxQuaternion): void
}
