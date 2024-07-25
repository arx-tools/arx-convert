import { Buffer } from 'node:buffer'
import { BinaryIO } from '@common/BinaryIO.js'

type ColorMode = 'bgra' | 'rgb' | 'abgr'

/**
 * Color containing red, green, blue and alpha channels
 *
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/graphics/GraphicsFormat.h#L29
 */
export type ArxColor = {
  /** red channel, integer between 0 and 255 */
  r: number
  /** green channel, integer between 0 and 255 */
  g: number
  /** blue channel, integer between 0 and 255 */
  b: number
  /** alpha channel, float between 0.0 and 1.0 */
  a: number
}

export class Color {
  static readFrom(binary: BinaryIO, mode: ColorMode): ArxColor {
    if (mode === 'bgra') {
      const [b, g, r, a] = binary.readUint8Array(4)
      return { r, g, b, a: a / 255 }
    }

    if (mode === 'abgr') {
      const [a, b, g, r] = binary.readUint8Array(4)
      return { r, g, b, a: a / 255 }
    }

    const [r, g, b] = binary.readFloat32Array(3)
    return { r: r * 255, g: g * 255, b: b * 255, a: 1 }
  }

  static accumulateFrom({ r, g, b, a }: ArxColor, mode: ColorMode) {
    const buffer = Buffer.alloc(Color.sizeOf(mode))
    const binary = new BinaryIO(buffer)

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
    if (mode === 'rgb') {
      return BinaryIO.sizeOfFloat32Array(3)
    }

    return BinaryIO.sizeOfUint8Array(4)
  }

  static get black(): ArxColor {
    return { r: 0, g: 0, b: 0, a: 1 }
  }

  static get transparent(): ArxColor {
    return { r: 0, g: 0, b: 0, a: 0 }
  }
}
