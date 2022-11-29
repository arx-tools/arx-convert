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

export type ArxFormat = {
  meta: {
    type: string
    numberOfLeftoverBytes: number
  }
}
