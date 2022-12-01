import { Buffer } from 'node:buffer'
import { BinaryIO } from './BinaryIO'

type ColorMode = 'bgra' | 'rgb' | 'abgr'

export type ArxColor = {
  r: number // between 0 and 255
  g: number // between 0 and 255
  b: number // between 0 and 255
  a: number // between 0.0 and 1.0
}

export class Color {
  static readFrom(binary: BinaryIO, mode: ColorMode): ArxColor {
    if (mode === 'bgra') {
      const [b, g, r, a] = binary.readUint8Array(4)
      return { r, g, b, a: a / 255 }
    } else if (mode === 'abgr') {
      const [a, b, g, r] = binary.readUint8Array(4)
      return { r, g, b, a: a / 255 }
    } else {
      const [r, g, b] = binary.readFloat32Array(3)
      return { r: r * 255, g: g * 255, b: b * 255, a: 1 }
    }
  }

  static accumulateFrom({ r, g, b, a }: ArxColor, mode: ColorMode) {
    const buffer = Buffer.alloc(Color.sizeOf(mode))
    const binary = new BinaryIO(buffer.buffer)

    if (mode === 'bgra') {
      binary.writeUint8Array([b, g, r, a * 255])
    } else if (mode === 'abgr') {
      binary.writeUint8Array([a * 255, b, g, r])
    } else {
      binary.writeFloat32Array([r / 255, g / 255, b / 255])
    }

    return buffer
  }

  static sizeOf(mode: ColorMode) {
    return mode === 'rgb' ? 3 * 4 : 4 * 1
  }
}
