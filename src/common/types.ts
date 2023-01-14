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

/**
 * Make the specified properties of a type optional
 *
 * @see https://stackoverflow.com/a/61108377/1806628
 */
export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

/**
 * Forces vscode (and hopefully other IDEs too) to show the computed properties
 * of the given type, which is helpful when chaining a lot of generics
 *
 * Expands only 1 level! To have the type expanded all the way use {@link RecursiveExpand}
 *
 * @see https://github.com/microsoft/vscode/issues/94679#issuecomment-755194161
 * @see https://stackoverflow.com/a/57683652/1806628
 */
export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never

/**
 * Forces vscode (and hopefully other IDEs too) to show the computed properties
 * of the given type, which is helpful when chaining a lot of generics
 *
 * Expands definitions all the way down. To expand only 1 level use {@link Expand}
 *
 * @see https://github.com/microsoft/vscode/issues/94679#issuecomment-755194161
 * @see https://stackoverflow.com/a/57683652/1806628
 */
export type RecursiveExpand<T> = T extends object
  ? T extends infer O
    ? { [K in keyof O]: RecursiveExpand<O[K]> }
    : never
  : T
