import { BinaryIO } from '@common/BinaryIO.js'

type ColorMode = 'abgr' | 'bgra' | 'rgb'

/**
 * Color containing red, green, blue and alpha channels
 *
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/graphics/GraphicsFormat.h#L29
 */
export type ArxColor = {
  /**
   * red channel, integer between 0 and 255
   *
   * - 0 = darkest, lowest intensity
   * - 255 = brightest, most intensity
   */
  r: number
  /**
   * green channel, integer between 0 and 255
   *
   * - 0 = darkest, lowest intensity
   * - 255 = brightest, most intensity
   */
  g: number
  /**
   * blue channel, integer between 0 and 255
   *
   * - 0 = darkest, lowest intensity
   * - 255 = brightest, most intensity
   */
  b: number
  /**
   * alpha channel, float between 0.0 and 1.0
   *
   * - 0.0 = fully transparent
   * - 1.0 = fully opaque
   */
  a: number
}

export class Color {
  static readFrom(binary: BinaryIO<ArrayBufferLike>, mode: ColorMode): ArxColor {
    switch (mode) {
      case 'abgr': {
        const [a, b, g, r] = binary.readUint8Array(4)
        return { r, g, b, a: a / 255 }
      }

      case 'bgra': {
        const [b, g, r, a] = binary.readUint8Array(4)
        return { r, g, b, a: a / 255 }
      }

      case 'rgb': {
        const [r, g, b] = binary.readFloat32Array(3)
        return { r: r * 255, g: g * 255, b: b * 255, a: 1 }
      }
    }
  }

  static accumulateFrom({ r, g, b, a }: ArxColor, mode: ColorMode): ArrayBuffer {
    const buffer = new ArrayBuffer(Color.sizeOf(mode))
    const binary = new BinaryIO(buffer)

    switch (mode) {
      case 'abgr': {
        binary.writeUint8Array([a * 255, b, g, r])
        break
      }

      case 'bgra': {
        binary.writeUint8Array([b, g, r, a * 255])
        break
      }

      case 'rgb': {
        binary.writeFloat32Array([r / 255, g / 255, b / 255])
        break
      }
    }

    return buffer
  }

  static sizeOf(mode: ColorMode): number {
    switch (mode) {
      case 'abgr':
      case 'bgra': {
        return BinaryIO.sizeOfUint8Array(4)
      }

      case 'rgb': {
        return BinaryIO.sizeOfFloat32Array(3)
      }
    }
  }

  static get black(): ArxColor {
    return {
      r: 0,
      g: 0,
      b: 0,
      a: 1,
    }
  }

  static get transparent(): ArxColor {
    return {
      r: 0,
      g: 0,
      b: 0,
      a: 0,
    }
  }
}
