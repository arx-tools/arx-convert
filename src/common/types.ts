// eslint-disable-next-line unused-imports/no-unused-imports -- it is used in jsdoc block
import type { BinaryIO } from '@common/BinaryIO.js'

/**
 * A 32-bit (single precision) IEEE-754 floating point number, exactly as it is stored in the binary formats
 * of Arx Fatalis (on 4 bytes).
 *
 * JavaScript has no float32 type: every `number` is a 64-bit (double precision) IEEE-754 value, so a float32
 * is carried around as a regular `number` as well. This alias is only a documentation marker, it doesn't
 * change the value or its type.
 *
 * Encoding and decoding in JavaScript:
 * - decode (float32 bytes -> number): `new DataView(buffer).getFloat32(offset, true)` -
 *   see {@link BinaryIO.readFloat32} / {@link BinaryIO.readFloat32Array}
 * - encode (number -> float32 bytes): `new DataView(buffer).setFloat32(offset, value, true)` -
 *   see {@link BinaryIO.writeFloat32} / {@link BinaryIO.writeFloat32Array}
 * - rounding to float32 without a buffer: `Math.fround(value)` (the binary encoding rounds the same way)
 *
 * When a float32 ends up in a JSON file, it is serialized using the shortest decimal representation which
 * still parses back to a value rounding to the very same float32 (`Math.fround(Number(jsonValue))` gives
 * back the original value), so the JSON stays compact without losing any precision the binary format can
 * store - see {@link shortestFloat32} and {@link compactFloat32Values}.
 */
export type Float32 = number

/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/graphics/GraphicsFormat.h#L48
 */
export type ArxVector3 = {
  /**
   * X-axis is pointing left
   */
  x: Float32
  /**
   * Y-axis is pointing down
   */
  y: Float32
  /**
   * Z-axis is pointing towards you and is coming out of the screen
   */
  z: Float32
}

/**
 * Euler angles in degrees
 *
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/graphics/GraphicsFormat.h#L65
 */
export type ArxRotation = {
  /**
   * Euler angle defined in degrees
   */
  a: number
  /**
   * Euler angle defined in degrees
   */
  b: number
  /**
   * Euler angle defined in degrees
   */
  g: number
}

/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/animation/AnimationFormat.h#L63
 */
export type ArxQuaternion = {
  x: number
  y: number
  z: number
  w: number
}

export type DoubleOf<T> = [x: T, y: T]

export type TripleOf<T> = [x: T, y: T, z: T]

export type QuadrupleOf<T> = [x: T, y: T, z: T, w: T]
