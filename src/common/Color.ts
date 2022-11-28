import { Buffer } from 'node:buffer'
import { BinaryIO } from '../binary/BinaryIO'
import { getLowestByte } from './helpers'

type ColorMode = 'bgra' | 'rgb' | 'abgr'

export type ArxColor = {
  r: number
  g: number
  b: number
  a: number
}

export class Color {
  static readFrom(binary: BinaryIO, mode: ColorMode): ArxColor {
    if (mode === 'bgra') {
      const [b, g, r, a] = binary.readUint8Array(4)
      return { r, g, b, a }
    } else if (mode === 'abgr') {
      const [a, b, g, r] = binary.readUint8Array(4)
      return { r, g, b, a }
    } else {
      const [r, g, b] = binary.readInt32Array(3).map(getLowestByte)
      return { r, g, b, a: 1 }
    }
  }

  static accumulateFrom({ r, g, b, a }: ArxColor, mode: ColorMode) {
    const buffer = Buffer.alloc(Color.sizeOf(mode))
    const binary = new BinaryIO(buffer.buffer)

    if (mode === 'bgra') {
      binary.writeUint8Array([b, g, r, a])
    } else if (mode === 'abgr') {
      binary.writeUint8Array([a, b, g, r])
    } else {
      binary.writeInt32Array([r, g, b])
    }

    return buffer
  }

  static sizeOf(mode: ColorMode) {
    return mode === 'rgb' ? 12 : 4
  }
}

module.exports = { Color }
