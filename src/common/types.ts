/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/graphics/GraphicsFormat.h#L48
 */
export type ArxVector3 = {
  x: number
  y: number
  z: number
}

/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/graphics/GraphicsFormat.h#L65
 */
export type ArxRotation = {
  a: number
  b: number
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

export type TripleOf<T> = [T, T, T]

export type QuadrupleOf<T> = [T, T, T, T]
