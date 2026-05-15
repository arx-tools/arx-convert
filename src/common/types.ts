/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/graphics/GraphicsFormat.h#L48
 */
export type ArxVector3 = {
  /**
   * X-axis is pointing left
   */
  x: number
  /**
   * Y-axis is pointing down
   */
  y: number
  /**
   * Z-axis is pointing towards you and is coming out of the screen
   */
  z: number
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
